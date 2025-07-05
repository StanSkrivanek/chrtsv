<script lang="ts">
	import { format, isValid, parseISO } from 'date-fns';

	// Convert to Svelte 5 runes
	let {
		data,
		xKey,
		yKey,
		color = '#3b82f6',
		title = 'Line Chart',
		width = 800,
		height = 400,
		showPoints = true,
		dateFormat = 'MMM dd',
		inputDateFormat = undefined
	}: {
		data: any[];
		xKey: string;
		yKey: string;
		color?: string;
		title?: string;
		width?: number;
		height?: number;
		showPoints?: boolean;
		dateFormat?: string;
		inputDateFormat?: string;
	} = $props();

	// Svelte 5 state with runes
	let container = $state<HTMLDivElement>();
	let svg = $state<SVGSVGElement>();
	let containerWidth = $state(width);
	let containerHeight = $state(height);

	// Chart dimensions
	const margin = { top: 20, right: 30, bottom: 40, left: 60 };
	let chartWidth = $derived(containerWidth - margin.left - margin.right);
	let chartHeight = $derived(containerHeight - margin.top - margin.bottom);

	// Date parsing helper
	function parseDate(dateString: string | Date): Date {
		if (dateString instanceof Date) return dateString;
		if (!dateString) return new Date();

		// Try custom format first if provided
		if (inputDateFormat) {
			// For custom parsing, you might need additional date-fns parse functions
			// For now, fallback to ISO parsing
		}

		// Try ISO format
		const isoDate = parseISO(String(dateString));
		if (isValid(isoDate)) {
			return isoDate;
		}

		// Fallback to native Date parsing
		const nativeDate = new Date(String(dateString));
		if (isValid(nativeDate)) {
			return nativeDate;
		}

		return new Date();
	}

	// Format date for display
	function formatDate(dateValue: string | Date): string {
		try {
			const date = parseDate(dateValue);
			return format(date, dateFormat);
		} catch {
			return String(dateValue);
		}
	}

	// Check if xKey represents dates
	function isDateKey(key: string): boolean {
		return key.toLowerCase().includes('date') || key.toLowerCase().includes('time');
	}

	// Data processing with derived state
	let processedData = $derived(() => {
		if (!data || data.length === 0) return [];

		return data.map((item: any) => ({
			...item,
			[xKey]: isDateKey(xKey) ? parseDate(item[xKey]) : item[xKey]
		}));
	});

	// Get min/max values for scaling
	let xValues = $derived(() => {
		const processed = processedData();
		if (!processed.length) return [];

		if (isDateKey(xKey)) {
			return processed
				.map((d: any) => d[xKey])
				.filter((d: any): d is Date => d instanceof Date)
				.sort((a: Date, b: Date) => a.getTime() - b.getTime());
		} else {
			return processed
				.map((d: any) => d[xKey])
				.filter((v: any): v is number => typeof v === 'number');
		}
	});

	let yValues = $derived(() => {
		const processed = processedData();
		return processed
			.map((d: any) => d[yKey])
			.filter((v: any): v is number => typeof v === 'number');
	});

	let xMin = $derived(() => {
		const xVals = xValues();
		if (!xVals.length) return 0;
		if (isDateKey(xKey)) {
			return xVals[0] as Date;
		} else {
			return Math.min(...(xVals as number[]));
		}
	});

	let xMax = $derived(() => {
		const xVals = xValues();
		if (!xVals.length) return 100;
		if (isDateKey(xKey)) {
			return xVals[xVals.length - 1] as Date;
		} else {
			return Math.max(...(xVals as number[]));
		}
	});

	let yMin = $derived(() => {
		const yVals = yValues();
		return yVals.length ? Math.min(...yVals) : 0;
	});

	let yMax = $derived(() => {
		const yVals = yValues();
		return yVals.length ? Math.max(...yVals) : 100;
	});

	// Scaling functions
	let xScale = $derived(() => {
		if (isDateKey(xKey)) {
			const timeMin = xMin instanceof Date ? xMin.getTime() : 0;
			const timeMax = xMax instanceof Date ? xMax.getTime() : 1;
			return (value: Date | string | number) => {
				const date = value instanceof Date ? value : parseDate(String(value));
				return ((date.getTime() - timeMin) / (timeMax - timeMin)) * chartWidth;
			};
		} else {
			const numMin = typeof xMin === 'number' ? xMin : 0;
			const numMax = typeof xMax === 'number' ? xMax : 1;
			return (value: number | string | Date) => {
				if (value instanceof Date) {
					const date = value;
					return ((date.getTime() - numMin) / (numMax - numMin)) * chartWidth;
				}
				const numValue = typeof value === 'number' ? value : parseFloat(String(value));
				return ((numValue - numMin) / (numMax - numMin)) * chartWidth;
			};
		}
	});

	let yScale = $derived(() => {
		const numYMax = Number(yMax);
		const numYMin = Number(yMin);
		const range = numYMax - numYMin || 1;
		return (value: number) => chartHeight - ((value - numYMin) / range) * chartHeight;
	});

	// Generate path data
	let pathData = $derived(() => {
		const processed = processedData();
		if (!processed.length) return '';

		const points = processed
			.filter((d: any) => typeof d[yKey] === 'number')
			.map((d: any) => {
				const x = xScale()(d[xKey]);
				const y = yScale()(d[yKey]);
				return `${x},${y}`;
			});

		if (points.length === 0) return '';

		return `M ${points.join(' L ')}`;
	});

	// Points for circles
	let points = $derived(() => {
		const processed = processedData();
		if (!processed.length) return [];

		return processed
			.filter((d: any) => typeof d[yKey] === 'number')
			.map((d: any) => ({
				x: xScale()(d[xKey]),
				y: yScale()(d[yKey]),
				value: d[yKey],
				label: isDateKey(xKey) ? formatDate(d[xKey]) : String(d[xKey])
			}));
	});

	// Generate tick marks
	let xTicks = $derived(() => {
		const xVals = xValues();
		if (!xVals.length) return [];

		const tickCount = Math.min(6, xVals.length);
		const ticks = [];

		for (let i = 0; i < tickCount; i++) {
			const index = Math.floor((i * (xVals.length - 1)) / (tickCount - 1));
			const value = xVals[index];
			const position = xScale()(value);
			const label = isDateKey(xKey) ? formatDate(value as Date) : String(value);

			ticks.push({ position, label, value });
		}

		return ticks;
	});

	let yTicks = $derived(() => {
		const tickCount = 5;
		const ticks = [];
		const yMinValue = yMin();
		const yMaxValue = yMax();

		for (let i = 0; i < tickCount; i++) {
			const value = yMinValue + (i * (yMaxValue - yMinValue)) / (tickCount - 1);
			const position = yScale()(value);
			ticks.push({ position, value: Math.round(value) });
		}

		return ticks;
	});

	// Tooltip state
	let tooltip = $state<{
		visible: boolean;
		x: number;
		y: number;
		content: string;
	}>({ visible: false, x: 0, y: 0, content: '' });

	// Resize observer
	let resizeObserver: ResizeObserver | null = null;

	// Effects
	$effect(() => {
		if (container && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					containerWidth = entry.contentRect.width || width;
					containerHeight = height;
				}
			});
			resizeObserver.observe(container);
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	});

	// Event handlers
	function handleMouseMove(event: MouseEvent) {
		if (!svg) return;

		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left - margin.left;
		const y = event.clientY - rect.top - margin.top;

		// Find closest point
		const pointsArray = points();
		const closestPoint = pointsArray.reduce(
			(closest: { point: any | null; distance: number }, point: any) => {
				const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
				return distance < closest.distance ? { point, distance } : closest;
			},
			{ point: null, distance: Infinity }
		);

		if (closestPoint.point && closestPoint.distance < 20) {
			tooltip.visible = true;
			tooltip.x = event.clientX;
			tooltip.y = event.clientY;
			tooltip.content = `${closestPoint.point.label}: ${closestPoint.point.value}`;
		} else {
			tooltip.visible = false;
		}
	}

	function handleMouseLeave() {
		tooltip.visible = false;
	}
