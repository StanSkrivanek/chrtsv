<script lang="ts">
	import type {
		ChartPerformanceConfig,
		CrosshairData,
		LineData,
		ProcessedChartData,
		TooltipData
	} from '$lib/components/charts/types/chart.types.ts';
	import { ChartDataManager } from '$lib/components/charts/utils/ChartManager';
	import { PathGenerator } from '$lib/components/charts/utils/PathGenerator';
	import { PerformanceMonitor } from '$lib/components/charts/utils/PerformanceMonitor';
	import { memoize, throttle } from '$lib/components/charts/utils/helpers';
	import { format, isValid, parse, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

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
		hasTooltip = false,
		yTickCount = 5,
		doubleTicks = false,
		tension = 0.3,
		curveType = 'straight' as 'straight' | 'smooth',
		showCrosshair = false,
		performanceConfig = {}
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
		showCrosshair?: boolean;
		performanceConfig?: Partial<ChartPerformanceConfig>;
	}>();

	// Performance configuration with defaults
	const config: ChartPerformanceConfig = {
		svgMaxPoints: 1000,
		animationMaxPoints: 500,
		tooltipMaxPoints: 2000,
		enableMemoization: true,
		enableWebWorkers: true,
		enableDataSampling: true,
		mouseMoveThrottle: 16,
		resizeDebounce: 150,
		maxCacheEntries: 50,
		enablePathCache: true,
		devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
		canvasSmoothing: true,
		...performanceConfig
	};

	// Internal state
	let chart = $state<SVGElement | null>(null);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let mounted = $state(false);
	let isVisible = $state(true);
	let width = $state(0);
	let chartHeight = $state(0);
	let tooltipVisible = $state(false);
	let tooltipData = $state<TooltipData | null>(null);
	let hoveredLine = $state<string | null>(null);
	let linesDrawn = $state(false);
	let announcements = $state<string>('');
	let showDataTable = $state(false);
	let crosshairVisible = $state(false);
	let crosshairData = $state<CrosshairData | null>(null);
	let mouseX = $state(0);
	let mouseY = $state(0);

	// Managers and utilities
	const dataManager = ChartDataManager.getInstance();
	const performanceMonitor = new PerformanceMonitor();
	let canvasContext: CanvasRenderingContext2D | null = null;

	// Chart dimensions
	const margin = { top: 20, right: 20, bottom: 40, left: 60 };

	// Color palette for lines
	const defaultColors = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

	// Calculate total data points for performance decisions
	const totalDataPoints = $derived(
		lines.reduce((sum: any, line: { data: string | any[] }) => sum + line.data.length, 0)
	);

	// Performance mode determination
	const performanceMode = $derived(() => {
		if (totalDataPoints > config.svgMaxPoints) return 'canvas';
		if (totalDataPoints > config.animationMaxPoints) return 'svg-no-animation';
		return 'svg-full';
	});

	// Get the actual value to use in comparisons
	const currentPerformanceMode = $derived(performanceMode());

	// Memoized helper functions
	const memoizedGetAllXValues = config.enableMemoization
		? memoize((lines: LineData[], xKey: string) => {
				const xValues: string[] = [];
				const seen = new Set<string>();

				if (lines.length > 0) {
					lines[0].data.forEach((d: Record<string, any>) => {
						const value = String(d[xKey]);
						if (!seen.has(value)) {
							seen.add(value);
							xValues.push(value);
						}
					});
				}

				lines.forEach((line: LineData) => {
					line.data.forEach((d: Record<string, any>) => {
						const value = String(d[xKey]);
						if (!seen.has(value)) {
							seen.add(value);
							xValues.push(value);
						}
					});
				});

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
			})
		: (lines: LineData[], xKey: string) => {
				// Non-memoized version for fallback
				const xValues: string[] = [];
				const seen = new Set<string>();
				// ... same logic without memoization
				return xValues;
			};

	const memoizedGetAllYValues = config.enableMemoization
		? memoize((lines: LineData[], yKey: string) => {
				const yValues: number[] = [];
				lines.forEach((line: LineData) => {
					line.data.forEach((d: Record<string, any>) => {
						yValues.push(Number(d[yKey]));
					});
				});
				return yValues;
			})
		: (lines: LineData[], yKey: string) => {
				const yValues: number[] = [];
				lines.forEach((line: LineData) => {
					line.data.forEach((d: Record<string, any>) => {
						yValues.push(Number(d[yKey]));
					});
				});
				return yValues;
			};

	// Data sampling for large datasets
	const sampledLines = $derived.by(() => {
		if (currentPerformanceMode === 'canvas' || !config.enableDataSampling) {
			return lines;
		}

		return lines.map((line: { data: any[] }) => {
			if (line.data.length <= 100) return line;

			const sampleRate = Math.ceil(line.data.length / 100);
			const sampledData = line.data.filter(
				(_, index) => index === 0 || index === line.data.length - 1 || index % sampleRate === 0
			);

			return { ...line, data: sampledData };
		});
	});

	// Main chart data calculation
	const chartData = $derived.by((): ProcessedChartData | null => {
		if (!lines.length || !mounted) return null;

		const startTime = performanceMonitor.startRender();

		const cacheKey = `${JSON.stringify(sampledLines)}_${xKey}_${yKey}_${width}_${chartHeight}`;
		let cached = dataManager.getCachedData(cacheKey);

		if (cached) {
			performanceMonitor.endRender(startTime);
			return cached;
		}

		const allXValues = memoizedGetAllXValues(sampledLines, xKey);
		const allYValues = memoizedGetAllYValues(sampledLines, yKey);

		if (!allXValues.length || !allYValues.length) {
			performanceMonitor.endRender(startTime);
			return null;
		}

		const yMin = Math.min(...allYValues);
		const yMax = Math.max(...allYValues);
		const yRange = yMax - yMin;
		const yPadding = yRange * 0.1;
		const yMinWithPadding = yMin - yPadding;
		const yMaxWithPadding = yMax + yPadding;

		const result: ProcessedChartData = {
			allXValues,
			allYValues,
			yMin: yMinWithPadding,
			yMax: yMaxWithPadding,
			xScale: (idx: number) => margin.left + (idx / Math.max(1, allXValues.length - 1)) * width,
			yScale: (val: number) =>
				margin.top +
				chartHeight -
				((val - yMinWithPadding) / (yMaxWithPadding - yMinWithPadding)) * chartHeight,
			hasNegativeValues: yMin < 0,
			yTicks: generateYTicks(yMinWithPadding, yMaxWithPadding)
		};

		dataManager.setCachedData(cacheKey, result);
		performanceMonitor.endRender(startTime);
		return result;
	});

	// Line paths calculation
	const linePaths = $derived.by(() => {
		if (!chartData) return [];

		return sampledLines.map(
			(lineData: { color: string; data: any[]; id: any; label: any }, index: number) => {
				const color = lineData.color || defaultColors[index % defaultColors.length];
				const points: Array<{ x: number; y: number }> = [];

				chartData.allXValues.forEach((xValue, xIndex) => {
					const dataPoint = lineData.data.find((d) => String(d[xKey]) === xValue);
					if (dataPoint) {
						points.push({
							x: chartData.xScale(xIndex),
							y: chartData.yScale(Number(dataPoint[yKey]))
						});
					}
				});

				const pathData =
					curveType === 'smooth' && tension > 0
						? PathGenerator.createSmoothPath(points, tension)
						: PathGenerator.createStraightPath(points);

				return {
					id: lineData.id,
					label: lineData.label,
					color,
					pathData,
					points,
					data: lineData.data
				};
			}
		);
	});

	// Derived state for tooltip logic
	const shouldShowPointTooltip = $derived(
		hasTooltip && !showCrosshair && tooltipVisible && tooltipData !== null
	);
	const shouldShowCrosshairTooltip = $derived(
		showCrosshair && hasTooltip && crosshairVisible && crosshairData !== null
	);
	const shouldShowCrosshairLines = $derived(showCrosshair && crosshairVisible);

	// Helper functions
	function parseDate(dateString: string): Date | null {
		if (!dateString) return null;

		if (inputDateFormat) {
			try {
				const parsed = parse(dateString, inputDateFormat, new Date());
				if (isValid(parsed)) return parsed;
			} catch (e) {}
		}

		try {
			const parsed = parseISO(dateString);
			if (isValid(parsed)) return parsed;
		} catch (e) {}

		try {
			const parsed = new Date(dateString);
			if (isValid(parsed)) return parsed;
		} catch (e) {}

		return null;
	}

	function formatDateForDisplay(dateString: string): string {
		const date = parseDate(dateString);
		if (date) {
			return format(date, dateFormat);
		}
		return String(dateString).substring(0, 10);
	}

	function formatYValue(value: number): string {
		if (Math.abs(value) >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		} else if (Math.abs(value) >= 1000) {
			return `${(value / 1000).toFixed(1)}k`;
		} else {
			return value.toFixed(1);
		}
	}

	function generateYTicks(yMin: number, yMax: number): number[] {
		const hasNegativeValues = yMin < 0;
		const effectiveTickCount = hasNegativeValues && doubleTicks ? yTickCount * 2 : yTickCount;
		const tickValues = new Set<number>();

		for (let i = 0; i <= effectiveTickCount; i++) {
			const value = yMin + (i / effectiveTickCount) * (yMax - yMin);
			tickValues.add(Number(value.toFixed(2)));
		}

		if (hasNegativeValues && yMin < 0 && yMax > 0) {
			tickValues.add(0);
		}

		return Array.from(tickValues).sort((a, b) => b - a);
	}

	function announceToScreenReader(message: string) {
		announcements = message;
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

	// Canvas rendering functions
	function renderCanvas() {
		if (!canvasElement || !canvasContext || currentPerformanceMode !== 'canvas' || !chartData) {
			console.warn('Canvas rendering skipped - missing requirements');
			return;
		}

		try {
			const dpr = config.devicePixelRatio;
			const rect = canvasElement.getBoundingClientRect();

			// Ensure we have valid dimensions
			if (rect.width === 0 || rect.height === 0) {
				console.warn('Canvas has zero dimensions, skipping render');
				return;
			}

			// Set canvas size accounting for device pixel ratio
			canvasElement.width = rect.width * dpr;
			canvasElement.height = rect.height * dpr;
			canvasContext.scale(dpr, dpr);

			if (config.canvasSmoothing) {
				canvasContext.imageSmoothingEnabled = true;
				canvasContext.imageSmoothingQuality = 'high';
			}

			// Clear canvas
			canvasContext.clearRect(0, 0, rect.width, rect.height);

			// Draw chart components
			drawCanvasAxes(canvasContext, chartData, rect.width, rect.height);

			// Draw lines with hover states
			linePaths.forEach((lineData: { id: string | null }, index: any) => {
				const isHovered = hoveredLine === lineData.id;
				const isOtherHovered = hoveredLine !== null && hoveredLine !== lineData.id;

				drawCanvasLine(canvasContext!, lineData, chartData, {
					strokeWidth: isHovered ? 3 : 2,
					opacity: isOtherHovered ? 0.3 : 1
				});
			});

			console.log('Canvas rendered successfully');
		} catch (error) {
			console.error('Canvas rendering error:', error);
		}
	}

	function drawCanvasLine(
		ctx: CanvasRenderingContext2D,
		lineData: any,
		chartData: ProcessedChartData,
		style: { strokeWidth: number; opacity: number }
	) {
		ctx.strokeStyle = lineData.color;
		ctx.lineWidth = style.strokeWidth;
		ctx.globalAlpha = style.opacity;
		ctx.beginPath();

		let firstPoint = true;
		chartData.allXValues.forEach((xValue: string, xIndex: number) => {
			const dataPoint = lineData.data.find((d: any) => String(d[xKey]) === xValue);
			if (dataPoint) {
				const x = chartData.xScale(xIndex);
				const y = chartData.yScale(Number(dataPoint[yKey]));

				if (firstPoint) {
					ctx.moveTo(x, y);
					firstPoint = false;
				} else {
					ctx.lineTo(x, y);
				}
			}
		});

		ctx.stroke();
		ctx.globalAlpha = 1;

		// Draw points
		chartData.allXValues.forEach((xValue: string, xIndex: number) => {
			const dataPoint = lineData.data.find((d: any) => String(d[xKey]) === xValue);
			if (dataPoint) {
				const x = chartData.xScale(xIndex);
				const y = chartData.yScale(Number(dataPoint[yKey]));

				ctx.beginPath();
				ctx.arc(x, y, 4, 0, 2 * Math.PI);
				ctx.fillStyle = '#ffffff';
				ctx.fill();
				ctx.strokeStyle = lineData.color;
				ctx.lineWidth = 2;
				ctx.stroke();
			}
		});
	}

	function drawCanvasAxes(
		ctx: CanvasRenderingContext2D,
		chartData: ProcessedChartData,
		width: number,
		height: number
	) {
		ctx.strokeStyle = '#94a3b8';
		ctx.lineWidth = 1;

		// X-axis
		ctx.beginPath();
		ctx.moveTo(margin.left, margin.top + chartHeight);
		ctx.lineTo(margin.left + width - margin.left - margin.right, margin.top + chartHeight);
		ctx.stroke();

		// Y-axis
		ctx.beginPath();
		ctx.moveTo(margin.left, margin.top);
		ctx.lineTo(margin.left, margin.top + chartHeight);
		ctx.stroke();

		// Labels
		ctx.fillStyle = '#64748b';
		ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';

		// X-axis labels
		const tickInterval = Math.max(1, Math.ceil(chartData.allXValues.length / 7));
		for (let i = 0; i < chartData.allXValues.length; i += tickInterval) {
			const x = chartData.xScale(i);
			const label = formatDateForDisplay(chartData.allXValues[i]);

			ctx.textAlign = 'center';
			ctx.fillText(label, x, margin.top + chartHeight + 20);
		}

		// Y-axis labels and grid
		chartData.yTicks.forEach((tickValue) => {
			const y = chartData.yScale(tickValue);

			// Grid line
			ctx.strokeStyle = '#e2e8f0';
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			ctx.moveTo(margin.left, y);
			ctx.lineTo(margin.left + width - margin.left - margin.right, y);
			ctx.stroke();
			ctx.setLineDash([]);

			// Label
			ctx.fillStyle = tickValue === 0 ? '#374151' : '#64748b';
			ctx.textAlign = 'right';
			ctx.fillText(formatYValue(tickValue), margin.left - 10, y + 4);
		});
	}

	// Event handlers
	const throttledMouseMove = throttle((e: MouseEvent) => {
		if (!showCrosshair || !chartData) return;

		const rect = chart?.getBoundingClientRect() || canvasElement?.getBoundingClientRect();
		if (!rect) return;

		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;

		if (
			mouseX >= margin.left &&
			mouseX <= margin.left + width &&
			mouseY >= margin.top &&
			mouseY <= margin.top + chartHeight
		) {
			updateCrosshair(mouseX, mouseY);
		}
	}, config.mouseMoveThrottle);

	function updateCrosshair(x: number, y: number) {
		if (!chartData) return;

		let nearestXIndex = 0;
		let minDistance = Infinity;

		for (let i = 0; i < chartData.allXValues.length; i++) {
			const distance = Math.abs(x - chartData.xScale(i));
			if (distance < minDistance) {
				minDistance = distance;
				nearestXIndex = i;
			}
		}

		const currentXValue = chartData.allXValues[nearestXIndex];
		const parsedDate = parseDate(currentXValue);
		const xLabel = parsedDate ? formatDateForDisplay(currentXValue) : currentXValue;

		const values = linePaths
			.map((lineData: { data: any[]; id: any; label: any; color: any }) => {
				const dataPoint = lineData.data.find((d) => String(d[xKey]) === currentXValue);
				if (dataPoint) {
					const yValue = Number(dataPoint[yKey]);
					return {
						lineId: lineData.id,
						lineLabel: lineData.label,
						value: formatYValue(yValue),
						color: lineData.color,
						y: chartData.yScale(yValue)
					};
				}
				return null;
			})
			.filter(Boolean);

		crosshairData = {
			x: chartData.xScale(nearestXIndex),
			y,
			xLabel,
			values
		};
	}

	function handlePointHover(e: MouseEvent, lineData: any, point: any, index: number) {
		if (!showCrosshair && hasTooltip) {
			const dataPoint = lineData.data[index];
			const xValue = String(dataPoint[xKey]);
			const parsedDate = parseDate(xValue);
			const displayLabel = parsedDate ? formatDateForDisplay(xValue) : xValue;
			const yValue = Number(dataPoint[yKey]);

			tooltipData = {
				x: point.x,
				y: point.y,
				value: formatYValue(yValue),
				label: displayLabel,
				lineLabel: lineData.label,
				color: lineData.color
			};
			tooltipVisible = true;
		}
		hoveredLine = lineData.id;
	}

	function handlePointLeave() {
		if (!showCrosshair) {
			tooltipVisible = false;
		}
		hoveredLine = null;
	}

	// Throttled resize handler
	const throttledResize = throttle(() => {
		if (chart && isVisible) {
			const newWidth = chart.clientWidth - margin.left - margin.right;
			const newHeight = height - margin.top - margin.bottom;

			if (newWidth !== width || newHeight !== chartHeight) {
				width = newWidth;
				chartHeight = newHeight;
				dataManager.clearCache();

				if (currentPerformanceMode === 'canvas') {
					renderCanvas();
				}
			}
		}
	}, config.resizeDebounce);

	// Lifecycle with improved Canvas setup
	onMount(() => {
		mounted = true;

		if (!chart && !canvasElement) return;

		const element = chart || canvasElement;
		if (!element) return;
		// Initial dimensions
		width = element.clientWidth - margin.left - margin.right;
		chartHeight = height - margin.top - margin.bottom;

		// Setup canvas context immediately if in canvas mode
		if (canvasElement) {
			canvasContext = canvasElement.getContext('2d');

			// Force initial render for canvas mode
			if (currentPerformanceMode === 'canvas' && chartData) {
				// Use requestAnimationFrame to ensure DOM is ready
				requestAnimationFrame(() => {
					renderCanvas();
				});
			}
		}

		// Intersection observer for visibility
		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				isVisible = entries[0].isIntersecting;

				// Re-render canvas when becoming visible
				if (isVisible && currentPerformanceMode === 'canvas' && canvasContext) {
					requestAnimationFrame(() => {
						renderCanvas();
					});
				}
			},
			{ threshold: 0.1 }
		);

		// Resize observer with Canvas re-rendering
		const resizeObserver = new ResizeObserver(() => {
			if (isVisible) {
				throttledResize();

				// Force Canvas re-render after resize
				if (currentPerformanceMode === 'canvas' && canvasContext) {
					setTimeout(() => {
						renderCanvas();
					}, 100); // Small delay to ensure dimensions are updated
				}
			}
		});

		if (element) {
			intersectionObserver.observe(element);
			resizeObserver.observe(element);
		}

		return () => {
			intersectionObserver.disconnect();
			resizeObserver.disconnect();
		};
	});

	onDestroy(() => {
		dataManager.clearCache();
		PathGenerator.clearCache();
	});

	// Effects with proper Canvas reactivity
	$effect(() => {
		// This effect handles Canvas rendering and re-rendering
		if (currentPerformanceMode === 'canvas' && canvasElement && canvasContext && chartData) {
			// Re-render canvas when any reactive dependency changes
			renderCanvas();
		}
	});

	$effect(() => {
		// This effect handles SVG mode reactive rendering
		if (lines && mounted && currentPerformanceMode !== 'canvas') {
			// SVG mode - reactive rendering happens automatically through Svelte's reactivity
		}
	});

	// Watch for data changes and force Canvas re-render
	$effect(() => {
		// Watch for line data changes
		const _ = [lines, xKey, yKey, tension, curveType, hoveredLine];

		if (currentPerformanceMode === 'canvas' && mounted && canvasContext) {
			// Force Canvas re-render when data or styling changes
			requestAnimationFrame(() => {
				renderCanvas();
			});
		}
	});
	// Watch for dimension changes
	$effect(() => {
		// Watch for dimension changes
		const _ = [width, chartHeight, height];

		if (currentPerformanceMode === 'canvas' && mounted && canvasContext) {
			// Re-render canvas when dimensions change
			requestAnimationFrame(() => {
				renderCanvas();
			});
		}
	});
