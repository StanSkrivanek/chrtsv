<script lang="ts">
	import BarComparison from '../BarComparison.svelte';

	// Example: Real-world API data structure
	// This is how data typically comes from a backend API
	const salesApiData = [
		// January sales data
		{ month: 'Jan', product_id: 'iphone_15', product_name: 'iPhone 15', sales: 1850000, revenue: 1850000, units_sold: 1850 },
		{ month: 'Jan', product_id: 'samsung_s24', product_name: 'Samsung Galaxy S24', sales: 1420000, revenue: 1420000, units_sold: 1420 },
		{ month: 'Jan', product_id: 'pixel_8', product_name: 'Google Pixel 8', sales: 980000, revenue: 980000, units_sold: 980 },
		{ month: 'Jan', product_id: 'oneplus_12', product_name: 'OnePlus 12', sales: 650000, revenue: 650000, units_sold: 650 },
		{ month: 'Jan', product_id: 'xiaomi_14', product_name: 'Xiaomi 14', sales: 890000, revenue: 890000, units_sold: 890 },
		
		// February sales data
		{ month: 'Feb', product_id: 'iphone_15', product_name: 'iPhone 15', sales: 2100000, revenue: 2100000, units_sold: 2100 },
		{ month: 'Feb', product_id: 'samsung_s24', product_name: 'Samsung Galaxy S24', sales: 1650000, revenue: 1650000, units_sold: 1650 },
		{ month: 'Feb', product_id: 'pixel_8', product_name: 'Google Pixel 8', sales: 1100000, revenue: 1100000, units_sold: 1100 },
		{ month: 'Feb', product_id: 'oneplus_12', product_name: 'OnePlus 12', sales: 720000, revenue: 720000, units_sold: 720 },
		{ month: 'Feb', product_id: 'xiaomi_14', product_name: 'Xiaomi 14', sales: 950000, revenue: 950000, units_sold: 950 },
		
		// March sales data
		{ month: 'Mar', product_id: 'iphone_15', product_name: 'iPhone 15', sales: 1950000, revenue: 1950000, units_sold: 1950 },
		{ month: 'Mar', product_id: 'samsung_s24', product_name: 'Samsung Galaxy S24', sales: 1580000, revenue: 1580000, units_sold: 1580 },
		{ month: 'Mar', product_id: 'pixel_8', product_name: 'Google Pixel 8', sales: 1200000, revenue: 1200000, units_sold: 1200 },
		{ month: 'Mar', product_id: 'oneplus_12', product_name: 'OnePlus 12', sales: 800000, revenue: 800000, units_sold: 800 },
		{ month: 'Mar', product_id: 'xiaomi_14', product_name: 'Xiaomi 14', sales: 1100000, revenue: 1100000, units_sold: 1100 },
		
		// April sales data
		{ month: 'Apr', product_id: 'iphone_15', product_name: 'iPhone 15', sales: 2250000, revenue: 2250000, units_sold: 2250 },
		{ month: 'Apr', product_id: 'samsung_s24', product_name: 'Samsung Galaxy S24', sales: 1700000, revenue: 1700000, units_sold: 1700 },
		{ month: 'Apr', product_id: 'pixel_8', product_name: 'Google Pixel 8', sales: 1350000, revenue: 1350000, units_sold: 1350 },
		{ month: 'Apr', product_id: 'oneplus_12', product_name: 'OnePlus 12', sales: 900000, revenue: 900000, units_sold: 900 },
		{ month: 'Apr', product_id: 'xiaomi_14', product_name: 'Xiaomi 14', sales: 1250000, revenue: 1250000, units_sold: 1250 },
		
		// May sales data
		{ month: 'May', product_id: 'iphone_15', product_name: 'iPhone 15', sales: 2400000, revenue: 2400000, units_sold: 2400 },
		{ month: 'May', product_id: 'samsung_s24', product_name: 'Samsung Galaxy S24', sales: 1800000, revenue: 1800000, units_sold: 1800 },
		{ month: 'May', product_id: 'pixel_8', product_name: 'Google Pixel 8', sales: 1450000, revenue: 1450000, units_sold: 1450 },
		{ month: 'May', product_id: 'oneplus_12', product_name: 'OnePlus 12', sales: 1000000, revenue: 1000000, units_sold: 1000 },
		{ month: 'May', product_id: 'xiaomi_14', product_name: 'Xiaomi 14', sales: 1350000, revenue: 1350000, units_sold: 1350 },
		
		// June sales data
		{ month: 'Jun', product_id: 'iphone_15', product_name: 'iPhone 15', sales: 2300000, revenue: 2300000, units_sold: 2300 },
		{ month: 'Jun', product_id: 'samsung_s24', product_name: 'Samsung Galaxy S24', sales: 1750000, revenue: 1750000, units_sold: 1750 },
		{ month: 'Jun', product_id: 'pixel_8', product_name: 'Google Pixel 8', sales: 1400000, revenue: 1400000, units_sold: 1400 },
		{ month: 'Jun', product_id: 'oneplus_12', product_name: 'OnePlus 12', sales: 950000, revenue: 950000, units_sold: 950 },
		{ month: 'Jun', product_id: 'xiaomi_14', product_name: 'Xiaomi 14', sales: 1300000, revenue: 1300000, units_sold: 1300 }
	];

	// Product color mapping (usually comes from design system or API)
	const productColors = {
		'iphone_15': '#007AFF',      // Apple Blue
		'samsung_s24': '#1428A0',    // Samsung Blue
		'pixel_8': '#4285F4',        // Google Blue
		'oneplus_12': '#FF6B35',     // OnePlus Orange
		'xiaomi_14': '#FF6900'       // Xiaomi Orange
	};

	// Different metric options
	let selectedMetric: 'sales' | 'revenue' | 'units_sold' = 'units_sold';
	
	// Chart configuration
	let showAnimation = true;
	let showValues = true;
	let showLegend = true;
