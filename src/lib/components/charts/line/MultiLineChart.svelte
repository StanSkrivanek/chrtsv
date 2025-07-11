<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';

	// Types
	interface DataPoint {
		[key: string]: any;
	}

	interface LineData {
		id: string;
		label: string;
		color?: string;
		data: DataPoint[];
	}

	interface ChartProps {
		lines?: LineData[];
		xKey?: string;
		yKey?: string;
		title?: string;
		showLegend?: boolean;
		height?: number;
		dateFormat?: string;
		showValues?: boolean;
		hasTooltip?: boolean;
		yTickCount?: number;
		curveType?: 'straight' | 'smooth';
		tension?: number;
		showCrosshair?: boolean;
		performanceConfig?: {
			svgMaxPoints?: number;
			animationMaxPoints?: number;
			enableDataSampling?: boolean;
			mouseMoveThrottle?: number;
			resizeDebounce?: number;
		};
	}

	// Props
	let {
		lines = [],
		xKey = 'date',
		yKey = 'value',
		title = 'Multi Line Chart',
		showLegend = true,
		height = 400,
		dateFormat = 'MMM dd',
		showValues = false,
		hasTooltip = false,
		yTickCount = 5,
		tension = 0.3,
		curveType = 'straight',
		showCrosshair = false,
		performanceConfig = {}
	} = $props();

	// Performance configuration
	const config = {
		svgMaxPoints: 1000,
		animationMaxPoints: 500,
		enableDataSampling: true,
		mouseMoveThrottle: 16,
		resizeDebounce: 150,
		...performanceConfig
	};

	// State
	let svgElement = $state<SVGElement | null>(null);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let mounted = $state(false);
	let width = $state(0);
	let chartHeight = $state(0);
	let hoveredLine = $state<string | null>(null);
	let tooltipData = $state<any | null>(null);
	let tooltipVisible = $state(false);
	let canvasContext: CanvasRenderingContext2D | null = null;

	// Chart dimensions
	const margin = { top: 20, right: 20, bottom: 40, left: 60 };

	// Default colors
	const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

	// Calculate total data points
	const totalDataPoints = $derived(
		lines.reduce((sum: number, line: { data: string | any[]; }) => sum + line.data.length, 0)
	);

	// Determine rendering mode
	const renderingMode = $derived(() => {
		if (totalDataPoints > config.svgMaxPoints) return 'canvas';
		if (totalDataPoints > config.animationMaxPoints) return 'svg-no-animation';
		return 'svg-full';
	});

	// Get current rendering mode value
	const currentRenderingMode = $derived(renderingMode());

	// Process chart data
	const chartData = $derived.by(() => {
		if (!lines.length || !mounted || width === 0 || chartHeight === 0) return null;

		// Get all unique X values
		const xValues = new Set<string>();
		lines.forEach((line: { data: any[]; }) => {
			line.data.forEach(d => {
				xValues.add(String(d[xKey]));
			});
		});
		const allXValues = Array.from(xValues).sort();

		// Get Y value range
		const allYValues: number[] = [];
		lines.forEach((line: { data: any[]; }) => {
			line.data.forEach(d => {
				allYValues.push(Number(d[yKey]));
			});
		});

		if (!allYValues.length) return null;

		const yMin = Math.min(...allYValues);
		const yMax = Math.max(...allYValues);
		const yRange = yMax - yMin;
		const yPadding = yRange * 0.1;
		const yMinWithPadding = yMin - yPadding;
		const yMaxWithPadding = yMax + yPadding;

		// Scale functions
		const xScale = (idx: number) => 
			margin.left + (idx / Math.max(1, allXValues.length - 1)) * width;
		
		const yScale = (val: number) =>
			margin.top + chartHeight - 
			((val - yMinWithPadding) / (yMaxWithPadding - yMinWithPadding)) * chartHeight;

		// Generate Y ticks
		const yTicks: number[] = [];
		for (let i = 0; i <= yTickCount; i++) {
			const value = yMinWithPadding + (i / yTickCount) * (yMaxWithPadding - yMinWithPadding);
			yTicks.push(value);
		}

		return {
			allXValues,
			yMin: yMinWithPadding,
			yMax: yMaxWithPadding,
			xScale,
			yScale,
			yTicks: yTicks.reverse()
		};
	});

	// Calculate line paths
	const linePaths = $derived.by(() => {
		if (!chartData) return [];

		return lines.map((lineData: { color: string; data: any[]; id: any; label: any; }, index: number) => {
			const color = lineData.color || defaultColors[index % defaultColors.length];
			const points: Array<{ x: number; y: number }> = [];

			chartData.allXValues.forEach((xValue, xIndex) => {
				const dataPoint = lineData.data.find(d => String(d[xKey]) === xValue);
				if (dataPoint) {
					points.push({
						x: chartData.xScale(xIndex),
						y: chartData.yScale(Number(dataPoint[yKey]))
					});
				}
			});

			// Generate path
			let pathData = '';
			if (points.length > 0) {
				if (curveType === 'smooth' && tension > 0) {
					// Simple smooth curve using quadratic bezier
					pathData = `M ${points[0].x} ${points[0].y}`;
					for (let i = 1; i < points.length; i++) {
						const prev = points[i - 1];
						const curr = points[i];
						const cpx = (prev.x + curr.x) / 2;
						pathData += ` Q ${cpx} ${prev.y} ${cpx} ${curr.y} L ${curr.x} ${curr.y}`;
					}
				} else {
					// Straight lines
					pathData = points.map((p, i) => 
						`${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
					).join(' ');
				}
			}

			return {
				id: lineData.id,
				label: lineData.label,
				color,
				pathData,
				points,
				data: lineData.data
			};
		});
	});

	// Canvas rendering function
	function renderCanvas() {
		if (!canvasElement || !canvasContext || !chartData || !linePaths.length) {
			return;
		}

		const rect = canvasElement.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;

		// Set canvas size
		canvasElement.width = rect.width * dpr;
		canvasElement.height = rect.height * dpr;
		
		// Reset transform and scale
		canvasContext.setTransform(1, 0, 0, 1, 0, 0);
		canvasContext.scale(dpr, dpr);

		// Clear canvas
		canvasContext.clearRect(0, 0, rect.width, rect.height);

		// Draw axes
		drawCanvasAxes(canvasContext, chartData, rect.width, rect.height);

		// Draw lines
		linePaths.forEach((lineData: { id: string | null; }) => {
			drawCanvasLine(canvasContext!, lineData, hoveredLine === lineData.id);
		});
	}

	function drawCanvasAxes(
		ctx: CanvasRenderingContext2D,
		chartData: any,
		canvasWidth: number,
		canvasHeight: number
	) {
		ctx.strokeStyle = '#94a3b8';
		ctx.lineWidth = 1;

		// X-axis
		ctx.beginPath();
		ctx.moveTo(margin.left, margin.top + chartHeight);
		ctx.lineTo(margin.left + width, margin.top + chartHeight);
		ctx.stroke();

		// Y-axis
		ctx.beginPath();
		ctx.moveTo(margin.left, margin.top);
		ctx.lineTo(margin.left, margin.top + chartHeight);
		ctx.stroke();

		// Y-axis ticks and grid
		ctx.fillStyle = '#64748b';
		ctx.font = '12px sans-serif';
		
		chartData.yTicks.forEach((tickValue: number) => {
			const y = chartData.yScale(tickValue);
			
			// Grid line
			ctx.strokeStyle = '#e2e8f0';
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			ctx.moveTo(margin.left, y);
			ctx.lineTo(margin.left + width, y);
			ctx.stroke();
			ctx.setLineDash([]);
			
			// Label
			ctx.fillStyle = '#64748b';
			ctx.textAlign = 'right';
			ctx.fillText(tickValue.toFixed(1), margin.left - 10, y + 4);
		});

		// X-axis labels
		const tickInterval = Math.max(1, Math.ceil(chartData.allXValues.length / 7));
		for (let i = 0; i < chartData.allXValues.length; i += tickInterval) {
			const x = chartData.xScale(i);
			const label = chartData.allXValues[i];
			
			ctx.textAlign = 'center';
			ctx.fillText(label, x, margin.top + chartHeight + 20);
		}
	}

	function drawCanvasLine(
		ctx: CanvasRenderingContext2D,
		lineData: any,
		isHovered: boolean
	) {
		ctx.strokeStyle = lineData.color;
		ctx.lineWidth = isHovered ? 3 : 2;
		ctx.globalAlpha = hoveredLine && !isHovered ? 0.3 : 1;
		
		// Draw line
		ctx.beginPath();
		lineData.points.forEach((point: any, i: number) => {
			if (i === 0) {
				ctx.moveTo(point.x, point.y);
			} else {
				ctx.lineTo(point.x, point.y);
			}
		});
		ctx.stroke();
		
		// Draw points
		lineData.points.forEach((point: any) => {
			ctx.beginPath();
			ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
			ctx.fillStyle = '#ffffff';
			ctx.fill();
			ctx.strokeStyle = lineData.color;
			ctx.lineWidth = 2;
			ctx.stroke();
		});
		
		ctx.globalAlpha = 1;
	}

	// Helper functions
	function formatYValue(value: number): string {
		if (Math.abs(value) >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		} else if (Math.abs(value) >= 1000) {
			return `${(value / 1000).toFixed(1)}k`;
		}
		return value.toFixed(1);
	}

	// Throttle function
	function throttle<T extends (...args: any[]) => any>(
		func: T,
		wait: number
	): (...args: Parameters<T>) => void {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		let lastCallTime = 0;
		
		return (...args: Parameters<T>) => {
			const now = Date.now();
			const remaining = wait - (now - lastCallTime);
			
			if (remaining <= 0) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				lastCallTime = now;
				func(...args);
			} else if (!timeout) {
				timeout = setTimeout(() => {
					lastCallTime = Date.now();
					timeout = null;
					func(...args);
				}, remaining);
			}
		};
	}

	// Event handlers
	function handlePointHover(e: MouseEvent, lineData: any, point: any, index: number) {
		if (hasTooltip && !showCrosshair) {
			const dataPoint = lineData.data[index];
			tooltipData = {
				x: point.x,
				y: point.y,
				value: formatYValue(Number(dataPoint[yKey])),
				label: String(dataPoint[xKey]),
				lineLabel: lineData.label,
				color: lineData.color
			};
			tooltipVisible = true;
		}
		hoveredLine = lineData.id;
	}

	function handlePointLeave() {
		tooltipVisible = false;
		hoveredLine = null;
	}

	// Resize handler
	const handleResize = throttle(() => {
		if (!svgElement && !canvasElement) return;
		
		const element = svgElement || canvasElement;
		if (!element) return;
		
		const newWidth = element.clientWidth - margin.left - margin.right;
		const newHeight = height - margin.top - margin.bottom;
		
		if (newWidth !== width || newHeight !== chartHeight) {
			width = newWidth;
			chartHeight = newHeight;
		}
	}, config.resizeDebounce);

	// Canvas rendering trigger - watches all relevant dependencies
	$effect(() => {
		if (currentRenderingMode === 'canvas' && mounted && canvasContext) {
			// Create a dependency snapshot that will trigger re-renders
			const deps = {
				dataLength: lines.length,
				totalPoints: totalDataPoints,
				hasChartData: !!chartData,
				pathsLength: linePaths.length,
				hover: hoveredLine,
				dims: `${width}x${chartHeight}`
			};
			
			// Log for debugging
			console.log('Canvas render triggered:', deps);
			
			// Render with double RAF to ensure all updates are complete
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					renderCanvas();
				});
			});
		}
	});

	// Setup canvas when element is available
	$effect(() => {
		if (canvasElement && !canvasContext) {
			canvasContext = canvasElement.getContext('2d');
			console.log('Canvas context initialized');
			
			// Trigger initial render if we have data
			if (chartData && linePaths.length > 0) {
				requestAnimationFrame(() => {
					renderCanvas();
				});
			}
		}
	});

// Lifecycle
onMount(() => {
  mounted = true;

  let resizeObserver: ResizeObserver;

  tick().then(() => {
    const element = svgElement || canvasElement;
    if (!element) return;

    width = element.clientWidth - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(element);
  });

  return () => {
    resizeObserver?.disconnect();
  };
});

	onDestroy(() => {
		mounted = false;
		canvasContext = null;
	});
</script>

<div class="multi-line-chart-container">
	{#if currentRenderingMode === 'canvas'}
		<div class="performance-notice">
			<small>
				Large dataset ({totalDataPoints.toLocaleString()} points) - Using Canvas rendering
			</small>
		</div>
	{/if}

	<div class="chart-container">
		{#if currentRenderingMode === 'canvas'}
			<canvas
				bind:this={canvasElement}
				class="chart-canvas"
				width="100%"
				{height}
				aria-label="Line chart: {title}"
			></canvas>
		{:else}
			<svg
				bind:this={svgElement}
				class="multi-line-chart"
				width="100%"
				{height}
				role="img"
				aria-label="Line chart: {title}"
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
											{xValue}
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
									<text x="-10" y="4" text-anchor="end" fill="#64748b" font-size="12px">
										{formatYValue(tickValue)}
									</text>
								</g>
							{/each}
						</g>

						<!-- Lines and points -->
						{#each linePaths as lineData (lineData.id)}
							<g class="line-group">
								<path
									d={lineData.pathData}
									fill="none"
									stroke={lineData.color}
									stroke-width={hoveredLine === lineData.id ? 3 : 2}
									opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
									style="transition: stroke-width 0.2s ease, opacity 0.2s ease;"
								/>

								{#each lineData.points as point, i}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<circle
										cx={point.x}
										cy={point.y}
										r="4"
										fill="#ffffff"
										stroke={lineData.color}
										stroke-width="2"
										opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
										onmouseenter={(e) => handlePointHover(e, lineData, point, i)}
										onmouseleave={handlePointLeave}
										style="cursor: {hasTooltip
											? 'pointer'
											: 'default'}; transition: opacity 0.2s ease;"
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
										>
											{formatYValue(Number(lineData.data[i][yKey]))}
										</text>
									{/if}
								{/each}
							</g>
						{/each}
					</g>
				{/if}
			</svg>
		{/if}
	</div>

	<!-- Legend -->
	{#if showLegend && lines.length > 0}
		<div class="legend" transition:fade={{ duration: 300 }}>
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
					onmouseenter={() => (hoveredLine = lineData.id)}
					onmouseleave={() => (hoveredLine = null)}
				>
					<div class="legend-color" style="background-color: {color}"></div>
					<span class="legend-label">{lineData.label}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Tooltip -->
	{#if hasTooltip && tooltipVisible && tooltipData}
		{@const tooltipX = tooltipData.x}
		{@const tooltipY = tooltipData.y - 20}
		{@const shouldFlipX = tooltipX > width - 120}
		{@const shouldFlipY = tooltipY < 80}

		<div
			class="tooltip"
			style="left: {tooltipX}px; top: {shouldFlipY ? tooltipY + 40 : tooltipY}px; 
			       transform: translate({shouldFlipX ? '-100%' : '-50%'}, {shouldFlipY ? '10px' : '-100%'});"
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
</div>

<style>
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
		transition: all 0.2s ease;
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
		transition: transform 0.2s ease;
	}

	.legend-item:hover .legend-color {
		transform: scale(1.1);
	}

	.legend-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.tooltip {
		position: absolute;
		pointer-events: none;
		z-index: 20;
		max-width: 240px;
	}

	.tooltip-content {
		background-color: rgba(0, 0, 0, 0.95);
		color: white;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		min-width: 120px;
	}

	.tooltip-header {
		font-weight: 600;
		margin-bottom: 8px;
		padding-bottom: 6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.25);
		font-size: 13px;
		text-align: center;
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
	}

	.tooltip-color-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.tooltip-line-label {
		font-weight: 500;
		flex: 1;
		color: #e5e7eb;
	}

	.tooltip-value {
		font-weight: 700;
		font-size: 13px;
		color: #ffffff;
		text-align: right;
	}

	@media (max-width: 768px) {
		.legend {
			flex-direction: column;
			gap: 8px;
		}

		.legend-item {
			padding: 6px 10px;
		}
	}
</style>