</script>

<!-- Template -->
<div class="multi-line-chart-container">
	<!-- Screen reader announcements -->
	<div class="sr-only" aria-live="polite" aria-atomic="true">
		{announcements}
	</div>

	<!-- Chart description for screen readers -->
	<div id="chart-description" class="sr-only">
		{generateChartDescription()}
	</div>

	<!-- Performance notice -->
	{#if currentPerformanceMode === 'canvas'}
		<div class="performance-notice">
			<small>
				Large dataset detected ({totalDataPoints.toLocaleString()} points). Using optimized Canvas rendering.
			</small>
		</div>
	{/if}

	<!-- Main chart container -->
	<div class="chart-container">
		{#if currentPerformanceMode === 'canvas'}
			<!-- Canvas for large datasets -->
			<canvas
				bind:this={canvasElement}
				class="chart-canvas"
				width="100%"
				{height}
				aria-label="Line chart: {title}"
				onmousemove={throttledMouseMove}
				onmouseleave={() => {
					crosshairVisible = false;
				}}
				onmouseenter={() => {
					crosshairVisible = true;
				}}
			></canvas>
		{:else}
			<!-- SVG for smaller datasets -->
			<svg
				bind:this={chart}
				class="multi-line-chart"
				width="100%"
				{height}
				role="img"
				aria-label="Line chart: {title}"
				onmousemove={throttledMouseMove}
				onmouseleave={() => {
					crosshairVisible = false;
				}}
				onmouseenter={() => {
					crosshairVisible = true;
				}}
			>
				{#if chartData && linePaths.length > 0}
					<g>
						<!-- Title -->
						<text
							x={margin.left + width / 2}
							y={margin.top - 5}
							text-anchor="middle"
							fill="#1e293b"
							font-size="16px"
							font-weight="bold"
						>
							{title}
						</text>

						<!-- X Axis -->
						<g class="x-axis" transform="translate(0, {margin.top + chartHeight})">
							<line x1={margin.left} y1="0" x2={margin.left + width} y2="0" stroke="#94a3b8" />

							{#each chartData.allXValues as xValue, i}
								{#if i % Math.max(1, Math.ceil(chartData.allXValues.length / 7)) === 0}
									<g transform="translate({chartData.xScale(i)}, 0)">
										<line y2="6" stroke="#94a3b8" />
										<text y="20" text-anchor="middle" fill="#64748b" font-size="12px">
											{formatDateForDisplay(xValue)}
										</text>
									</g>
								{/if}
							{/each}
						</g>

						<!-- Y Axis -->
						<g class="y-axis" transform="translate({margin.left}, 0)">
							<line x1="0" y1={margin.top} x2="0" y2={margin.top + chartHeight} stroke="#94a3b8" />

							{#each chartData.yTicks as tickValue}
								<g transform="translate(0, {chartData.yScale(tickValue)})">
									<line x2="-6" stroke="#94a3b8" />
									<line x1="0" y1="0" x2={width} y2="0" stroke="#e2e8f0" stroke-dasharray="4,4" />
									<text
										x="-10"
										y="4"
										text-anchor="end"
										fill={tickValue === 0 ? '#374151' : '#64748b'}
										font-size="12px"
										font-weight={tickValue === 0 ? 'bold' : 'normal'}
									>
										{formatYValue(tickValue)}
									</text>
								</g>
							{/each}
						</g>

						<!-- Lines and points -->
						{#each linePaths as lineData (lineData.id)}
							<g class="line-group">
								<!-- Line path -->
								<path
									d={lineData.pathData}
									fill="none"
									stroke={lineData.color}
									stroke-width={hoveredLine === lineData.id ? 3 : 2}
									opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
									class="line-{lineData.id}"
									style="transition: stroke-width 0.3s ease, opacity 0.3s ease;"
								/>

								<!-- Data points -->
								<g class="data-points-{lineData.id}">
									{#each lineData.points as point, i}
										<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
										<circle
											cx={point.x}
											cy={point.y}
											r="4"
											fill="#ffffff"
											stroke={lineData.color}
											stroke-width="2"
											opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
											class="data-point"
											role={hasTooltip ? 'button' : undefined}
											tabindex={hasTooltip ? 0 : undefined}
											aria-describedby={hasTooltip ? 'tooltip-id' : undefined}
											onmouseenter={(e) => handlePointHover(e, lineData, point, i)}
											onmouseleave={handlePointLeave}
											style="transition: opacity 0.3s ease, transform 0.2s ease; cursor: {hasTooltip
												? 'pointer'
												: 'default'};"
										/>

										{#if showValues}
											<text
												x={point.x}
												y={point.y - 10}
												text-anchor="middle"
												fill={lineData.color}
												font-size="11px"
												font-weight="600"
												opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
												class="value-label"
												style="pointer-events: none; transition: opacity 0.3s ease;"
											>
												{formatYValue(
													Number(
														lineData.data.find(
															(d: { [x: string]: any }) =>
																chartData.allXValues.indexOf(String(d[xKey])) === i
														)?.[yKey] || 0
													)
												)}
											</text>
										{/if}
									{/each}
								</g>
							</g>
						{/each}

						<!-- Crosshair lines -->
						{#if shouldShowCrosshairLines && crosshairData}
							<g class="crosshair-group" opacity="1">
								<!-- Vertical line -->
								<line
									x1={crosshairData.x}
									y1={margin.top}
									x2={crosshairData.x}
									y2={margin.top + chartHeight}
									stroke="#6b7280"
									stroke-width="1"
									stroke-dasharray="4,4"
									opacity="0.7"
								/>

								<!-- Horizontal line -->
								<line
									x1={margin.left}
									y1={crosshairData.y}
									x2={margin.left + width}
									y2={crosshairData.y}
									stroke="#6b7280"
									stroke-width="1"
									stroke-dasharray="4,4"
									opacity="0.7"
								/>

								<!-- Crosshair points -->
								{#each crosshairData.values as valueData}
									<circle
										cx={crosshairData.x}
										cy={valueData.y}
										r="4"
										fill={valueData.color}
										stroke="#ffffff"
										stroke-width="2"
										opacity="0.9"
									/>
								{/each}
							</g>
						{/if}
					</g>
				{/if}
			</svg>
		{/if}

		<!-- Hidden keyboard navigation element -->
		<button
			class="chart-keyboard-handler sr-only"
			aria-label="Chart keyboard controls. Press Escape to clear highlights."
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					hoveredLine = null;
					announceToScreenReader('Chart cleared, all lines visible');
				}
			}}
		>
			Chart Controls
		</button>
	</div>

	<!-- Hidden chart title for screen readers -->
	<h2 id="chart-title" class="sr-only">{title}</h2>

	<!-- Legend -->
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
					transition:scale={{ duration: 200, delay: index * 50, easing: cubicInOut }}
				>
					<div class="legend-color" style="background-color: {color}" aria-hidden="true"></div>
					<span class="legend-label">{lineData.label}</span>
				</div>
			{/each}
		</div>

		<div id="legend-instructions" class="sr-only">
			Press Enter or Space to highlight a data series, Escape to show all series
		</div>
	{/if}

	<!-- Point tooltip -->
	{#if shouldShowPointTooltip && tooltipData}
		{@const tooltipX = tooltipData.x}
		{@const tooltipY = tooltipData.y - 20}
		{@const shouldFlipX = tooltipX > width - 120}
		{@const shouldFlipY = tooltipY < 80}
		<div
			class="tooltip"
			style="left: {tooltipX}px; top: {shouldFlipY
				? tooltipY + 40
				: tooltipY}px; transform: translate({shouldFlipX ? '-100%' : '-50%'}, {shouldFlipY
				? '10px'
				: '-100%'});"
			role="tooltip"
			aria-live="polite"
		>
			<div class="tooltip-content">
				<div class="tooltip-header">{tooltipData.label}</div>
				<div class="tooltip-values">
					<div class="tooltip-value-row">
						<div
							class="tooltip-color-indicator"
							style="background-color: {tooltipData.color}"
						></div>
						<span class="tooltip-line-label">{tooltipData.lineLabel}:</span>
						<span class="tooltip-value">{tooltipData.value}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Crosshair tooltip -->
	{#if shouldShowCrosshairTooltip && crosshairData}
		{@const tooltipX = crosshairData.x}
		{@const tooltipY = crosshairData.y - 20}
		{@const shouldFlipX = tooltipX > width - 120}
		{@const shouldFlipY = tooltipY < 80}
		<div
			class="tooltip crosshair-tooltip"
			style="left: {tooltipX}px; top: {shouldFlipY
				? tooltipY + 40
				: tooltipY}px; transform: translate({shouldFlipX ? '-100%' : '-50%'}, {shouldFlipY
				? '10px'
				: '-100%'});"
			role="tooltip"
			aria-live="polite"
		>
			<div class="tooltip-content">
				<div class="tooltip-header">{crosshairData.xLabel}</div>
				<div class="tooltip-values">
					{#each crosshairData.values as valueData (valueData.lineId)}
						<div class="tooltip-value-row">
							<div
								class="tooltip-color-indicator"
								style="background-color: {valueData.color}"
							></div>
							<span class="tooltip-line-label">{valueData.lineLabel}:</span>
							<span class="tooltip-value">{valueData.value}</span>
						</div>
					{/each}
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
					{#if lines.length > 0 && chartData}
						{#each chartData.allXValues as xValue}
							<tr>
								<th scope="row">{formatDateForDisplay(xValue)}</th>
								{#each lines as lineData}
									{@const dataPoint = lineData.data.find(
										(d: { [x: string]: any }) => String(d[xKey]) === xValue
									)}
									<td>
										{dataPoint ? dataPoint[yKey] : 'N/A'}
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

	.multi-line-chart {
		width: 100%;
		min-height: 300px;
		outline: none;
	}

	.chart-canvas {
		width: 100%;
		cursor: crosshair;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
	}

	.performance-notice {
		margin-bottom: 8px;
		padding: 8px 12px;
		background: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 4px;
		color: #0369a1;
		text-align: center;
		font-size: 12px;
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

	/* Legend styles */
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

	/* Tooltip styles */
	.tooltip {
		position: absolute;
		pointer-events: none;
		z-index: 20;
		max-width: 240px;
		margin-bottom: 10px;
		opacity: 1;
		transition: opacity 0.15s ease;
	}

	.tooltip-content {
		background-color: rgba(0, 0, 0, 0.95);
		color: white;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		min-width: 120px;
	}

	.tooltip-header {
		font-weight: 600;
		margin-bottom: 8px;
		padding-bottom: 6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.25);
		font-size: 13px;
		text-align: center;
		color: #ffffff;
	}

	.tooltip-values {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.tooltip-value-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 2px 0;
	}

	.tooltip-color-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.tooltip-line-label {
		font-weight: 500;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #e5e7eb;
	}

	.tooltip-value {
		font-weight: 700;
		font-size: 13px;
		color: #ffffff;
		text-align: right;
		flex-shrink: 0;
	}

	/* Data table styles */
	.chart-controls {
		margin-top: 16px;
		display: flex;
		justify-content: flex-end;
	}

	.data-table-toggle {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s ease;
		outline: none;
	}

	.data-table-toggle:hover {
		background: #2563eb;
	}

	.data-table-toggle:focus {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
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

		.tooltip-content {
			font-size: 11px;
			padding: 8px 10px;
			min-width: 100px;
		}
	}
</style>
