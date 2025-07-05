<script lang="ts">
	import { onMount } from 'svelte';
	import { Spring } from 'svelte/motion';

	let {
		segments = [
			{ title: 'Jan', value: 186, color: '#93C5FD' },
			{ title: 'Feb', value: 305, color: '#6a4c93' },
			{ title: 'Mar', value: 237, color: '#8ac926' },
			{ title: 'Apr', value: 73, color: '#1982c4' },
			{ title: 'May', value: 209, color: '#ff595e' },
			{ title: 'Jun', value: 214, color: '#ffca3a' }
		],
		width = 400,
		height = 300,
		padding = 40,
		showTooltip = true,
		animate = true,
		barSpacing = 8
	} = $props();

	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		content: ''
	});

	let hoveredIndex = $state(-1);
	let mounted = $state(false);

	// Calculate dimensions
	const chartWidth = width - padding * 2;
	const chartHeight = height - padding * 2;
	const barWidth = (chartWidth - (segments.length - 1) * barSpacing) / segments.length;

	// Find max value for scaling
	const maxValue = $derived(Math.max(...segments.map((s) => s.value)));

	// Create Spring instances for each bar
	const animatedHeights = segments.map(() => new Spring(0, { stiffness: 0.1, damping: 0.8 }));

	// Calculate bar heights
	const barHeights = $derived(segments.map((segment) => (segment.value / maxValue) * chartHeight));

	onMount(() => {
		mounted = true;
	});

	// Animate bars when mounted
	$effect(() => {
		if (mounted && animate) {
			barHeights.forEach((height, index) => {
				setTimeout(() => {
					animatedHeights[index].target = height;
				}, index * 100);
			});
		} else if (mounted) {
			barHeights.forEach((height, index) => {
				animatedHeights[index].target = height;
			});
		}
	});


	type Segment = { title: string; value: number; color: string };

	function handleMouseEnter(event: MouseEvent, segment: Segment, index: number) {
		if (!showTooltip) return;

		hoveredIndex = index;
		const rect = (event.target as HTMLElement).getBoundingClientRect();

		tooltip.visible = true;
		tooltip.x = rect.left + rect.width / 2;
		tooltip.y = rect.top - 10;
		tooltip.content = `${segment.title}: ${segment.value}`;
	}

	function handleMouseLeave() {
		if (!showTooltip) return;

		hoveredIndex = -1;
		tooltip.visible = false;
	}

	function handleMouseMove(event: MouseEvent) {
		if (!showTooltip || !tooltip.visible) return;

		tooltip.x = event.clientX;
		tooltip.y = event.clientY - 10;
	}
</script>

<div class="chart-container" style="width: {width}px; height: {height}px;">
	<svg {width} {height}>
		<!-- Chart bars -->
		{#each segments as segment, index}
			{@const x = padding + index * (barWidth + barSpacing)}
			{@const barHeight = animate ? animatedHeights[index].current : barHeights[index]}
			{@const y = padding + chartHeight - barHeight}
			{@const isHovered = hoveredIndex === index}

			<rect
				{x}
				{y}
				width={barWidth}
				height={barHeight}
				fill={segment.color}
				stroke={isHovered ? 'rgba(255,255,255,0.3)' : 'none'}
				stroke-width={isHovered ? 2 : 0}
				opacity={isHovered ? 0.8 : 1}
				rx="4"
				ry="4"
				class="bar"
				role="graphics-symbol"
				aria-label="{segment.title}: {segment.value}"
				onmouseenter={(e) => handleMouseEnter(e, segment, index)}
				onmouseleave={handleMouseLeave}
				onmousemove={handleMouseMove}
			/>

			<!-- Value labels on top of bars -->
			<text
				x={x + barWidth / 2}
				y={y - 8}
				text-anchor="middle"
				class="value-label"
				fill="#333"
				font-size="12"
				font-weight="500"
			>
				{segment.value}
			</text>

			<!-- Category labels at bottom -->
			<text
				x={x + barWidth / 2}
				y={height - padding + 16}
				text-anchor="middle"
				class="category-label"
				fill="#666"
				font-size="11"
			>
				{segment.title}
			</text>
		{/each}

		<!-- Y-axis guidelines -->
		{#each Array(5) as _, i}
			{@const yPos = padding + (chartHeight / 4) * i}
			{@const value = Math.round(maxValue - (maxValue / 4) * i)}

			<line
				x1={padding}
				y1={yPos}
				x2={padding + chartWidth}
				y2={yPos}
				stroke="#e0e0e0"
				stroke-width="1"
				opacity="0.5"
			/>

			<text
				x={padding - 8}
				y={yPos + 4}
				text-anchor="end"
				class="axis-label"
				fill="#999"
				font-size="10"
			>
				{value}
			</text>
		{/each}
	</svg>
</div>

<!-- Tooltip -->
{#if showTooltip && tooltip.visible}
	<div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;" role="tooltip">
		{tooltip.content}
	</div>
{/if}

<style>
	.chart-container {
		position: relative;
		display: inline-block;
	}

	.bar {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.bar:hover {
		filter: brightness(1.1);
	}

	.value-label {
		pointer-events: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.category-label {
		pointer-events: none;
		
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.axis-label {
		pointer-events: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.tooltip {
		position: fixed;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 6px 10px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		pointer-events: none;
		z-index: 1000;
		transform: translateX(-50%) translateY(-100%);
		white-space: nowrap;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border: 4px solid transparent;
		border-top-color: rgba(0, 0, 0, 0.8);
	}
</style>
