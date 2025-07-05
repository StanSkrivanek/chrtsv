<script lang="ts">
	import { onMount } from "svelte";

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
		height = null,
		barHeight = 12,
		barSpacing = 14,
		animate = true,
		showTooltip = true,
		labelFontSize = 12, // Make font size configurable
		borderRadius = null,
		pillShape = false
	} = $props();

	// Calculate dynamic height based on content
	const calculatedHeight = $derived(() => {
		const topPadding = 20;
		const bottomPadding = 20;
		const totalBarsHeight = segments.length * barHeight;
		const totalSpacing = (segments.length - 1) * barSpacing;
		return topPadding + totalBarsHeight + totalSpacing + bottomPadding;
	});

	// Use provided height or calculated height
	const finalHeight = $derived(() => height ?? calculatedHeight());

	let hoveredIndex = $state(-1);
	let mounted = $state(false);
	let animatedWidths = $state(segments.map(() => 0));

	// Calculate the maximum text width for category labels
	const maxLabelWidth = $derived(() => {
		// Dynamic character width based on configurable font size
		// Average character width is approximately 0.6em for most fonts
		const charWidth = labelFontSize * 0.6; // 0.6em equivalent
		const longestTitle = Math.max(...segments.map((s) => s.title.length));
		return longestTitle * charWidth + 20; // Add 20px buffer
	});

	// Dynamic padding based on text width - Call maxLabelWidth as a function
	const leftPadding = $derived(() => Math.max(80, maxLabelWidth())); // Fixed: Call maxLabelWidth()
	const rightPadding = 80; // Fixed padding for value labels
	const topPadding = 20; // Add top padding for proper positioning

	// Calculate dimensions - Call leftPadding as a function
	const chartWidth = $derived(() => width - leftPadding() - rightPadding); // Fixed: Call leftPadding()
	const maxValue = $derived(() => Math.max(...segments.map((s) => s.value), 1)); // Ensure minimum value of 1

	// Calculate bar widths with safety check - Call chartWidth and maxValue as functions
	const barWidths = $derived(
		segments.map((segment) => {
			const calculatedWidth = (segment.value / maxValue()) * chartWidth(); // Fixed: Call both functions
			return isNaN(calculatedWidth) ? 0 : calculatedWidth;
		})
	);
	
	onMount(() => {
		mounted = true;
	});

	// Animation effect
	$effect(() => {
		if (mounted && animate) {
			barWidths.forEach((targetWidth, index) => {
				setTimeout(() => {
					animatedWidths[index] = targetWidth;
				}, index * 100);
			});
		} else if (mounted) {
			animatedWidths = [...barWidths];
		}
	});


	// type Segment = { title: string; value: number; color: string };

	function handleMouseEnter(index: number) {
		if (showTooltip) {
			hoveredIndex = index;
		}
	}

	function handleMouseLeave() {
		hoveredIndex = -1;
	}

	// Calculate dynamic border radius based on bar height
	const dynamicBorderRadius = $derived(() => {
		// If explicit borderRadius is provided, use it
		if (borderRadius !== null) return borderRadius;
		
		// If pill shape is requested, use half the bar height for perfect semicircles
		if (pillShape) return barHeight / 2;
		
		// Otherwise, calculate proportional radius based on bar height
		// Use different scaling for different bar height ranges
		if (barHeight <= 12) {
			// Small bars: use 25% with min 2px
			return Math.max(barHeight * 0.25, 2);
		} else if (barHeight <= 24) {
			// Medium bars: use 20% with range 3-6px
			return Math.min(Math.max(barHeight * 0.2, 3), 6);
		} else if (barHeight <= 40) {
			// Large bars: use 18% with range 4-8px
			return Math.min(Math.max(barHeight * 0.18, 4), 8);
		} else {
			// Extra large bars: use 15% with max 10px
			return Math.min(barHeight * 0.15, 10);
		}
	});
</script>

<!-- <div class="chart-wrapper"> -->
<!-- <h2 class="chart-title">Monthly Data</h2> -->

<div class="chart-container" style="width: {width}px; height: {finalHeight()}px;">
    <svg {width} height={finalHeight()}>
        {#each segments as segment, idx}
            {@const barWidth = animate ? animatedWidths[idx] : barWidths[idx]}
            {@const y = topPadding + idx * (barHeight + barSpacing)}
            {@const isHovered = hoveredIndex === idx}

            <g>
                <!-- Background bar -->
                <rect
                    x={leftPadding()}
                    {y}
                    width={chartWidth()}
                    height={barHeight}
                    fill="#F1F5F9"
                    rx={dynamicBorderRadius()}
                    ry={dynamicBorderRadius()}
                    class="background-bar"
                    role="graphics-symbol"
                />

                <!-- Animated bar -->
                <rect
                    x={leftPadding()}
                    {y}
                    width={barWidth || 0}
                    height={barHeight}
                    fill={segment.color}
                    rx={dynamicBorderRadius()}
                    ry={dynamicBorderRadius()}
                    class="bar"
                    class:hovered={isHovered}
                    role="graphics-symbol"
                    aria-label="{segment.title}: {segment.value}"
                    onmouseenter={() => handleMouseEnter(idx)}
                    onmouseleave={handleMouseLeave}
                />

                <!-- Category label with dynamic font size -->
                <text
                    x={leftPadding() - 12}
                    y={y + barHeight / 2}
                    text-anchor="end"
                    dominant-baseline="middle"
                    class="category-label"
                    style="font-size: {labelFontSize}px;"
                    fill="#374151"
                >
                    {segment.title}
                </text>

                <!-- Value label with dynamic font size -->
                <text
                    x={leftPadding() + (barWidth || 0) + 12}
                    y={y + barHeight / 2}
                    text-anchor="start"
                    dominant-baseline="middle"
                    class="value-label"
                    style="font-size: {labelFontSize}px;"
                    fill="#1F2937"
                >
                    {segment.value}
                </text>
            </g>
        {/each}
    </svg>
</div>

<!-- </div> -->

<style>
	/* .chart-wrapper {
		padding: 1.5rem;
		border-radius: 0.5rem;
	} */

	/* .chart-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #1f2937;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	} */

	.chart-container {
		position: relative;
		display: inline-block;
	}


	.bar {
		cursor: pointer;
		transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bar.hovered {
		opacity: 0.8;
		filter: brightness(1.1);
	}

	.category-label {
		/* Remove hardcoded font-size - now controlled by inline style */
		font-weight: 500;
		pointer-events: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.value-label {
		/* Remove hardcoded font-size - now controlled by inline style */
		font-weight: 600;
		pointer-events: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	/* Animation styles */
	.bar {
		transition-property: width, opacity, filter;
		transition-duration: 0.7s;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
