<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	let {
		size = 160,
		strokeWidth = 24,
		activeStrokeWidth = 48,
		startAngle = -90, // Rotation angle in degrees
		mainText = 'see details',
		segments = [
			{ title: 'Jan', value: 186, color: '#93C5FD' },
			{ title: 'Feb', value: 305, color: '#6a4c93' },
			{ title: 'Mar', value: 237, color: '#8ac926' },
			{ title: 'Apr', value: 73, color: '#1982c4' },
			{ title: 'May', value: 209, color: '#ff595e' },
			{ title: 'Jun', value: 214, color: '#ffca3a' }
		]
	} = $props();

	// Make these reactive to props changes
	// Change the radius calculation to ensure the stroke only expands outward
	let center = $derived(size / 2);
	let radius = $derived(center - strokeWidth / 2);
	let circumference = $derived(2 * Math.PI * radius);

	let maxStroke = $derived(Math.max(strokeWidth, activeStrokeWidth));
	let baseRadius = $derived(center - strokeWidth);

	// Calculate total value for percentage calculations
	let totalValue = $derived(segments.reduce((sum, seg) => sum + seg.value, 0));

	// Update the segments calculation to account for active state and add IDs
	let strokeSegments = $derived(() => {
		let offset = 0;
		let currentAngle = startAngle;
		return segments.map(({ value, color, title }, index) => {
			const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
			const length = (percent / 100) * circumference;
			const angle = (percent / 100) * 360;
			// Use title if available, otherwise use index-based ID
			const id = title || `segment-${index}`;
			const seg = {
				id,
				length,
				offset,
				color,
				title: title || `Segment ${index + 1}`, // Provide default title if none exists
				value,
				percent: Math.round(percent * 10) / 10, // Round to 1 decimal place
				startAngle: currentAngle
			};
			offset += length;
			currentAngle += angle;
			return seg;
		});
	});

	let activeSegmentId = $state(null);

	let activeSegment: {
		id: any;
		length: number;
		offset: number;
		color: any;
		title: any;
		value: number;
		percent: number;
		startAngle: any;
	} | null = $state(null); // Store the active segment data

	// Simple effect to update active segment data when ID changes
	$effect(() => {
		if (activeSegmentId) {
			const found = strokeSegments().find((seg) => seg.id === activeSegmentId);
			activeSegment = found || null;
		} else {
			activeSegment = null;
		}
	});

	// Only update maxStroke when dependencies change
	$effect(() => {
		maxStroke = Math.max(strokeWidth, activeStrokeWidth);
	});
</script>

<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style="overflow: visible;">
	<g transform={`rotate(${startAngle} ${center} ${center})`}>
		{#each strokeSegments() as seg (seg.id)}
			{@const isActive = activeSegmentId === seg.id}
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				stroke={seg.color}
				stroke-width={isActive ? activeStrokeWidth : strokeWidth}
				stroke-dasharray={`${seg.length} ${circumference}`}
				stroke-dashoffset={-seg.offset}
				stroke-linecap="butt"
				class="segment"
				onpointerenter={() => (activeSegmentId = seg.id)}
				onpointerleave={() => (activeSegmentId = null)}
				vector-effect="non-scaling-stroke"
				aria-label={`${seg.title}: ${seg.percent}%`}
			/>
		{/each}
	</g>

	<!-- Background track drawn on top to hide any expanded inner stroke parts -->
	<circle
		cx={center}
		cy={center}
		r={radius - strokeWidth}
		fill="#ffffff"
		stroke="#ffffff"
		stroke-width={strokeWidth}
		vector-effect="non-scaling-stroke"
		class="background-track"
	/>

	<!-- Central text display for active segment data -->
	<g class="center-display" transform={`translate(${center}, ${center})`}>
		{#if activeSegment}
			<g in:fly={{ y: 10, duration: 300 }} out:fade={{ duration: 200 }}>
				<text x="0" y="-4" text-anchor="middle" class="segment-percent">
					{activeSegment.percent}%
				</text>
				<text x="0" y="12" text-anchor="middle" class="segment-title">
					{activeSegment.title}
				</text>
			</g>
		{:else}
			<text x="0" y="5" text-anchor="middle" class="hover-instruction" in:fade={{ duration: 300 }}>
				{mainText}
			</text>
		{/if}
	</g>
</svg>

<style>
	.segment {
		transition: stroke-width 0.3s ease;
		/* Control how the stroke expands (from center by default) */
		paint-order: stroke;
	}

	.background-track {
		paint-order: stroke;
	}

	.center-display {
		pointer-events: none; /* Allow interactions with segments behind text */
	}

	.segment-title {
		fill: #999;
		font-size: 0.85rem;
		font-family: 'regular';
	}

	.segment-percent {
		fill: #121111;
		font-size: 1.2rem;
		font-family: 'semibold';
	}

	.hover-instruction {
		fill: #999;
		font-size: 0.8rem;
		font-style: italic;
	}
</style>
