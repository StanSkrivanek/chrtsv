<script lang="ts">
	import visitorsData from '$lib/data/visitors-data.json';
	import { onMount } from 'svelte';

	// Generic data type for visitors data
	type VisitorDataPoint = {
		date: string;
		visitors: number;
		pageviews: number;
		sessions: number;
		bounce_rate: number;
		conversion_rate: number;
		period_label?: string;
	};

	interface Props {
		data?: VisitorDataPoint[];
		selectedMetric: string;
		height?: number;
		padding?: number;
	}

	let {
		data = visitorsData.daily_data,
		selectedMetric = 'visitors',
		height = 400,
		padding = 60
	}: Props = $props();

	let svgElement = $state<SVGSVGElement | null>(null);
	let containerElement = $state<HTMLDivElement | null>(null);
	let svgWidth = $state(800);
	let svgHeight = $state(height);

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
					svgHeight = height;
				}
			};

			updateDimensions();
			window.addEventListener('resize', updateDimensions);
			return () => window.removeEventListener('resize', updateDimensions);
		}
	});

	// Calculate chart dimensions
	let chartWidth = $derived(svgWidth - padding * 2);
	let chartHeight = $derived(svgHeight - padding * 2);

	// Get metric values and calculate scale
	let metricValues = $derived(() => {
		if (data && data.length > 0) {
			return data.map(
				(item: VisitorDataPoint) => item[selectedMetric as keyof VisitorDataPoint] as number
			);
		}
		return [];
	});

	let yMin = $derived(() => {
		const values = metricValues();
		if (values.length === 0) return 0;
		const min = Math.min(...values);
		const max = Math.max(...values);
		const range = max - min;
		const paddingValue = range * 0.1;
		return Math.max(0, min - paddingValue);
	});

	let yMax = $derived(() => {
		const values = metricValues();
		if (values.length === 0) return 100;
		const max = Math.max(...values);
		const min = Math.min(...values);
		const range = max - min;
		const paddingValue = range * 0.1;
		return max + paddingValue;
	});

	// Scale functions
	const xScale = (index: number) => {
		if (data.length <= 1) return 0;
		return (index / (data.length - 1)) * chartWidth;
	};

	const yScale = (value: number) => {
		const min = yMin();
		const max = yMax();
		if (max === min) return chartHeight / 2;
		return chartHeight - ((value - min) / (max - min)) * chartHeight;
	};

	// Create line path
	let linePath = $derived(() => {
		if (data.length === 0) {
			return '';
		}

		const points = data.map((item: VisitorDataPoint, index: number) => {
			const x = xScale(index);
			const y = yScale(item[selectedMetric as keyof VisitorDataPoint] as number);
			return `${x},${y}`;
		});

		return `M ${points.join(' L ')}`;
	});

	// Create grid lines
	let gridLines = $derived(() => {
		const lines = [];
		const min = yMin();
		const max = yMax();
		const yStep = (max - min) / 5;
		for (let i = 0; i <= 5; i++) {
			const value = min + yStep * i;
			const y = yScale(value);
			lines.push({ y, value });
		}
		return lines;
	});

	// Create x-axis labels
	let xLabels = $derived(() => {
		if (data.length === 0) {
			return [];
		}

		const step = Math.max(1, Math.floor(data.length / 8));
		const labels = [];
		for (let i = 0; i < data.length; i += step) {
			const item = data[i];
			labels.push({
				x: xScale(i),
				label: item.period_label || formatDate(item.date)
			});
		}
		// Always include the last point
		if (data.length > 1) {
			const lastItem = data[data.length - 1];
			labels.push({
				x: xScale(data.length - 1),
				label: lastItem.period_label || formatDate(lastItem.date)
			});
		}
		return labels;
	});

	// Handle mouse events
	const handleMouseMove = (event: MouseEvent) => {
		if (!svgElement) return;

		const rect = svgElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left - padding;
		const mouseY = event.clientY - rect.top - padding;

		if (mouseX < 0 || mouseX > chartWidth || mouseY < 0 || mouseY > chartHeight) {
			tooltip.visible = false;
			return;
		}

		// Find closest data point
		const xIndex = Math.round((mouseX / chartWidth) * (data.length - 1));
		const dataPoint = data[xIndex];

		if (dataPoint) {
			tooltip.visible = true;
			tooltip.x = event.clientX;
			tooltip.y = event.clientY - 10;
			const value = dataPoint[selectedMetric as keyof VisitorDataPoint] as number;
			tooltip.content = `${dataPoint.period_label || formatDate(dataPoint.date)}: ${formatValue(value)}`;
		}
	};

	const handleMouseLeave = () => {
		tooltip.visible = false;
	};

	// Color scheme for different metrics
	const metricColors = {
		visitors: '#3b82f6',
		pageviews: '#10b981',
		sessions: '#f59e0b',
		bounce_rate: '#ef4444',
		conversion_rate: '#8b5cf6'
	};

	const lineColor = metricColors[selectedMetric as keyof typeof metricColors] || '#3b82f6';

	// Format values
	const formatValue = (value: number) => {
		if (selectedMetric === 'bounce_rate' || selectedMetric === 'conversion_rate') {
			return `${value.toFixed(1)}%`;
		}
		return value.toLocaleString();
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
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
		aria-label={`Line chart showing ${selectedMetric} over time`}
	>
		<!-- Grid lines -->
		<g class="grid-lines">
			{#each gridLines() as line}
				<line
					x1={padding}
					y1={padding + line.y}
					x2={padding + chartWidth}
					y2={padding + line.y}
					stroke="#e5e7eb"
					stroke-width="1"
				/>
				<text
					x={padding - 10}
					y={padding + line.y}
					text-anchor="end"
					dominant-baseline="middle"
					font-size="12"
					fill="#6b7280"
				>
					{formatValue(line.value)}
				</text>
			{/each}
		</g>

		<!-- X-axis -->
		<line
			x1={padding}
			y1={padding + chartHeight}
			x2={padding + chartWidth}
			y2={padding + chartHeight}
			stroke="#374151"
			stroke-width="2"
		/>

		<!-- Y-axis -->
		<line
			x1={padding}
			y1={padding}
			x2={padding}
			y2={padding + chartHeight}
			stroke="#374151"
			stroke-width="2"
		/>

		<!-- X-axis labels -->
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

		<!-- Line path -->
		{#if data.length > 0}
			<path
				d={linePath()}
				fill="none"
				stroke={lineColor}
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				transform="translate({padding}, {padding})"
			/>
		{/if}

		<!-- Data points -->
		<g class="data-points" transform="translate({padding}, {padding})">
			{#each data as point, i}
				<circle
					cx={xScale(i)}
					cy={yScale(point[selectedMetric as keyof VisitorDataPoint] as number)}
					r="4"
					fill={lineColor}
					stroke="white"
					stroke-width="2"
				/>
			{/each}
		</g>
	</svg>
</div>

<!-- Tooltip -->
{#if tooltip.visible}
	<div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
		{tooltip.content}
	</div>
{/if}

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.tooltip {
		position: fixed;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 12px;
		pointer-events: none;
		z-index: 1000;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.grid-lines line {
		opacity: 0.3;
	}

	.data-points circle {
		opacity: 0.8;
		transition: opacity 0.2s ease;
	}

	.data-points circle:hover {
		opacity: 1;
	}
</style>