</script>

<div bind:this={container} class="chart-container">
	<h3 class="chart-title">{title}</h3>

	<svg
		bind:this={svg}
		width={containerWidth}
		height={containerHeight}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		class="chart-svg"
		role="img"
		aria-labelledby="chart-title"
		aria-describedby="chart-description"
	>
		<title id="chart-title">{title}</title>
		<desc id="chart-description">
			Line chart showing {yKey} values over {xKey}. Contains {data.length} data points.
		</desc>

		<g transform={`translate(${margin.left}, ${margin.top})`}>
			<!-- Grid lines -->
			{#each yTicks() as tick}
				<line
					x1={0}
					y1={tick.position}
					x2={chartWidth}
					y2={tick.position}
					stroke="#e2e8f0"
					stroke-width="1"
					aria-hidden="true"
				/>
			{/each}

			<!-- Axes -->
			<line
				x1={0}
				y1={chartHeight}
				x2={chartWidth}
				y2={chartHeight}
				stroke="#374151"
				stroke-width="2"
				aria-label="X-axis"
			/>
			<line
				x1={0}
				y1={0}
				x2={0}
				y2={chartHeight}
				stroke="#374151"
				stroke-width="2"
				aria-label="Y-axis"
			/>

			<!-- X-axis labels -->
			{#each xTicks() as tick}
				<text
					x={tick.position}
					y={chartHeight + 20}
					text-anchor="middle"
					class="axis-label"
					aria-label="X-axis label: {tick.label}"
				>
					{tick.label}
				</text>
			{/each}

			<!-- Y-axis labels -->
			{#each yTicks() as tick}
				<text
					x={-10}
					y={tick.position + 5}
					text-anchor="end"
					class="axis-label"
					aria-label="Y-axis label: {tick.value}"
				>
					{tick.value}
				</text>
			{/each}

			<!-- Line path -->
			{#if pathData()}
				<path
					d={pathData()}
					fill="none"
					stroke={color}
					stroke-width="2"
					stroke-linejoin="round"
					stroke-linecap="round"
					aria-label="Data line connecting {points().length} points"
				/>
			{/if}

			<!-- Data points -->
			{#if showPoints}
				{#each points() as point, index}
					<circle
						cx={point.x}
						cy={point.y}
						r="4"
						fill={color}
						class="data-point"
						aria-label="Data point {index + 1}: {point.label}, value {point.value}"
						tabindex="0"
					/>
				{/each}
			{/if}
		</g>
	</svg>
</div>

<!-- Tooltip -->
{#if tooltip.visible}
	<div class="tooltip" style="left: {tooltip.x + 10}px; top: {tooltip.y - 10}px;">
		{tooltip.content}
	</div>
{/if}

<style>
	.chart-container {
		width: 100%;
		position: relative;
		background: white;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		text-align: center;
	}

	.chart-svg {
		overflow: visible;
	}

	.axis-label {
		font-size: 12px;
		fill: #6b7280;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.data-point {
		transition: r 0.2s ease;
		cursor: pointer;
	}

	.data-point:hover {
		r: 6;
	}

	.tooltip {
		position: fixed;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
		pointer-events: none;
		z-index: 1000;
		white-space: nowrap;
	}
</style>
