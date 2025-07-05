<script lang="ts">
	import { onMount } from 'svelte';
	import { Spring } from 'svelte/motion';

	// Type definitions - Real-world API data structure
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
		// Real-world API data example
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
			{
				month: 'Jan',
				product_id: 'prod_004',
				product_name: 'OnePlus 12',
				sales: 173000,
				revenue: 173000,
				units_sold: 173
			},
			{
				month: 'Jan',
				product_id: 'prod_005',
				product_name: 'Xiaomi 14',
				sales: 209000,
				revenue: 209000,
				units_sold: 209
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
			{
				month: 'Feb',
				product_id: 'prod_004',
				product_name: 'OnePlus 12',
				sales: 214000,
				revenue: 214000,
				units_sold: 214
			},
			{
				month: 'Feb',
				product_id: 'prod_005',
				product_name: 'Xiaomi 14',
				sales: 173000,
				revenue: 173000,
				units_sold: 173
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
			{
				month: 'Mar',
				product_id: 'prod_004',
				product_name: 'OnePlus 12',
				sales: 209000,
				revenue: 209000,
				units_sold: 209
			},
			{
				month: 'Mar',
				product_id: 'prod_005',
				product_name: 'Xiaomi 14',
				sales: 214000,
				revenue: 214000,
				units_sold: 214
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
			{
				month: 'Apr',
				product_id: 'prod_004',
				product_name: 'OnePlus 12',
				sales: 186000,
				revenue: 186000,
				units_sold: 186
			},
			{
				month: 'Apr',
				product_id: 'prod_005',
				product_name: 'Xiaomi 14',
				sales: 400000,
				revenue: 400000,
				units_sold: 400
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
			{
				month: 'May',
				product_id: 'prod_004',
				product_name: 'OnePlus 12',
				sales: 305000,
				revenue: 305000,
				units_sold: 305
			},
			{
				month: 'May',
				product_id: 'prod_005',
				product_name: 'Xiaomi 14',
				sales: 237000,
				revenue: 237000,
				units_sold: 237
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
			},
			{
				month: 'Jun',
				product_id: 'prod_004',
				product_name: 'OnePlus 12',
				sales: 237000,
				revenue: 237000,
				units_sold: 237
			},
			{
				month: 'Jun',
				product_id: 'prod_005',
				product_name: 'Xiaomi 14',
				sales: 186000,
				revenue: 186000,
				units_sold: 186
			}
		] as ApiDataPoint[],
		// What metric to display (sales, revenue, units_sold)
		metric = 'units_sold' as keyof Pick<ApiDataPoint, 'sales' | 'revenue' | 'units_sold'>,
		// Color mapping for products
		productColors = {
			prod_001: '#93C5FD', // iPhone - Blue
			prod_002: '#6a4c93', // Samsung - Purple
			prod_003: '#8ac926', // Google - Green
			prod_004: '#1982c4', // OnePlus - Dark Blue
			prod_005: '#ff595e' // Xiaomi - Red
		} as { [key: string]: string },
		width = 800 as number | string,
		height = 400 as number | string,
		padding = 60,
		showTooltip = true,
		animate = true,
		groupSpacing = 24,
		barSpacing = 2,
		showLegend = true,
		showValues = true,
		legendGap = -24 // Distance between chart and legend
	} = $props();

	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		content: ''
	});

	let hoveredBar = $state({ monthIndex: -1, itemIndex: -1 });
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
		
		// Handle viewport units
		if (typeof value === 'string') {
			if (value.includes('vw')) {
				const num = parseFloat(value);
				if (typeof window !== 'undefined') {
					return (num / 100) * window.innerWidth;
				}
				return 900; // SSR fallback
			}
			if (value.includes('vh')) {
				const num = parseFloat(value);
				if (typeof window !== 'undefined') {
					return (num / 100) * window.innerHeight;
				}
				return 360; // SSR fallback
			}
			if (value.includes('px')) {
				return parseFloat(value);
			}
			if (value.includes('%')) {
				// For percentage, we need to handle it in CSS
				// For now, provide a reasonable numeric fallback
				const num = parseFloat(value);
				return (num / 100) * 800; // Fallback to 800px as base
			}
			// Try to parse as number
			const parsed = parseFloat(value);
			return isNaN(parsed) ? 900 : parsed;
		}
		
		return 900; // Default fallback
	};

	// Get actual dimensions - use container size for percentage/relative units
	const actualWidth = $derived((() => {
		if (typeof width === 'string' && (width.includes('%') || width === '100%')) {
			return containerWidth;
		}
		return getNumericValue(width);
	})());

	const actualHeight = $derived((() => {
		if (typeof height === 'string' && (height.includes('%') || height === '100%')) {
			return containerHeight;
		}
		return getNumericValue(height);
	})());

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

	// Validate data - ensure max 5 items
	const validatedItems = $derived(uniqueProducts);
	const validatedData = $derived(processedData);

	// Calculate dimensions
	const legendHeight = showLegend ? 30 : 0;
	const chartWidth = $derived(actualWidth - padding * 2);
	const chartHeight = $derived(actualHeight - padding * 2 - legendHeight);

	// Calculate bar dimensions
	const groupWidth = $derived(
		(chartWidth - (validatedData.length - 1) * groupSpacing) / validatedData.length
	);
	const barWidth = $derived(
		(groupWidth - (validatedItems.length - 1) * barSpacing) / validatedItems.length
	);

	// Find max value for scaling
	const maxValue = $derived(
		(() => {
			let max = 0;
			validatedData.forEach((monthData) => {
				validatedItems.forEach((product) => {
					const value = monthData.products[product.id] || 0;
					if (value > max) max = value;
				});
			});
			return max;
		})()
	);

	// Create Spring instances for each bar
	const animatedHeights = $derived(
		validatedData.map(() =>
			validatedItems.map(() => new Spring(0, { stiffness: 0.1, damping: 0.8 }))
		)
	);

	// Calculate bar heights
	const barHeights = $derived(
		validatedData.map((monthData) =>
			validatedItems.map((product) => {
				const value = monthData.products[product.id] || 0;
				return (value / maxValue) * chartHeight;
			})
		)
	);

	onMount(() => {
		mounted = true;
		
		// Set up ResizeObserver to track container size changes
		if (containerElement) {
			const updateContainerSize = () => {
				const rect = containerElement.getBoundingClientRect();
				containerWidth = rect.width;
				containerHeight = rect.height;
			};
			
			// Initial size
			updateContainerSize();
			
			// Watch for size changes
			const resizeObserver = new ResizeObserver(updateContainerSize);
			resizeObserver.observe(containerElement);
			
			return () => {
				resizeObserver.disconnect();
			};
		}
	});

	// Animate bars when mounted
	$effect(() => {
		if (mounted && animate) {
			barHeights.forEach((monthHeights, monthIndex) => {
				monthHeights.forEach((height, itemIndex) => {
					setTimeout(
						() => {
							animatedHeights[monthIndex][itemIndex].target = height;
						},
						(monthIndex * validatedItems.length + itemIndex) * 50
					);
				});
			});
		} else if (mounted) {
			barHeights.forEach((monthHeights, monthIndex) => {
				monthHeights.forEach((height, itemIndex) => {
					animatedHeights[monthIndex][itemIndex].target = height;
				});
			});
		}
	});

	function handleMouseEnter(event: MouseEvent, monthIndex: number, itemIndex: number) {
		if (!showTooltip) return;

		hoveredBar = { monthIndex, itemIndex };
		const rect = (event.target as HTMLElement).getBoundingClientRect();

		const monthData = validatedData[monthIndex];
		const product = validatedItems[itemIndex];
		const value = monthData.products[product.id] || 0;

		tooltip.visible = true;
		tooltip.x = rect.left + rect.width / 2;
		tooltip.y = rect.top - 10;
		tooltip.content = `${product.name} (${monthData.month}): ${value.toLocaleString()}`;
	}

	function handleMouseLeave() {
		if (!showTooltip) return;

		hoveredBar = { monthIndex: -1, itemIndex: -1 };
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
	style="width: {formatDimension(width)}; height: {formatDimension(height)}; --legend-gap: {legendGap}px; --legend-height: {legendHeight}px;"
>
	<svg width="100%" height="100%" viewBox="0 0 {actualWidth} {actualHeight - legendHeight}">
		<!-- Chart bars -->
		{#each validatedData as monthData, monthIndex}
			{@const groupX = padding + monthIndex * (groupWidth + groupSpacing)}

			{#each validatedItems as product, itemIndex}
				{@const value = monthData.products[product.id] || 0}
				{@const x = groupX + itemIndex * (barWidth + barSpacing)}
				{@const barHeight = animate
					? animatedHeights[monthIndex][itemIndex].current
					: barHeights[monthIndex][itemIndex]}
				{@const y = padding + chartHeight - barHeight}
				{@const isHovered =
					hoveredBar.monthIndex === monthIndex && hoveredBar.itemIndex === itemIndex}

				<rect
					{x}
					{y}
					width={barWidth}
					height={barHeight}
					fill={product.color}
					stroke={isHovered ? 'rgba(255,255,255,0.3)' : 'none'}
					stroke-width={isHovered ? 2 : 0}
					opacity={isHovered ? 0.8 : 1}
					rx="3"
					ry="3"
					class="bar"
					role="graphics-symbol"
					aria-label="{product.name} {monthData.month}: {value}"
					onmouseenter={(e) => handleMouseEnter(e, monthIndex, itemIndex)}
					onmouseleave={handleMouseLeave}
					onmousemove={handleMouseMove}
				/>

				<!-- Value labels on top of bars -->
				{#if showValues && barHeight > 20}
					<text
						x={x + barWidth / 2}
						y={y - 8}
						text-anchor="middle"
						class="value-label"
						fill="#333"
						font-size="10"
						font-weight="500"
					>
						{value.toLocaleString()}
					</text>
				{/if}
			{/each}

			<!-- Month labels at bottom -->
			<text
				x={groupX + groupWidth / 2}
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

		<!-- Y-axis guidelines -->
		{#each Array(6) as _, i}
			{@const yPos = padding + (chartHeight / 5) * i}
			{@const value = Math.round(maxValue - (maxValue / 5) * i)}

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
			{#each validatedItems as product}
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

	.bar {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.bar:hover {
		filter: brightness(1.1);
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
		border-radius: 2px;
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
