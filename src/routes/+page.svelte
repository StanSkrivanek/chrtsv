<script lang="ts">
	import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';

	// Example data for multiple product lines
	const productData = [
		{
			id: 'desktop',
			label: 'Desktop Sales',
			color: '#3b82f6',
			data: [
				{ month: 'Jan', sales: 1000, revenue: 5000, units_sold: 100 },
				{ month: 'Feb', sales: 3200, revenue: 2000, units_sold: 120 },
				{ month: 'Mar', sales: 2800, revenue: 3800, units_sold: 280 },
				{ month: 'Apr', sales: 2370, revenue: 6450, units_sold: 207 },
				{ month: 'May', sales: 3500, revenue: 7500, units_sold: 350 },
				{ month: 'Jun', sales: 3200, revenue: 6000, units_sold: 320 }
			]
		},
		{
			id: 'mobile',
			label: 'Mobile Sales',
			color: '#ef4444',
			data: [
				{ month: 'Jan', sales: 800, revenue: 4000, units_sold: 80 },
				{ month: 'Feb', sales: 2500, revenue: 1800, units_sold: 95 },
				{ month: 'Mar', sales: 3200, revenue: 4200, units_sold: 320 },
				{ month: 'Apr', sales: 2800, revenue: 7200, units_sold: 280 },
				{ month: 'May', sales: 4200, revenue: 8500, units_sold: 420 },
				{ month: 'Jun', sales: 3800, revenue: 7200, units_sold: 380 }
			]
		},
		{
			id: 'tablet',
			label: 'Tablet Sales',
			color: '#10b981',
			data: [
				{ month: 'Jan', sales: 500, revenue: 2500, units_sold: 50 },
				{ month: 'Feb', sales: 1200, revenue: 1200, units_sold: 60 },
				{ month: 'Mar', sales: 1800, revenue: 2800, units_sold: 180 },
				{ month: 'Apr', sales: 1500, revenue: 4200, units_sold: 150 },
				{ month: 'May', sales: 2200, revenue: 5200, units_sold: 220 },
				{ month: 'Jun', sales: 2000, revenue: 4800, units_sold: 200 }
			]
		}
	];

	let selectedMetric = 'sales' as 'sales' | 'revenue' | 'units_sold';

	const metrics = [
		{ value: 'sales' as const, label: 'Sales ($)' },
		{ value: 'revenue' as const, label: 'Revenue ($)' },
		{ value: 'units_sold' as const, label: 'Units Sold' }
	];
</script>
<div class="example-container">
	<h1>Single Line Chart Example</h1>
	<MultiLineChart
		lines={[productData[0]]}
		xKey="month"
		yKey={selectedMetric}
		title={`Product Performance - ${metrics.find((m) => m.value === selectedMetric)?.label}`}
		showLegend={true}
		height={450}
	/>

	<div class="description">
		<h2>Features Demonstrated:</h2>
		<ul>
			<li>Single data series (Desktop Sales)</li>
			<li>Interactive legend with hover effects</li>
			<li>Dynamic metric switching</li>
			<li>Responsive design</li>
			<li>Tooltip on data point hover</li>
			<li>Color-coded lines with accessibility support</li>
		</ul>
	</div>
</div>

<div class="example-container">
	<h1>Multi Line Chart Example</h1>

	<div class="controls">
		<label for="metric-select">Select Metric:</label>
		<select id="metric-select" bind:value={selectedMetric}>
			{#each metrics as metric}
				<option value={metric.value}>{metric.label}</option>
			{/each}
		</select>
	</div>

	<MultiLineChart
		lines={productData}
		xKey="month"
		yKey={selectedMetric}
		title={`Product Performance - ${metrics.find((m) => m.value === selectedMetric)?.label}`}
		showLegend={true}
		height={450}
	/>

	<div class="description">
		<h2>Features Demonstrated:</h2>
		<ul>
			<li>Multiple data series (Desktop, Mobile, Tablet)</li>
			<li>Interactive legend with hover effects</li>
			<li>Dynamic metric switching</li>
			<li>Responsive design</li>
			<li>Tooltip on data point hover</li>
			<li>Color-coded lines with accessibility support</li>
		</ul>
	</div>
</div>

<style>
	.example-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		color: #1e293b;
		margin-bottom: 2rem;
		text-align: center;
	}

	.controls {
		margin-bottom: 2rem;
		text-align: center;
	}

	.controls label {
		display: inline-block;
		margin-right: 1rem;
		font-weight: 600;
		color: #374151;
	}

	.controls select {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.controls select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.description {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.description h2 {
		color: #1e293b;
		margin-bottom: 1rem;
	}

	.description ul {
		color: #64748b;
		line-height: 1.6;
	}

	.description li {
		margin-bottom: 0.5rem;
	}
</style>
