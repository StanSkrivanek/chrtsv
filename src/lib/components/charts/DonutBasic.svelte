<script lang="ts">
	import { fade } from 'svelte/transition';

	// Props
	let {
		size = 160,
		strokeWidth = 24,
		hasTooltip = true, // Enable or disable tooltip
		hasCenterData = true, // Enable or disable center text
		startAngle = -90, // Rotation angle in degrees
		centerData = null,
		segments = [
			{ title: 'Jan', value: 186, color: '#93C5FD' },
			{ title: 'Feb', value: 305, color: '#6a4c93' },
			{ title: 'Mar', value: 237, color: '#8ac926' },
			{ title: 'Apr', value: 73, color: '#1982c4' },
			{ title: 'May', value: 209, color: '#ff595e' },
			{ title: 'Jun', value: 214, color: '#ffca3a' }
		]
	} = $props();

	// Calculated values 
	let radius = $derived(size / 2 - strokeWidth / 2);
	let circumference = $derived(2 * Math.PI * radius);
	let center = $derived(size / 2);

	
	let totalValue = $derived(segments.reduce((sum, seg) => sum + seg.value, 0));
	
	// Precompute stroke segments with offsets and calculated percentages
    let strokeSegments = $derived(() => {
        let offset = 0;
        return segments.map(({ value, color, title }) => {
            const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
            const length = (percent / 100) * circumference;
            const seg = {
                length,
                offset,
                color,
                title,
                value,
                percent: Math.round(percent * 10) / 10 // Round to 1 decimal place
            };
            offset += length;
            return seg;
        });
    });

	let mouseX = $state(0);
	let mouseY = $state(0);
	// State for hover interactions
	let hoveredSegment: {
		title: string;
		percent: number | string;
		color: string;
		length: number;
		offset: number;
	} | null = $state(null);

	/**
	 * Handle pointer movement for tooltip positioning
	 * @param {PointerEvent} event
	 */
	function handlePointerMove(event: { clientX: number; clientY: number }) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	/**
	 * Set the hovered segment
	 * @param {{title: string, percent: number, color: string, length: number, offset: number}} segment
	 */
	function setHoveredSegment(
		segment: { length: number; offset: number; color: string; title: string; percent: any } | null
	) {
		hoveredSegment = segment;
	}

	/**
	 * Clear the hovered segment
	 */
	function clearHoveredSegment() {
		hoveredSegment = null;
	}

	// Add animation configuration
	const tooltipAnimationDuration = 250; // milliseconds
</script>

<!-- <div class="chart-circle" style={`width: ${size}px; height: ${size}px;`}> -->
<svg
	width={size}
	height={size}
	viewBox={`0 0 ${size} ${size}`}
	onpointermove={handlePointerMove}
	role="img"
	aria-labelledby="chart-title chart-desc"
>
	<!-- <title id="chart-title">Segment Distribution Chart</title>
	<desc id="chart-desc"
		>A pie chart showing the distribution of segments: {segments
			.map((s) => `${s.title} ${s.percent}%`)
			.join(', ')}</desc
	> -->

	<!-- background ring -->
	<circle
		cx={center}
		cy={center}
		r={radius}
		fill="none"
		stroke="#eee"
		stroke-width={strokeWidth}
		role="presentation"
	/>

	<!-- group for rotating all segments -->
	<g transform={`rotate(${startAngle} ${center} ${center})`}>
		{#each strokeSegments() as segment, i}
			<!-- Using a g element with a role="button" as a wrapper for accessibility -->
			<g
				role="button"
				tabindex="0"
				aria-label={`${segment.title}: ${segment.percent}%`}
				onpointerenter={() => setHoveredSegment(segment)}
				onpointerleave={clearHoveredSegment}
				onkeydown={(e) => e.key === 'Enter' && setHoveredSegment(segment)}
				onblur={clearHoveredSegment}
			>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke={segment.color}
					stroke-width={strokeWidth}
					stroke-dasharray={`${segment.length} ${circumference}`}
					stroke-dashoffset={-segment.offset}
					stroke-linecap="butt"
				>
					{#if !hasTooltip}
						<title>{segment.title}: {segment.percent}%</title>
					{/if}
				</circle>
			</g>
		{/each}
	</g>
	{#if hasCenterData}
		<!-- Central text display for active segment data -->
		<g class="center-display" transform={`translate(${center}, ${center})`}>
			
			{#if centerData}
			<text x="0" y="-4" text-anchor="middle" class="centerData-value" in:fade={{ duration: 300 }}>
				{centerData.value}
			</text>
			<text x="0" y="12" text-anchor="middle" class="centerData-title" in:fade={{ duration: 300 }}>
				{centerData.title}
			</text>
		{:else}
			<text x="0" y="5" text-anchor="middle" class="hover-instruction" in:fade={{ duration: 300 }}>
				{hoveredSegment ? centerData.percent + '%' : ''}
			</text>
		{/if}
		</g>
	{/if}
</svg>
<!-- </div> -->
{#if hoveredSegment && hasTooltip}
	<div
		class="tooltip"
		style={`left: ${mouseX}px; top: ${mouseY}px;`}
		role="tooltip"
		aria-live="polite"
		transition:fade={{ duration: tooltipAnimationDuration }}
	>
		<span style:background={hoveredSegment.color}></span>
		<span class="title">{hoveredSegment.title} </span>
		<span class="percent">{hoveredSegment.percent}%</span>
	</div>
{/if}

<style>
	.tooltip {
		position: fixed;
		display: flex;
		gap: 12px;

		/* flex-direction: column; */
		align-items: center;
		background: var(--color-slate-100);
		color: var(--color-slate-900);
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		line-height: 1;
		pointer-events: none;
		/* white-space: nowrap; */
		transform: translate(10px, 10px);
		z-index: 1000;
		span:nth-child(1) {
			width: 12px;
			height: 12px;
			border-radius: 50%;
			flex-shrink: 0;
		}
		& .title {
			font-family: 'regular';
			/* text-transform: uppercase; */
			color: var(--color-slate-600);
		}
		& .percent {
			font-family: 'semibold';
			letter-spacing: 0.05em;
			color: var(--color-slate-900);
		}
	}
	.centerData-value {
        font-size: 20px;
        font-weight: bold;
        fill: var(--color-slate-900);
    }
    
    .centerData-title {
        font-size: 12px;
        fill: var(--color-slate-600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
    }
    
    .hover-instruction {
        font-size: 12px;
        fill: var(--color-slate-500);
    }
	@media (prefers-color-scheme: dark) {
        .centerData-value {
            fill: #ffffff;
        }
        .centerData-title {
            fill: #cbd5e1;
        }
        .hover-instruction {
            fill: #94a3b8;
        }
    }
</style>
