<script lang="ts">
	import { onMount } from 'svelte';
	import { Spring } from 'svelte/motion';

	// Type definitions - Same as BarComparison for consistency
	type ApiDataPoint = {
		month: string;
		product_id: string;
		product_name: string;
		sales: number;
		revenue: number;
		units_sold: number;
	};

	type ProcessedMonthData = {
		month: string;
		products: { [productId: string]: number };
	};

	type ProductInfo = {
		id: string;
		name: string;
		color: string;
	};

	let {
		// Real-world API data example - same as BarComparison
		apiData = [
			// January data
			{
				month: 'Jan',
				product_id: 'prod_001',
				product_name: 'iPhone 15',
				sales: 186000,
				revenue: 186000,
				units_sold: 186
			},
			{
				month: 'Jan',
				product_id: 'prod_002',
				product_name: 'Samsung Galaxy S24',
				sales: 305000,
				revenue: 305000,
				units_sold: 305
			},
			{
				month: 'Jan',
				product_id: 'prod_003',
				product_name: 'Google Pixel 8',
				sales: 237000,
				revenue: 237000,
				units_sold: 237
			},
			// February data
			{
				month: 'Feb',
				product_id: 'prod_001',
				product_name: 'iPhone 15',
				sales: 305000,
				revenue: 305000,
				units_sold: 305
			},
			{
				month: 'Feb',
				product_id: 'prod_002',
				product_name: 'Samsung Galaxy S24',
				sales: 237000,
				revenue: 237000,
				units_sold: 237
			},
			{
				month: 'Feb',
				product_id: 'prod_003',
				product_name: 'Google Pixel 8',
				sales: 186000,
				revenue: 186000,
				units_sold: 186
			},
			// March data
			{
				month: 'Mar',
				product_id: 'prod_001',
				product_name: 'iPhone 15',
				sales: 237000,
				revenue: 237000,
				units_sold: 237
			},
			{
				month: 'Mar',
				product_id: 'prod_002',
				product_name: 'Samsung Galaxy S24',
				sales: 186000,
				revenue: 186000,
				units_sold: 186
			},
			{
				month: 'Mar',
				product_id: 'prod_003',
				product_name: 'Google Pixel 8',
				sales: 305000,
				revenue: 305000,
				units_sold: 305
			},
			// April data
			{
				month: 'Apr',
				product_id: 'prod_001',
				product_name: 'iPhone 15',
				sales: 173000,
				revenue: 173000,
				units_sold: 173
			},
			{
				month: 'Apr',
				product_id: 'prod_002',
				product_name: 'Samsung Galaxy S24',
				sales: 214000,
				revenue: 214000,
				units_sold: 214
			},
			{
				month: 'Apr',
				product_id: 'prod_003',
				product_name: 'Google Pixel 8',
				sales: 209000,
				revenue: 209000,
				units_sold: 209
			},
			// May data
			{
				month: 'May',
				product_id: 'prod_001',
				product_name: 'iPhone 15',
				sales: 209000,
				revenue: 209000,
				units_sold: 209
			},
			{
				month: 'May',
				product_id: 'prod_002',
				product_name: 'Samsung Galaxy S24',
				sales: 173000,
				revenue: 173000,
				units_sold: 173
			},
			{
				month: 'May',
				product_id: 'prod_003',
				product_name: 'Google Pixel 8',
				sales: 214000,
				revenue: 214000,
				units_sold: 214
			},
			// June data
			{
				month: 'Jun',
				product_id: 'prod_001',
				product_name: 'iPhone 15',
				sales: 214000,
				revenue: 214000,
				units_sold: 214
			},
			{
				month: 'Jun',
				product_id: 'prod_002',
				product_name: 'Samsung Galaxy S24',
				sales: 209000,
				revenue: 209000,
				units_sold: 209
			},
			{
				month: 'Jun',
				product_id: 'prod_003',
				product_name: 'Google Pixel 8',
				sales: 173000,
				revenue: 173000,
				units_sold: 173
			}
		] as ApiDataPoint[],
		// What metric to display
		metric = 'units_sold' as keyof Pick<ApiDataPoint, 'sales' | 'revenue' | 'units_sold'>,
		// Color mapping for products
		productColors = {
			prod_001: '#3b82f6', // Blue
			prod_002: '#ef4444', // Red
			prod_003: '#10b981', // Green
			prod_004: '#f59e0b', // Yellow
			prod_005: '#8b5cf6' // Purple
		} as { [key: string]: string },
		width = 800 as number | string,
		height = 400 as number | string,
		padding = 60,
		showTooltip = true,
		animate = true,
		showLegend = true,
		showPoints = true,
		showValues = false,
		strokeWidth = 2,
		pointRadius = 4,
		legendGap = -24,
		curveType = 'smooth' as 'smooth' | 'straight', // Line curve type
		tension = 0.3 // Curve tension (0 = sharp, 1 = very smooth)
	} = $props();

	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		content: ''
	});

	let hoveredPoint = $state({ productId: '', monthIndex: -1 });
	let mounted = $state(false);
	let containerElement: HTMLDivElement;
	let containerWidth = $state(800);
	let containerHeight = $state(400);

	// Helper function to format dimension for CSS
	const formatDimension = (value: number | string): string => {
		if (typeof value === 'number') return `${value}px`;
		return value;
	};

	// Helper functions to handle responsive dimensions
	const getNumericValue = (value: number | string): number => {
		if (typeof value === 'number') return value;

		if (typeof value === 'string') {
			if (value.includes('vw')) {
				const num = parseFloat(value);
				if (typeof window !== 'undefined') {
					return (num / 100) * window.innerWidth;
				}
				return 800; // SSR fallback
			}
			if (value.includes('vh')) {
				const num = parseFloat(value);
				if (typeof window !== 'undefined') {
					return (num / 100) * window.innerHeight;
				}
				return 400; // SSR fallback
			}
			if (value.includes('px')) {
				return parseFloat(value);
			}
			if (value.includes('%')) {
				const num = parseFloat(value);
				return (num / 100) * 800; // Fallback
			}
			const parsed = parseFloat(value);
			return isNaN(parsed) ? 800 : parsed;
		}

		return 800; // Default fallback
	};

	// Get actual dimensions
	const actualWidth = $derived(
		(() => {
			if (typeof width === 'string' && (width.includes('%') || width === '100%')) {
				return containerWidth;
			}
			return getNumericValue(width);
		})()
	);

	const actualHeight = $derived(
		(() => {
			if (typeof height === 'string' && (height.includes('%') || height === '100%')) {
				return containerHeight;
			}
			return getNumericValue(height);
		})()
	);

	// Process API data to get unique products and months
	const uniqueProducts = $derived(
		(() => {
			const products = new Map<string, ProductInfo>();
			apiData.forEach((item) => {
				if (!products.has(item.product_id)) {
					products.set(item.product_id, {
						id: item.product_id,
						name: item.product_name,
						color: productColors[item.product_id] || '#666'
					});
				}
			});
			return Array.from(products.values()).slice(0, 5); // Max 5 products
		})()
	);

	const uniqueMonths = $derived(
		(() => {
			const months = new Set<string>();
			apiData.forEach((item) => months.add(item.month));
			return Array.from(months);
		})()
	);

	// Process data into chart format
	const processedData = $derived(
		(() => {
			const monthMap = new Map<string, ProcessedMonthData>();

			// Initialize months
			uniqueMonths.forEach((month) => {
				monthMap.set(month, {
					month,
					products: {}
				});
			});

			// Fill in data
			apiData.forEach((item) => {
				if (uniqueProducts.some((p) => p.id === item.product_id)) {
					const monthData = monthMap.get(item.month);
					if (monthData) {
						monthData.products[item.product_id] = item[metric];
					}
				}
			});

			return Array.from(monthMap.values());
		})()
	);

	// Calculate dimensions
	const legendHeight = showLegend ? 30 : 0;
	const chartWidth = $derived(actualWidth - padding * 2);
	const chartHeight = $derived(actualHeight - padding * 2 - legendHeight);

	// Find max value for scaling
	const maxValue = $derived(
		(() => {
			let max = 0;
			processedData.forEach((monthData) => {
				uniqueProducts.forEach((product) => {
					const value = monthData.products[product.id] || 0;
					if (value > max) max = value;
				});
			});
			return max;
		})()
	);

	// Calculate point positions for each product line
	const productLines = $derived(
		(() => {
			return uniqueProducts.map((product) => {
				const points = processedData.map((monthData, monthIndex) => {
					const value = monthData.products[product.id] || 0;
					const x = padding + (monthIndex * chartWidth) / (processedData.length - 1);
					const y = padding + chartHeight - (value / maxValue) * chartHeight;
					return { x, y, value, monthIndex, month: monthData.month };
				});
				return { product, points };
			});
		})()
	);

	// Create smooth curve path using Catmull-Rom spline
	const createSmoothPath = (points: any[]) => {
		if (points.length < 2) return '';

		if (curveType === 'straight') {
			return (
				`M ${points[0].x},${points[0].y} ` +
				points
					.slice(1)
					.map((p) => `L ${p.x},${p.y}`)
					.join(' ')
			);
		}

		// For 2 points, use a simple curve
		if (points.length === 2) {
			const start = points[0];
			const end = points[1];
			const dx = end.x - start.x;
			const midTension = tension * 0.5;
			const cp1x = start.x + dx * midTension;
			const cp1y = start.y;
			const cp2x = end.x - dx * midTension;
			const cp2y = end.y;
			return `M ${start.x},${start.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${end.x},${end.y}`;
		}

		// Catmull-Rom spline for 3+ points - naturally smooth without overshoot
		let path = `M ${points[0].x},${points[0].y}`;

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = i === 0 ? points[0] : points[i - 1];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = i === points.length - 2 ? points[points.length - 1] : points[i + 2];

			// Calculate control points using Catmull-Rom
			const t = tension * 0.5; // Reduce tension for smoother curves

			// Control point 1 (for current segment)
			const cp1x = p1.x + (p2.x - p0.x) * t;
			const cp1y = p1.y + (p2.y - p0.y) * t;

			// Control point 2 (for current segment)
			const cp2x = p2.x - (p3.x - p1.x) * t;
			const cp2y = p2.y - (p3.y - p1.y) * t;

			path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
		}

		return path;
	};

	// Animation springs for line paths
	const animatedOpacity = $derived(
		uniqueProducts.map(() => new Spring(0, { stiffness: 0.1, damping: 0.8 }))
	);

	onMount(() => {
		mounted = true;

		// Set up ResizeObserver
		if (containerElement) {
			const updateContainerSize = () => {
				const rect = containerElement.getBoundingClientRect();
				containerWidth = rect.width;
				containerHeight = rect.height;
			};

			updateContainerSize();
			const resizeObserver = new ResizeObserver(updateContainerSize);
			resizeObserver.observe(containerElement);

			return () => {
				resizeObserver.disconnect();
			};
		}
	});

	// Animate lines when mounted
	$effect(() => {
		if (mounted && animate) {
			animatedOpacity.forEach((spring, index) => {
				setTimeout(() => {
					spring.target = 1;
				}, index * 200);
			});
		} else if (mounted) {
			animatedOpacity.forEach((spring) => {
				spring.target = 1;
			});
		}
	});

	function handlePointMouseEnter(
		event: MouseEvent,
		productId: string,
		monthIndex: number,
		value: number,
		month: string
	) {
		if (!showTooltip) return;

		hoveredPoint = { productId, monthIndex };
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		const product = uniqueProducts.find((p) => p.id === productId);

		tooltip.visible = true;
		tooltip.x = rect.left + rect.width / 2;
		tooltip.y = rect.top - 10;
		tooltip.content = `${product?.name} (${month}): ${value.toLocaleString()}`;
	}

	function handlePointMouseLeave() {
		if (!showTooltip) return;

		hoveredPoint = { productId: '', monthIndex: -1 };
		tooltip.visible = false;
	}

	function handleMouseMove(event: MouseEvent) {
		if (!showTooltip || !tooltip.visible) return;

		tooltip.x = event.clientX;
		tooltip.y = event.clientY - 10;
	}
