<script lang="ts">
	import { onMount } from 'svelte';

	// Generic data type
	type DataPoint = Record<string, any>;

	let {
		data = [] as DataPoint[],
		xKey = 'date',
		yKey = 'value',
		colors = {} as Record<string, string>,
		width = 800 as number | string,
		height = 400 as number | string,
		padding = 60,
		showTooltip = true,
		animate = true,
		showPoints = true,
		showGrid = true,
		strokeWidth = 2,
		pointRadius = 4,
		tension = 0.3
	} = $props();

	let svgElement = $state<SVGSVGElement | null>(null);
	let containerElement = $state<HTMLDivElement | null>(null);
	let svgWidth = $state(800);
	let svgHeight = $state(400);

	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		content: ''
	});

	// Responsive dimensions
	onMount(() => {
		if (containerElement) {
			const updateDimensions = () => {
				if (containerElement) {
					const rect = containerElement.getBoundingClientRect();
					svgWidth = rect.width;
					svgHeight = typeof height === 'number' ? height : 400;
				}
			};

			updateDimensions();
			window.addEventListener('resize', updateDimensions);
			return () => window.removeEventListener('resize', updateDimensions);
		}
	});

	// Calculate chart dimensions
	const chartWidth = $derived(svgWidth - padding * 2);
	const chartHeight = $derived(svgHeight - padding * 2);

	// Process data
	const processedData = $derived(() => {
		if (!data || data.length === 0) return [];
		return data.map((item, index) => ({
			...item,
			index,
			x: item[xKey],
			y: typeof item[yKey] === 'number' ? item[yKey] : 0
		}));
	});

	// Calculate scales
	const xDomain = $derived(() => {
		if (processedData.length === 0) return [0, 1];
		return [0, processedData.length - 1];
	});

	const yDomain = $derived(() => {
		if (processedData().length === 0) return [0, 100];
		const values = processedData().map((d: any) => d.y).filter((v: any) => typeof v === 'number');
		if (values.length === 0) return [0, 100];
		const min = Math.min(...values);
		const max = Math.max(...values);
		const range = max - min;
		const paddingValue = range * 0.1;
		return [Math.max(0, min - paddingValue), max + paddingValue];
	});

	// Scale functions
	const xScale = (value: number) => {
		const [min, max] = xDomain();
		if (max === min) return 0;
		return ((value - min) / (max - min)) * chartWidth;
	};

	const yScale = (value: number) => {
		const [min, max] = yDomain();
		if (max === min) return chartHeight / 2;
		return chartHeight - ((value - min) / (max - min)) * chartHeight;
	};

	// Create smooth curve using Catmull-Rom spline
	const createSmoothPath = (points: Array<{ x: number; y: number }>) => {
		if (points.length < 2) return '';

		const path = [`M ${points[0].x} ${points[0].y}`];

		if (points.length === 2) {
			path.push(`L ${points[1].x} ${points[1].y}`);
		} else {
			for (let i = 0; i < points.length - 1; i++) {
				const p0 = points[Math.max(0, i - 1)];
				const p1 = points[i];
				const p2 = points[i + 1];
				const p3 = points[Math.min(points.length - 1, i + 2)];

				// Catmull-Rom control points
				const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
				const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
				const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
				const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

				path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
			}
		}

		return path.join(' ');
	};

	// Generate path
	const linePath = $derived(() => {
		if (processedData().length === 0) return '';

		const points = processedData().map((d, i) => ({
			x: xScale(i),
			y: yScale(d.y)
		}));

		return createSmoothPath(points);
	});

	// Grid lines
	const gridLines = $derived(() => {
		const [yMin, yMax] = yDomain();
		const yStep = (yMax - yMin) / 5;
		const lines = [];

		for (let i = 0; i <= 5; i++) {
			const value = yMin + yStep * i;
			const y = yScale(value);
			lines.push({
				x1: 0,
				y1: y,
				x2: chartWidth,
				y2: y,
				value: value
			});
		}

		return lines;
	});

	// X-axis labels
	const xLabels = $derived(() => {
		if (processedData.length === 0) return [];
		const step = Math.max(1, Math.floor(processedData.length / 8));
		const labels = [];

		for (let i = 0; i < processedData().length; i += step) {
			const d = processedData()[i];
			labels.push({
				x: xScale(i),
				label: d.x,
				value: d.y
			});
		}

		// Always include the last point if it's not already included
		if (processedData().length > 1) {
			const lastIndex = processedData().length - 1;
			const lastPoint = processedData()[lastIndex];
			if (!labels.some((l) => l.x === xScale(lastIndex))) {
				labels.push({
					x: xScale(lastIndex),
					label: lastPoint.x,
					value: lastPoint.y
				});
			}
		}

		return labels;
	});

	// Handle mouse events
	const handleMouseMove = (event: MouseEvent) => {
		if (!svgElement || !showTooltip) return;

		const rect = svgElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left - padding;
		const mouseY = event.clientY - rect.top - padding;

		if (mouseX < 0 || mouseX > chartWidth || mouseY < 0 || mouseY > chartHeight) {
			tooltip.visible = false;
			return;
		}

		// Find closest data point
		const xIndex = Math.round((mouseX / chartWidth) * (processedData().length - 1));
		const dataPoint = processedData()[xIndex];

		if (dataPoint) {
			tooltip.visible = true;
			tooltip.x = event.clientX;
			tooltip.y = event.clientY - 10;
			tooltip.content = `${dataPoint.x}: ${formatYValue(dataPoint.y)}`;
		}
	};

	const handleMouseLeave = () => {
		tooltip.visible = false;
	};

	// Default color
	const lineColor = colors[yKey] || '#3b82f6';

	// Format Y values
	const formatYValue = (value: number) => {
		if (yKey.includes('rate')) {
			return `${value.toFixed(1)}%`;
		}
		return value.toLocaleString();
	};
