<script lang="ts">
	// Import only what we need
	import { format, isValid, parse, parseISO } from 'date-fns';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly, scale } from 'svelte/transition';

	// Type definitions
	interface LineData {
		id: string;
		label: string;
		data: Array<Record<string, any>>;
		color: string;
	}

	interface TooltipData {
		x: number;
		y: number;
		value: any;
		label: string;
		lineLabel: string;
		color: string;
	}

	// Props with explicit typing
	let {
		lines = [],
		xKey = 'date',
		yKey = 'value',
		title = 'Multi Line Chart',
		showLegend = true,
		height = 400,
		dateFormat = 'MMM dd',
		inputDateFormat = null,
		showValues = false,
		hasTooltip = true,
		yTickCount = 5,
		doubleTicks = false,
		tension = 0.3,
		curveType = 'straight' as 'straight' | 'smooth'
	} = $props<{
		lines?: LineData[];
		xKey?: string;
		yKey?: string;
		title?: string;
		showLegend?: boolean;
		height?: number;
		dateFormat?: string;
		inputDateFormat?: string | null;
		showValues?: boolean;
		hasTooltip?: boolean;
		yTickCount?: number;
		doubleTicks?: boolean;
		tension?: number;
		curveType?: 'straight' | 'smooth';
	}>();

	// Internal state
	let chart: SVGElement;
	let mounted = $state(false);
	let width = $state(0);
	let chartHeight = $state(0);
	let tooltipVisible = $state(false);
	let tooltipData = $state<TooltipData | null>(null);
	let hoveredLine = $state<string | null>(null);
	let linesDrawn = $state(false);
	let focusedDataPoint = $state<{ lineId: string; dataIndex: number } | null>(null);
	let announcements = $state<string>('');
	let showDataTable = $state(false);

	// Accessibility helpers
	function announceToScreenReader(message: string) {
		announcements = message;
		// Clear after a delay to prevent stale announcements
		setTimeout(() => {
			announcements = '';
		}, 1000);
	}

	function generateChartDescription(): string {
		if (!lines || lines.length === 0) return 'Empty chart';

		const lineCount = lines.length;
		const dataPointCount = lines[0]?.data?.length || 0;
		const hasNegativeValues = lines.some((line: LineData) =>
			line.data.some((point: Record<string, any>) => Number(point[yKey]) < 0)
		);

		return `Line chart with ${lineCount} data series and ${dataPointCount} data points${hasNegativeValues ? ', including negative values' : ''}. Use Tab to navigate legend items, Enter or Space to highlight lines, and Escape to clear highlights.`;
	}

	function getDataTableSummary(): string {
		if (!lines || lines.length === 0) return '';

		const totalPoints = lines.reduce((sum: number, line: LineData) => sum + line.data.length, 0);
		const minValue = Math.min(
			...lines.flatMap((line: LineData) =>
				line.data.map((point: Record<string, any>) => Number(point[yKey]))
			)
		);
		const maxValue = Math.max(
			...lines.flatMap((line: LineData) =>
				line.data.map((point: Record<string, any>) => Number(point[yKey]))
			)
		);

		return `Data table summary: ${lines.length} series, ${totalPoints} total data points, values range from ${minValue} to ${maxValue}`;
	}

	// Chart dimensions
	const margin = { top: 20, right: 20, bottom: 40, left: 60 };

	// Color palette for lines (fallback if colors not provided)
	const defaultColors = [
		'#3b82f6', // blue
		'#ef4444', // red
		'#10b981', // green
		'#f59e0b', // yellow
		'#8b5cf6' // purple
	];

	// Helper function to parse dates from various formats
	function parseDate(dateString: string): Date | null {
		if (!dateString) return null;

		// Try parsing with provided input format first
		if (inputDateFormat) {
			try {
				const parsed = parse(dateString, inputDateFormat, new Date());
				if (isValid(parsed)) return parsed;
			} catch (e) {
				// Continue to other parsing methods
			}
		}

		// Try parsing ISO format
		try {
			const parsed = parseISO(dateString);
			if (isValid(parsed)) return parsed;
		} catch (e) {
			// Continue to other parsing methods
		}

		// Try parsing with native Date constructor
		try {
			const parsed = new Date(dateString);
			if (isValid(parsed)) return parsed;
		} catch (e) {
			// Continue
		}

		return null;
	}

	// Helper function to format dates for display
	function formatDateForDisplay(dateString: string): string {
		const date = parseDate(dateString);
		if (date) {
			return format(date, dateFormat);
		}
		// Fallback to original string if parsing fails
		return String(dateString).substring(0, 10);
	}

	// Function to get all unique x values across all lines
	function getAllXValues(): string[] {
		const xValues: string[] = [];
		const seen = new Set<string>();

		// Get the first line to establish the order
		if (lines.length > 0) {
			lines[0].data.forEach((d: Record<string, any>) => {
				const value = String(d[xKey]);
				if (!seen.has(value)) {
					seen.add(value);
					xValues.push(value);
				}
			});
		}

		// Add any additional unique values from other lines
		lines.forEach((line: LineData) => {
			line.data.forEach((d: Record<string, any>) => {
				const value = String(d[xKey]);
				if (!seen.has(value)) {
					seen.add(value);
					xValues.push(value);
				}
			});
		});

		// Sort dates chronologically if they are dates
		const firstValue = xValues[0];
		if (firstValue && parseDate(firstValue)) {
			return xValues.sort((a, b) => {
				const dateA = parseDate(a);
				const dateB = parseDate(b);
				if (dateA && dateB) {
					return dateA.getTime() - dateB.getTime();
				}
				return 0;
			});
		}

		return xValues;
	}

	// Function to get all y values for scaling
	function getAllYValues(): number[] {
		const yValues: number[] = [];
		lines.forEach((line: LineData) => {
			line.data.forEach((d: Record<string, any>) => {
				yValues.push(Number(d[yKey]));
			});
		});
		return yValues;
	}

	/**
	 * Create smooth curve using optimized Catmull-Rom spline interpolation
	 * Based on the improved algorithm from the previous implementation
	 * @param points Array of coordinate points
	 * @returns SVG path string
	 */
	const createSmoothPath = (points: Array<{ x: number; y: number }>): string => {
		if (points.length < 2) return '';

		// Start path at first point
		const path = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];

		// For 2 points, use a proper cubic Bezier curve instead of straight line
		if (points.length === 2) {
			const start = points[0];
			const end = points[1];
			const dx = end.x - start.x;
			const midTension = Number(tension) * 0.5;
			const cp1x = start.x + dx * midTension;
			const cp1y = start.y;
			const cp2x = end.x - dx * midTension;
			const cp2y = end.y;
			return `M ${start.x.toFixed(2)},${start.y.toFixed(2)} C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${end.x.toFixed(2)},${end.y.toFixed(2)}`;
		}

		// Optimized tension for natural curves - reduces overshoot
		const optimizedTension = Math.max(0, Math.min(1, Number(tension) || 0)) * 0.5;

		// Generate smooth curve segments using Catmull-Rom spline
		for (let i = 0; i < points.length - 1; i++) {
			// Get control points with proper boundary handling
			const p0 = i === 0 ? points[0] : points[i - 1];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = i === points.length - 2 ? points[points.length - 1] : points[i + 2];

			// Calculate Catmull-Rom control points with optimized tension
			// This produces more natural curves without overshoot
			const cp1x = p1.x + (p2.x - p0.x) * optimizedTension;
			const cp1y = p1.y + (p2.y - p0.y) * optimizedTension;
			const cp2x = p2.x - (p3.x - p1.x) * optimizedTension;
			const cp2y = p2.y - (p3.y - p1.y) * optimizedTension;

			// Add cubic Bezier curve segment
			path.push(
				`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
			);
		}

		return path.join(' ');
	};

	// Function to re-render chart when data changes
	function renderChart() {
		if (!mounted || !chart || lines.length === 0) return;

		// Clear previous chart
		while (chart.firstChild) {
			chart.removeChild(chart.firstChild);
		}

		// Calculate dimensions
		const svgWidth = chart.clientWidth;
		const svgHeight = height;
		width = svgWidth - margin.left - margin.right;
		chartHeight = svgHeight - margin.top - margin.bottom;

		// Get all unique x values and y values
		const allXValues = getAllXValues();
		const allYValues = getAllYValues();

		if (allXValues.length === 0 || allYValues.length === 0) return;

		const xMin = 0;
		const xMax = allXValues.length - 1;
		const yMin = Math.min(...allYValues);
		const yMax = Math.max(...allYValues);

		// Handle padding for negative values properly
		const yRange = yMax - yMin;
		const yPadding = yRange * 0.1;
		const yMinWithPadding = yMin - yPadding;
		const yMaxWithPadding = yMax + yPadding;
		const hasNegativeValues = yMin < 0;

		// Scale functions
		const xScale = (idx: number) => margin.left + (idx / Math.max(1, xMax)) * width;
		const yScale = (val: number) =>
			margin.top +
			chartHeight -
			((val - yMinWithPadding) / (yMaxWithPadding - yMinWithPadding)) * chartHeight;

		// Create SVG elements
		const mainG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

		// Create axes
		const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		xAxis.setAttribute('class', 'x-axis');
		xAxis.setAttribute('transform', `translate(0, ${margin.top + chartHeight})`);

		// X axis line
		const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		xAxisLine.setAttribute('x1', String(margin.left));
		xAxisLine.setAttribute('y1', '0');
		xAxisLine.setAttribute('x2', String(margin.left + width));
		xAxisLine.setAttribute('y2', '0');
		xAxisLine.setAttribute('stroke', '#94a3b8');
		xAxis.appendChild(xAxisLine);

		// X axis ticks - show 5-7 ticks depending on data size
		const tickInterval = Math.max(1, Math.ceil(allXValues.length / Math.min(7, allXValues.length)));
		for (let i = 0; i < allXValues.length; i += tickInterval) {
			const tick = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			tick.setAttribute('transform', `translate(${xScale(i)}, 0)`);

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('y2', '6');
			line.setAttribute('stroke', '#94a3b8');
			tick.appendChild(line);

			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('y', '20');
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('fill', '#64748b');
			text.setAttribute('font-size', '12px');

			// Format date labels using date-fns
			const value = allXValues[i];
			const parsedDate = parseDate(value);
			if (parsedDate) {
				text.textContent = formatDateForDisplay(value);
			} else {
				text.textContent = String(value).substring(0, 10); // Truncate long labels
			}

			tick.appendChild(text);
			xAxis.appendChild(tick);
		}

		// Y axis
		const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		yAxis.setAttribute('class', 'y-axis');
		yAxis.setAttribute('transform', `translate(${margin.left}, 0)`);

		// Y axis line
		const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		yAxisLine.setAttribute('x1', '0');
		yAxisLine.setAttribute('y1', String(margin.top));
		yAxisLine.setAttribute('x2', '0');
		yAxisLine.setAttribute('y2', String(margin.top + chartHeight));
		yAxisLine.setAttribute('stroke', '#94a3b8');
		yAxis.appendChild(yAxisLine);

		// Add zero line if there are negative values
		if (hasNegativeValues && yMinWithPadding < 0 && yMaxWithPadding > 0) {
			const zeroY = yScale(0);
			const zeroLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			zeroLine.setAttribute('x1', '0');
			zeroLine.setAttribute('y1', String(zeroY));
			zeroLine.setAttribute('x2', String(width));
			zeroLine.setAttribute('y2', String(zeroY));
			zeroLine.setAttribute('stroke', '#6b7280');
			zeroLine.setAttribute('stroke-width', '1');
			zeroLine.setAttribute('opacity', '0.8');
			yAxis.appendChild(zeroLine);
		}

		// Y axis ticks - automatically double tick count for negative values if enabled
		const effectiveTickCount = hasNegativeValues && doubleTicks ? yTickCount * 2 : yTickCount;
		const tickValues = [];

		// Generate regular tick values
		for (let i = 0; i <= effectiveTickCount; i++) {
			const value =
				yMinWithPadding + (i / effectiveTickCount) * (yMaxWithPadding - yMinWithPadding);
			tickValues.push(value);
		}

		// Always add zero tick if we have negative values (might be redundant but ensures it's there)
		if (hasNegativeValues && yMinWithPadding < 0 && yMaxWithPadding > 0) {
			tickValues.push(0);
		}

		// Sort tick values and remove duplicates (with small tolerance for floating point)
		const uniqueTickValues = tickValues
			.filter((value, index, array) => {
				// Keep value if it's the first occurrence or sufficiently different from previous values
				return !array
					.slice(0, index)
					.some(
						(prevValue) => Math.abs(value - prevValue) < (yMaxWithPadding - yMinWithPadding) * 0.02
					);
			})
			.sort((a, b) => b - a);

		uniqueTickValues.forEach((value) => {
			const yPos = yScale(value);

			const tick = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			tick.setAttribute('transform', `translate(0, ${yPos})`);

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x2', '-6');
			line.setAttribute('stroke', '#94a3b8');
			tick.appendChild(line);

			// Add grid lines
			const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			gridLine.setAttribute('x1', '0');
			gridLine.setAttribute('y1', '0');
			gridLine.setAttribute('x2', String(width));
			gridLine.setAttribute('y2', '0');
			gridLine.setAttribute('stroke', '#e2e8f0');
			gridLine.setAttribute('stroke-dasharray', '4,4');
			tick.appendChild(gridLine);

			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', '-10');
			text.setAttribute('y', '4');
			text.setAttribute('text-anchor', 'end');
			text.setAttribute('fill', '#64748b');
			text.setAttribute('font-size', '12px');

			// Special styling for zero tick
			if (value === 0) {
				text.setAttribute('fill', '#374151');
				text.setAttribute('font-weight', 'bold');
			}

			// Format numbers - handle negative values
			if (Math.abs(value) >= 1000000) {
				text.textContent = `${(value / 1000000).toFixed(1)}M`;
			} else if (Math.abs(value) >= 1000) {
				text.textContent = `${(value / 1000).toFixed(1)}k`;
			} else {
				text.textContent = value.toFixed(1);
			}

			tick.appendChild(text);
			yAxis.appendChild(tick);
		});

		// Create lines for each dataset
		lines.forEach((lineData: LineData, lineIndex: number) => {
			const color = lineData.color || defaultColors[lineIndex % defaultColors.length];
			const isHovered = hoveredLine === lineData.id;
			const isOtherHovered = hoveredLine !== null && hoveredLine !== lineData.id;

			// Create line path
			const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			let pathData = '';

			// Build path by matching x values
			const pathPoints: Array<{ x: number; y: number }> = [];
			allXValues.forEach((xValue, xIndex) => {
				const dataPoint = lineData.data.find(
					(d: Record<string, any>) => String(d[xKey]) === xValue
				);
				if (dataPoint) {
					const x = xScale(xIndex);
					const y = yScale(Number(dataPoint[yKey]));
					pathPoints.push({ x, y });
				}
			});

			// Create the path - use smooth or straight based on curveType
			if (pathPoints.length > 0) {
				if (curveType === 'smooth' && Number(tension) > 0) {
					pathData = createSmoothPath(pathPoints);
				} else {
					// Create straight line path
					pathData = `M ${pathPoints[0].x.toFixed(2)} ${pathPoints[0].y.toFixed(2)}`;
					for (let i = 1; i < pathPoints.length; i++) {
						pathData += ` L ${pathPoints[i].x.toFixed(2)} ${pathPoints[i].y.toFixed(2)}`;
					}
				}
			}

			line.setAttribute('d', pathData);
			line.setAttribute('fill', 'none');
			line.setAttribute('stroke', color);
			line.setAttribute('stroke-width', isHovered ? '3' : '2');
			line.setAttribute('opacity', isOtherHovered ? '0.3' : '1');
			line.setAttribute('class', `line-${lineData.id}`);

			// Add smooth transitions for hover effects only
			line.style.transition = 'stroke-width 0.3s ease, opacity 0.3s ease';

			// Add line drawing animation only on initial load
			if (!linesDrawn) {
				const pathLength = line.getTotalLength();
				line.style.strokeDasharray = pathLength.toString();
				line.style.strokeDashoffset = pathLength.toString();

				// Animate line drawing
				setTimeout(() => {
					line.style.transition =
						'stroke-dashoffset 1s ease-in-out, stroke-width 0.3s ease, opacity 0.3s ease';
					line.style.strokeDashoffset = '0';
				}, lineIndex * 200);
			}

			// Add dots at data points
			const dots = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			dots.setAttribute('class', `data-points-${lineData.id}`);

			// Add value labels group if showValues is true
			const valueLabels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			valueLabels.setAttribute('class', `value-labels-${lineData.id}`);

			allXValues.forEach((xValue, xIndex) => {
				const dataPoint = lineData.data.find(
					(d: Record<string, any>) => String(d[xKey]) === xValue
				);
				if (dataPoint) {
					const x = xScale(xIndex);
					const y = yScale(Number(dataPoint[yKey]));

					const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
					circle.setAttribute('cx', String(x));
					circle.setAttribute('cy', String(y));
					circle.setAttribute('r', '4');
					circle.setAttribute('fill', '#ffffff');
					circle.setAttribute('stroke', color);
					circle.setAttribute('stroke-width', '2');
					circle.setAttribute('opacity', isOtherHovered ? '0.3' : '1');
					circle.setAttribute('class', 'data-point');

					// Add smooth transitions for dots
					circle.style.transition = 'opacity 0.3s ease, transform 0.2s ease';

					// Initial scale animation only on first load
					if (!linesDrawn) {
						circle.style.transform = 'scale(0)';
						setTimeout(
							() => {
								circle.style.transform = 'scale(1)';
							},
							lineIndex * 200 + xIndex * 50
						);
					}

					// Add interaction only if hasTooltip is true
					if (hasTooltip) {
						circle.addEventListener('mouseenter', () => {
							const xValue = String(dataPoint[xKey]);
							const parsedDate = parseDate(xValue);
							const displayLabel = parsedDate ? formatDateForDisplay(xValue) : xValue;

							tooltipData = {
								x,
								y,
								value: dataPoint[yKey],
								label: displayLabel,
								lineLabel: lineData.label,
								color
							};
							tooltipVisible = true;
							hoveredLine = lineData.id;

							// Simple hover effect
							circle.setAttribute('r', '6');
							circle.setAttribute('fill', color);
						});

						circle.addEventListener('mouseleave', () => {
							tooltipVisible = false;
							hoveredLine = null;

							// Restore circle style
							circle.setAttribute('r', '4');
							circle.setAttribute('fill', '#ffffff');
						});
					}

					dots.appendChild(circle);

					// Add value labels if showValues is true
					if (showValues) {
						const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
						valueLabel.setAttribute('x', String(x));
						valueLabel.setAttribute('y', String(y - 10));
						valueLabel.setAttribute('text-anchor', 'middle');
						valueLabel.setAttribute('fill', color);
						valueLabel.setAttribute('font-size', '11px');
						valueLabel.setAttribute('font-weight', '600');
						valueLabel.setAttribute('opacity', isOtherHovered ? '0.3' : '1');
						valueLabel.setAttribute('class', 'value-label');

						// Format the value
						const value = Number(dataPoint[yKey]);
						if (value >= 1000000) {
							valueLabel.textContent = `${(value / 1000000).toFixed(1)}M`;
						} else if (value >= 1000) {
							valueLabel.textContent = `${(value / 1000).toFixed(1)}k`;
						} else {
							valueLabel.textContent = value.toString();
						}

						// Add smooth transitions for value labels
						valueLabel.style.transition = 'opacity 0.3s ease';

						// Initial fade-in animation only on first load
						if (!linesDrawn) {
							valueLabel.style.opacity = '0';
							setTimeout(
								() => {
									valueLabel.style.opacity = isOtherHovered ? '0.3' : '1';
								},
								lineIndex * 200 + xIndex * 50 + 100
							);
						}

						valueLabels.appendChild(valueLabel);
					}
				}
			});

			mainG.appendChild(line);
			mainG.appendChild(dots);
			if (showValues) {
				mainG.appendChild(valueLabels);
			}
		});

		// Add chart title
		const titleElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		titleElem.setAttribute('x', String(margin.left + width / 2));
		titleElem.setAttribute('y', String(margin.top - 5));
		titleElem.setAttribute('text-anchor', 'middle');
		titleElem.setAttribute('fill', '#1e293b');
		titleElem.setAttribute('font-size', '16px');
		titleElem.setAttribute('font-weight', 'bold');
		titleElem.setAttribute('id', 'chart-title-svg');
		titleElem.setAttribute('aria-hidden', 'true'); // Hidden since we have a separate title for screen readers
		titleElem.textContent = title;

		// Add everything to the chart
		mainG.appendChild(xAxis);
		mainG.appendChild(yAxis);
		chart.appendChild(mainG);
		chart.appendChild(titleElem);

		// Mark lines as drawn after initial animation
		if (!linesDrawn) {
			setTimeout(
				() => {
					linesDrawn = true;
				},
				lines.length * 200 + 500
			);
		}
	}

	// Use onMount to ensure DOM is ready
	onMount(() => {
		mounted = true;
		renderChart();

		// Add resize handler
		const resizeObserver = new ResizeObserver(() => {
			renderChart();
		});

		resizeObserver.observe(chart);

		return () => {
			resizeObserver.disconnect();
		};
	});

	// Watch for data changes
	$effect(() => {
		if (lines && mounted) {
			renderChart();
		}
	});
	// Watch for prop changes
	$effect(() => {
		// Re-render when any of these props change
		const _ = [tension, curveType, xKey, yKey, title, showLegend, height];

		if (mounted) {
			renderChart();
		}
	});

	// Watch for hover state changes - only update opacity and stroke width
	$effect(() => {
		if (hoveredLine !== null && mounted && chart) {
			const allLines = chart.querySelectorAll('path[class*="line-"]');
			const allDots = chart.querySelectorAll('.data-point');
			const allValueLabels = chart.querySelectorAll('.value-label');

			allLines.forEach((line: Element) => {
				const pathElement = line as SVGPathElement;
				const lineId = pathElement.getAttribute('class')?.match(/line-(\w+)/)?.[1];

				if (lineId === hoveredLine) {
					pathElement.setAttribute('stroke-width', '3');
					pathElement.setAttribute('opacity', '1');
				} else {
					pathElement.setAttribute('stroke-width', '2');
					pathElement.setAttribute('opacity', '0.3');
				}
			});

			allDots.forEach((dot: Element) => {
				const circleElement = dot as SVGCircleElement;
				const parentElement = circleElement.parentElement as SVGElement | null;
				const isHoveredLineDot = parentElement
					?.getAttribute('class')
					?.includes(`data-points-${hoveredLine}`);

				if (!isHoveredLineDot) {
					circleElement.setAttribute('opacity', '0.3');
				} else {
					circleElement.setAttribute('opacity', '1');
				}
			});

			// Update value labels opacity if showValues is true
			if (showValues) {
				allValueLabels.forEach((label: Element) => {
					const labelElement = label as SVGTextElement;
					const parentElement = labelElement.parentElement as SVGElement | null;
					const isHoveredLineLabel = parentElement
						?.getAttribute('class')
						?.includes(`value-labels-${hoveredLine}`);

					if (!isHoveredLineLabel) {
						labelElement.setAttribute('opacity', '0.3');
					} else {
						labelElement.setAttribute('opacity', '1');
					}
				});
			}
		} else if (hoveredLine === null && mounted && chart) {
			// Restore all elements
			const allLines = chart.querySelectorAll('path[class*="line-"]');
			const allDots = chart.querySelectorAll('.data-point');
			const allValueLabels = chart.querySelectorAll('.value-label');

			allLines.forEach((line: Element) => {
				const pathElement = line as SVGPathElement;
				pathElement.setAttribute('stroke-width', '2');
				pathElement.setAttribute('opacity', '1');
			});

			allDots.forEach((dot: Element) => {
				const circleElement = dot as SVGCircleElement;
				circleElement.setAttribute('opacity', '1');
			});

			if (showValues) {
				allValueLabels.forEach((label: Element) => {
					const labelElement = label as SVGTextElement;
					labelElement.setAttribute('opacity', '1');
				});
			}
		}
	});
</script>

<div class="multi-line-chart-container">
	<!-- Screen reader announcements -->
	<div class="sr-only" aria-live="polite" aria-atomic="true">
		{announcements}
	</div>

	<!-- Chart description for screen readers -->
	<div id="chart-description" class="sr-only">
		{generateChartDescription()}
	</div>

	<!-- Main chart -->
	<div class="chart-container">
		<svg
			bind:this={chart}
			class="multi-line-chart"
			width="100%"
			{height}
			role="img"
			aria-label="Line chart: {title}"
			aria-describedby="chart-description"
		></svg>

		<!-- Hidden interactive element for keyboard navigation -->
		<button
			class="chart-keyboard-handler sr-only"
			aria-label="Chart keyboard controls. Press Escape to clear highlights."
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					hoveredLine = null;
					focusedDataPoint = null;
					announceToScreenReader('Chart cleared, all lines visible');
				}
			}}
		>
			Chart Controls
		</button>
	</div>

	<!-- Hidden chart title for screen readers -->
	<h2 id="chart-title" class="sr-only">{title}</h2>

	{#if showLegend && lines.length > 0}
		<div
			class="legend"
			role="group"
			aria-label="Chart legend - data series controls"
			transition:fade={{ duration: 300, delay: 200 }}
		>
			{#each lines as lineData, index}
				{@const color = lineData.color || defaultColors[index % defaultColors.length]}
				{@const isHighlighted = hoveredLine === lineData.id}
				{@const isDimmed = hoveredLine !== null && hoveredLine !== lineData.id}

				<div
					class="legend-item"
					class:hovered={isHighlighted}
					class:dimmed={isDimmed}
					role="button"
					tabindex="0"
					aria-label="Toggle highlight for {lineData.label} series"
					aria-pressed={isHighlighted}
					aria-describedby="legend-instructions"
					onmouseenter={() => {
						hoveredLine = lineData.id;
						announceToScreenReader(`Highlighting ${lineData.label} series`);
					}}
					onmouseleave={() => {
						hoveredLine = null;
						announceToScreenReader('All series visible');
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							const newState = hoveredLine === lineData.id ? null : lineData.id;
							hoveredLine = newState;
							announceToScreenReader(
								newState ? `Highlighting ${lineData.label} series` : 'All series visible'
							);
						} else if (e.key === 'Escape') {
							hoveredLine = null;
							announceToScreenReader('All series visible');
						}
					}}
					onfocus={() => {
						// Optional: could announce on focus
					}}
					transition:scale={{ duration: 200, delay: index * 50, easing: cubicInOut }}
				>
					<div class="legend-color" style="background-color: {color}" aria-hidden="true"></div>
					<span class="legend-label">{lineData.label}</span>
				</div>
			{/each}
		</div>

		<!-- Instructions for screen readers -->
		<div id="legend-instructions" class="sr-only">
			Press Enter or Space to highlight a data series, Escape to show all series
		</div>
	{/if}

	{#if tooltipVisible && tooltipData && hasTooltip}
		<div
			class="tooltip"
			style="left: {tooltipData.x}px; top: {tooltipData.y - 24}px;"
			role="tooltip"
			aria-live="polite"
			transition:fly={{ y: -10, duration: 200, easing: cubicInOut }}
		>
			<div class="tooltip-content">
				<div class="tooltip-header" style="color: #FFF">
					{tooltipData.lineLabel}
				</div>
				<div class="tooltip-body">
					<span class="tooltip-label">{tooltipData.label}</span>
					<span class="tooltip-value">{tooltipData.value}</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Data table toggle -->
	<div class="chart-controls">
		<button
			class="data-table-toggle"
			onclick={() => {
				showDataTable = !showDataTable;
				announceToScreenReader(showDataTable ? 'Data table opened' : 'Data table closed');
			}}
			aria-expanded={showDataTable}
			aria-controls="data-table"
		>
			{showDataTable ? 'Hide' : 'Show'} Data Table
		</button>
	</div>

	<!-- Accessible data table -->
	{#if showDataTable}
		<div
			id="data-table"
			class="data-table-container"
			aria-label="Chart data in table format"
			transition:fade={{ duration: 300 }}
		>
			<div class="data-table-summary sr-only">
				{getDataTableSummary()}
			</div>

			<table class="data-table">
				<caption class="sr-only">
					{title} - Detailed data table with {lines.length} data series
				</caption>
				<thead>
					<tr>
						<th scope="col">{xKey}</th>
						{#each lines as lineData}
							<th scope="col">{lineData.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if lines.length > 0}
						{#each lines[0].data as _, rowIndex}
							<tr>
								<th scope="row">{lines[0].data[rowIndex][xKey]}</th>
								{#each lines as lineData}
									<td>
										{lineData.data[rowIndex] ? lineData.data[rowIndex][yKey] : 'N/A'}
									</td>
								{/each}
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	/* Screen reader only content */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.multi-line-chart-container {
		width: 100%;
		position: relative;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.chart-container {
		position: relative;
		width: 100%;
	}

	.chart-keyboard-handler {
		position: absolute;
		top: 0;
		left: 0;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font-size: 0;
		line-height: 0;
	}

	.chart-keyboard-handler:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		background: rgba(59, 130, 246, 0.1);
		border-radius: 4px;
		padding: 4px;
		font-size: 12px;
		line-height: 1.2;
		color: #3b82f6;
	}

	.multi-line-chart {
		width: 100%;
		min-height: 300px;
		outline: none;
	}

	/* Smooth transitions for SVG elements */
	:global(.data-point) {
		transition:
			opacity 0.3s ease,
			transform 0.2s ease;
		transform-origin: center;
	}

	:global(.value-label) {
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 16px;
		padding: 12px;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding: 8px 12px;
		border-radius: 4px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
		border: 2px solid transparent;
		outline: none;
	}

	.legend-item:hover {
		background: #e2e8f0;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.legend-item:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.legend-item.hovered {
		background: #e2e8f0;
		transform: translateY(-2px) scale(1.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.legend-item.dimmed {
		opacity: 0.5;
		transform: scale(0.95);
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid #ffffff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.legend-item:hover .legend-color {
		transform: scale(1.1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.legend-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
		transition: color 0.2s ease;
	}

	.legend-item:hover .legend-label {
		color: #1f2937;
	}

	.tooltip {
		position: absolute;
		transform: translate(-50%, -100%);
		pointer-events: none;
		z-index: 10;
	}

	.tooltip-content {
		background-color: oklch(0.279 0.041 260.031);
		color: white;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 100px;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.2s ease;
	}

	.tooltip-header {
		font-weight: 600;
		margin-bottom: 4px;
		font-size: 13px;
		transition: color 0.2s ease;
	}

	.tooltip-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.tooltip-label {
		font-weight: 500;
		margin-right: 8px;
	}

	.tooltip-value {
		font-weight: 700;
		font-size: 13px;
	}

	/* Data table styles */
	.chart-controls {
		margin-top: 16px;
		display: flex;
		justify-content: flex-end;
	}

	.data-table-toggle {
		background: oklch(65.065% 0.02343 259.237);
		color: white;
		border: none;
		padding: 8px 16px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s ease;
		outline: none;
	}

	.data-table-toggle:hover {
		background: oklch(15.615% 0.0257 25.476);
		/* transform: translateY(-1px); */
	}

	.data-table-toggle:focus {
		box-shadow: 0 0 0 2px oklab(62.31% -0.03321 -0.18515 / 0.5);
	}

	.data-table-container {
		margin-top: 16px;
		padding: 16px;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		max-height: 400px;
		overflow-y: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.data-table th,
	.data-table td {
		padding: 8px 12px;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	.data-table th {
		background: #f1f5f9;
		font-weight: 600;
		color: #1e293b;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.data-table th[scope='row'] {
		background: #f8fafc;
		font-weight: 600;
		color: #374151;
	}

	.data-table tbody tr:hover {
		background: #f1f5f9;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.legend {
			flex-direction: column;
			gap: 8px;
		}

		.legend-item {
			padding: 6px 10px;
		}

		.data-table-container {
			font-size: 12px;
		}

		.data-table th,
		.data-table td {
			padding: 6px 8px;
		}
	}
</style>