</script>

<div
	bind:this={containerElement}
	class="chart-container"
	style="width: {formatDimension(width)}; height: {formatDimension(
		height
	)}; --legend-gap: {legendGap}px; --legend-height: {legendHeight}px;"
>
	<svg width="100%" height="100%" viewBox="0 0 {actualWidth} {actualHeight - legendHeight}">
		<!-- Y-axis guidelines -->
		{#each Array(6) as _, i}
			{@const yPos = padding + (chartHeight / 5) * i}
			{@const value = Math.round(maxValue - (maxValue / 5) * i)}

			<line
				x1={padding}
				y1={yPos}
				x2={padding + chartWidth}
				y2={yPos}
				stroke="#f0f0f0"
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

		<!-- X-axis guidelines -->
		{#each processedData as monthData, monthIndex}
			{@const xPos = padding + (monthIndex * chartWidth) / (processedData.length - 1)}

			<line
				x1={xPos}
				y1={padding}
				x2={xPos}
				y2={padding + chartHeight}
				stroke="#f0f0f0"
				stroke-width="1"
				opacity="0.3"
			/>
		{/each}

		<!-- Product lines -->
		{#each productLines as { product, points }, productIndex}
			{@const pathData = createSmoothPath(points)}
			{@const opacity = animate ? animatedOpacity[productIndex].current : 1}

			<!-- Line path -->
			<path
				d={pathData}
				stroke={product.color}
				stroke-width={strokeWidth}
				fill="none"
				{opacity}
				class="line-path"
				style="stroke-dasharray: {animate && !mounted ? '5,5' : 'none'}"
			/>

			<!-- Data points -->
			{#each points as point}
				{@const isHovered =
					hoveredPoint.productId === product.id && hoveredPoint.monthIndex === point.monthIndex}

				{#if showPoints}
					<circle
						cx={point.x}
						cy={point.y}
						r={isHovered ? pointRadius + 2 : pointRadius}
						fill={product.color}
						stroke="white"
						stroke-width="2"
						{opacity}
						class="data-point"
						role="graphics-symbol"
						aria-label="{product.name} {point.month}: {point.value}"
						onmouseenter={(e) =>
							handlePointMouseEnter(e, product.id, point.monthIndex, point.value, point.month)}
						onmouseleave={handlePointMouseLeave}
						onmousemove={handleMouseMove}
					/>
				{/if}

				<!-- Value labels -->
				{#if showValues}
					<text
						x={point.x}
						y={point.y - 15}
						text-anchor="middle"
						class="value-label"
						fill={product.color}
						font-size="9"
						font-weight="500"
						{opacity}
					>
						{point.value.toLocaleString()}
					</text>
				{/if}
			{/each}
		{/each}

		<!-- Month labels at bottom -->
		{#each processedData as monthData, monthIndex}
			{@const xPos = padding + (monthIndex * chartWidth) / (processedData.length - 1)}

			<text
				x={xPos}
				y={padding + chartHeight + 16}
				text-anchor="middle"
				class="month-label"
				fill="#666"
				font-size="12"
				font-weight="500"
			>
				{monthData.month}
			</text>
		{/each}

		<!-- Y-axis line -->
		<line
			x1={padding}
			y1={padding}
			x2={padding}
			y2={padding + chartHeight}
			stroke="#ccc"
			stroke-width="1"
		/>

		<!-- X-axis line -->
		<line
			x1={padding}
			y1={padding + chartHeight}
			x2={padding + chartWidth}
			y2={padding + chartHeight}
			stroke="#ccc"
			stroke-width="1"
		/>
	</svg>

	<!-- Legend -->
	{#if showLegend}
		<div class="legend">
			{#each uniqueProducts as product}
				<div class="legend-item">
					<div class="legend-color" style="background-color: {product.color};"></div>
					<span class="legend-label">{product.name}</span>
				</div>
			{/each}
		</div>
	{/if}
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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		box-sizing: border-box;
	}

	.chart-container svg {
		width: 100%;
		height: calc(100% - var(--legend-height, 0px));
		display: block;
		overflow: visible;
	}

	.line-path {
		transition: stroke-width 0.2s ease;
	}

	.line-path:hover {
		stroke-width: 3;
	}

	.data-point {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.data-point:hover {
		filter: brightness(1.2);
	}

	.value-label {
		pointer-events: none;
		font-family: inherit;
	}

	.month-label {
		pointer-events: none;
		font-family: inherit;
	}

	.axis-label {
		pointer-events: none;
		font-family: inherit;
	}

	.legend {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: var(--legend-gap);
		padding: 0 20px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-label {
		font-size: 12px;
		color: #666;
		white-space: nowrap;
	}

	.tooltip {
		position: fixed;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		pointer-events: none;
		z-index: 1000;
		transform: translateX(-50%) translateY(-100%);
		white-space: nowrap;
		font-family: inherit;
		max-width: 200px;
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