</script>

<div class="chart-container" bind:this={containerElement}>
	<svg
		bind:this={svgElement}
		width={svgWidth}
		height={svgHeight}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		role="img"
		aria-label={`Line chart showing ${yKey} over time`}
	>
		<!-- Grid lines -->
		{#if showGrid}
			<g class="grid-lines">
				{#each gridLines() as line}
					<line
						x1={padding + line.x1}
						y1={padding + line.y1}
						x2={padding + line.x2}
						y2={padding + line.y2}
						stroke="#e5e7eb"
						stroke-width="1"
					/>
					<text
						x={padding - 10}
						y={padding + line.y1}
						text-anchor="end"
						dominant-baseline="middle"
						font-size="12"
						fill="#6b7280"
					>
						{formatYValue(line.value)}
					</text>
				{/each}
			</g>
		{/if}

		<!-- X-axis -->
		<line
			x1={padding}
			y1={padding + chartHeight}
			x2={padding + chartWidth}
			y2={padding + chartHeight}
			stroke="#374151"
			stroke-width="1"
		/>

		<!-- Y-axis -->
		<line
			x1={padding}
			y1={padding}
			x2={padding}
			y2={padding + chartHeight}
			stroke="#374151"
			stroke-width="1"
		/>

		<!-- X-axis labels -->
		<g class="x-labels">
			{#each xLabels() as label}
				<text
					x={padding + label.x}
					y={padding + chartHeight + 20}
					text-anchor="middle"
					font-size="12"
					fill="#6b7280"
				>
					{label.label}
				</text>
			{/each}
		</g>

		<!-- Line -->
		{#if linePath()}
			<path
				d={linePath()}
				fill="none"
				stroke={lineColor}
				stroke-width={strokeWidth}
				transform="translate({padding}, {padding})"
				class="line-path"
			/>
		{/if}

		<!-- Points -->
		{#if showPoints}
			<g class="data-points" transform="translate({padding}, {padding})">
				{#each processedData() as point, i}
					<circle
						cx={xScale(i)}
						cy={yScale(point.y)}
						r={pointRadius}
						fill={lineColor}
						stroke="white"
						stroke-width="2"
						class="data-point"
					/>
				{/each}
			</g>
		{/if}
	</svg>

	<!-- Tooltip -->
	{#if tooltip.visible}
		<div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
			{tooltip.content}
		</div>
	{/if}
</div>

<style>
	.chart-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.line-path {
		transition: stroke-dasharray 0.5s ease;
	}

	.data-point {
		transition: r 0.2s ease;
	}

	.data-point:hover {
		r: 6;
	}

	.tooltip {
		position: fixed;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		pointer-events: none;
		z-index: 1000;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 4px solid transparent;
		border-top-color: rgba(0, 0, 0, 0.8);
	}
</style>
