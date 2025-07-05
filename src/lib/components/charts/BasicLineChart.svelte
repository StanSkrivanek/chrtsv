<script lang="ts">
	// Import only what we need
	import { onMount } from 'svelte';

	// Props with explicit typing using Svelte 5 runes
	let {
		data = [],
		yKey = 'date',
		xKey = 'value',
		color = '#3b82f6',
		title = 'Line Chart'
	} = $props<{
		data?: Array<Record<string, any>>;
		xKey?: string;
		yKey?: string;
		color?: string;
		title?: string;
	}>();

	// Internal state
	let chart: SVGElement;
	let mounted = $state(false);
	let width = $state(0);
	let height = $state(0);
	let tooltipVisible = $state(false);
	let tooltipData = $state<{ x: number; y: number; value: any; label: string } | null>(null);

	// Chart dimensions
	const margin = { top: 20, right: 20, bottom: 40, left: 60 };

	// Function to re-render chart when data changes
	function renderChart() {
		if (!mounted || !chart || data.length === 0) return;

		// Clear previous chart
		while (chart.firstChild) {
			chart.removeChild(chart.firstChild);
		}

		// Calculate dimensions
		const svgWidth = chart.clientWidth;
		const svgHeight = chart.clientHeight || 300;
		width = svgWidth - margin.left - margin.right;
		height = svgHeight - margin.top - margin.bottom;

		// Create scales
		const xValues = data.map((d: Record<string, any>) => d[xKey]);
		const yValues = data.map((d: Record<string, any>) => Number(d[yKey]));

		const xMin = 0;
		const xMax = data.length - 1;
		const yMin = Math.min(...yValues);
		const yMax = Math.max(...yValues);
		const yPadding = (yMax - yMin) * 0.1;

		// Scale functions
		const xScale = (idx: number) => margin.left + (idx / xMax) * width;
		const yScale = (val: number) =>
			margin.top + height - ((val - yMin + yPadding) / (yMax - yMin + yPadding * 2)) * height;

		// Create SVG elements
		const mainG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

		// Create axes
		const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		xAxis.setAttribute('class', 'x-axis');
		xAxis.setAttribute('transform', `translate(0, ${margin.top + height})`);

		// X axis line
		const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		xAxisLine.setAttribute('x1', String(margin.left));
		xAxisLine.setAttribute('y1', '0');
		xAxisLine.setAttribute('x2', String(margin.left + width));
		xAxisLine.setAttribute('y2', '0');
		xAxisLine.setAttribute('stroke', '#94a3b8');
		xAxis.appendChild(xAxisLine);

		// X axis ticks - show 5-7 ticks depending on data size
		const tickInterval = Math.ceil(data.length / Math.min(7, data.length));
		for (let i = 0; i < data.length; i += tickInterval) {
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

			// Format date labels if they look like dates
			const value = String(data[i][xKey]);
			if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{2}\/\d{2}\/\d{4}/)) {
				const date = new Date(value);
				text.textContent = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
		yAxisLine.setAttribute('y2', String(margin.top + height));
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

		// Create line
		const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		let pathData = 'M ';

		data.forEach((d: Record<string, any>, i: number) => {
			const x = xScale(i);
			const y = yScale(Number(d[yKey]));
			pathData += i === 0 ? `${x} ${y}` : ` L ${x} ${y}`;
		});

		line.setAttribute('d', pathData);
		line.setAttribute('fill', 'none');
		line.setAttribute('stroke', color);
		line.setAttribute('stroke-width', '2');

		// Add dots at data points
		const dots = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		dots.setAttribute('class', 'data-points');

		data.forEach((d: Record<string, any>, i: number) => {
			const x = xScale(i);
			const y = yScale(Number(d[yKey]));

			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', String(x));
			circle.setAttribute('cy', String(y));
			circle.setAttribute('r', '4');
			circle.setAttribute('fill', '#ffffff');
			circle.setAttribute('stroke', color);
			circle.setAttribute('stroke-width', '2');
			circle.setAttribute('class', 'data-point');

			// Add interaction
			circle.addEventListener('mouseenter', () => {
				tooltipData = {
					x,
					y,
					value: d[yKey],
					label: String(d[xKey])
				};
				tooltipVisible = true;

				// Highlight this circle
				circle.setAttribute('r', '6');
				circle.setAttribute('fill', color);
			});

			circle.addEventListener('mouseleave', () => {
				tooltipVisible = false;

				// Restore circle style
				circle.setAttribute('r', '4');
				circle.setAttribute('fill', '#ffffff');
			});

			dots.appendChild(circle);
		});

		// Add chart title
		const titleElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		titleElem.setAttribute('x', String(margin.left + width / 2));
		titleElem.setAttribute('y', String(margin.top - 5));
		titleElem.setAttribute('text-anchor', 'middle');
		titleElem.setAttribute('fill', '#1e293b');
		titleElem.setAttribute('font-size', '14px');
		titleElem.setAttribute('font-weight', 'bold');
		titleElem.textContent = title;

		// Add everything to the chart
		mainG.appendChild(xAxis);
		mainG.appendChild(yAxis);
		mainG.appendChild(line);
		mainG.appendChild(dots);
		chart.appendChild(mainG);
		chart.appendChild(titleElem);
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
		if (data && mounted) {
			renderChart();
		}
	});

	// Watch for key changes
	$effect(() => {
		const _ = xKey;
		const __ = yKey;
		const ___ = color;
		const ____ = title;

		if (mounted) {
			renderChart();
		}
	});
</script>

<div class="line-chart-container">
	<svg bind:this={chart} class="line-chart" width="100%" height="100%"></svg>

	{#if tooltipVisible && tooltipData}
		<div class="tooltip" style="left: {tooltipData.x}px; top: {tooltipData.y - 40}px;">
			<div class="tooltip-content">
				<span class="tooltip-label">{tooltipData.label}</span>
				<span class="tooltip-value">{tooltipData.value}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.line-chart-container {
		width: 100%;
		height: 100%;
		position: relative;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.line-chart {
		width: 100%;
		height: 100%;
		min-height: 300px;
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
		padding: 6px 10px;
		border-radius: 4px;
		font-size: 12px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.tooltip-label {
		font-weight: 500;
		margin-right: 5px;
	}

	.tooltip-value {
		font-weight: 700;
	}
</style>
