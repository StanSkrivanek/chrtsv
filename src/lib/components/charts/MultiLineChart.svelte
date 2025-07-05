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
	// TODO: add props showValues to display values on top pf each point and hasTooltip to use tooltips or not
	// Props with explicit typing using Svelte 5 runes
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
		hasTooltip = true
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
		const yPadding = (yMax - yMin) * 0.1;

		// Scale functions
		const xScale = (idx: number) => margin.left + (idx / Math.max(1, xMax)) * width;
		const yScale = (val: number) =>
			margin.top +
			chartHeight -
			((val - yMin + yPadding) / (yMax - yMin + yPadding * 2)) * chartHeight;

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

		// Y axis ticks - show 5 ticks
		const yTickCount = 5;
		for (let i = 0; i <= yTickCount; i++) {
			const value = yMin + (i / yTickCount) * (yMax - yMin);
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

			// Format numbers
			if (value >= 1000000) {
				text.textContent = `${(value / 1000000).toFixed(1)}M`;
			} else if (value >= 1000) {
				text.textContent = `${(value / 1000).toFixed(1)}k`;
			} else {
				text.textContent = value.toFixed(1);
			}

			tick.appendChild(text);
			yAxis.appendChild(tick);
		}

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

			// Create the path
			if (pathPoints.length > 0) {
				pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
				for (let i = 1; i < pathPoints.length; i++) {
					pathData += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
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
		// const _ = xKey;
		// const __ = yKey;
		// const ___ = title;
		// const ____ = showLegend;
		// const _____ = height;

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
	<svg bind:this={chart} class="multi-line-chart" width="100%" {height}></svg>

	{#if showLegend && lines.length > 0}
		<div class="legend" transition:fade={{ duration: 300, delay: 200 }}>
			{#each lines as lineData, index}
				<div
					class="legend-item"
					class:hovered={hoveredLine === lineData.id}
					class:dimmed={hoveredLine !== null && hoveredLine !== lineData.id}
					role="button"
					tabindex="0"
					onmouseenter={() => (hoveredLine = lineData.id)}
					onmouseleave={() => (hoveredLine = null)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							hoveredLine = hoveredLine === lineData.id ? null : lineData.id;
						}
					}}
					transition:scale={{ duration: 200, delay: index * 50, easing: cubicInOut }}
				>
					<div
						class="legend-color"
						style="background-color: {lineData.color ||
							defaultColors[index % defaultColors.length]}"
					></div>
					<span class="legend-label">{lineData.label}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if tooltipVisible && tooltipData && hasTooltip}
		<div
			class="tooltip"
			style="left: {tooltipData.x}px; top: {tooltipData.y - 24}px;"
			transition:fly={{ y: -10, duration: 200, easing: cubicInOut }}
		>
			<div class="tooltip-content">
				<div class="tooltip-header" style="color: {tooltipData.color}">
					{tooltipData.lineLabel}
				</div>
				<div class="tooltip-body">
					<span class="tooltip-label">{tooltipData.label}</span>
					<span class="tooltip-value">{tooltipData.value}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.multi-line-chart-container {
		width: 100%;
		position: relative;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.multi-line-chart {
		width: 100%;
		min-height: 300px;
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
		padding: 4px 8px;
		border-radius: 4px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
	}

	.legend-item:hover {
		background: #e2e8f0;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
		background-color: #1e293b;
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
</style>