</script>

<div class="example-container">
	<h1>Bar Comparison Chart - Real-world API Data Example</h1>
	
	<!-- Controls -->
	<div class="controls">
		<div class="control-group">
			<label for="metric">Metric:</label>
			<select id="metric" bind:value={selectedMetric}>
				<option value="units_sold">Units Sold</option>
				<option value="sales">Sales ($)</option>
				<option value="revenue">Revenue ($)</option>
			</select>
		</div>
		
		<div class="control-group">
			<label>
				<input type="checkbox" bind:checked={showAnimation} />
				Enable Animation
			</label>
		</div>
		
		<div class="control-group">
			<label>
				<input type="checkbox" bind:checked={showValues} />
				Show Values
			</label>
		</div>
		
		<div class="control-group">
			<label>
				<input type="checkbox" bind:checked={showLegend} />
				Show Legend
			</label>
		</div>
	</div>

	<!-- Chart -->
	<div class="chart-wrapper">
		<BarComparison
			apiData={salesApiData}
			metric={selectedMetric}
			productColors={productColors}
			width={900}
			height={500}
			padding={80}
			showTooltip={true}
			animate={showAnimation}
			showLegend={showLegend}
			showValues={showValues}
			groupSpacing={50}
			barSpacing={4}
		/>
	</div>

	<!-- Data Structure Documentation -->
	<div class="documentation">
		<h2>API Data Structure</h2>
		<p>This chart expects data in the following format (typical API response):</p>
		<pre><code>{JSON.stringify([
			{
				month: 'Jan',
				product_id: 'iphone_15',
				product_name: 'iPhone 15',
				sales: 1850000,
				revenue: 1850000,
				units_sold: 1850
			},
			// ... more data points
		], null, 2)}</code></pre>
		
		<h3>Key Benefits:</h3>
		<ul>
			<li>✅ <strong>Real-world API structure</strong> - Matches how data comes from backend APIs</li>
			<li>✅ <strong>Proper data association</strong> - Each value is clearly linked to its product and time period</li>
			<li>✅ <strong>Flexible metrics</strong> - Can display different metrics (sales, revenue, units) from the same data</li>
			<li>✅ <strong>Scalable</strong> - Supports up to 5 products for optimal readability</li>
			<li>✅ <strong>Type-safe</strong> - Full TypeScript support with proper type definitions</li>
		</ul>
		
		<h3>Usage Example:</h3>
		<pre><code>{`<BarComparison
  apiData={salesApiData}
  metric="units_sold"
  productColors={productColors}
  width={900}
  height={500}
  showLegend={true}
  animate={true}
/>`}</code></pre>
	</div>
</div>

<style>
	.example-container {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		color: #333;
		margin-bottom: 2rem;
		text-align: center;
	}

	.controls {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		flex-wrap: wrap;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-group label {
		font-weight: 500;
		color: #555;
	}

	.control-group select {
		padding: 0.25rem 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
	}

	.chart-wrapper {
		display: flex;
		justify-content: center;
		margin: 2rem 0;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.documentation {
		margin-top: 3rem;
		padding: 2rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.documentation h2 {
		color: #333;
		margin-top: 0;
	}

	.documentation pre {
		background: #2d3748;
		color: #e2e8f0;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.875rem;
	}

	.documentation ul {
		list-style: none;
		padding: 0;
	}

	.documentation li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.documentation li:last-child {
		border-bottom: none;
	}
</style>
