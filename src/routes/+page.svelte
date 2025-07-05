<script lang="ts">
	import BasicLineChart from '$lib/components/charts/BasicLineChart.svelte';
	import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';
	import daily_data from '$lib/data/visitors-data.json';

	const lineData = [
		{
			month: 'Jan',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 1000, // $100k in sales
			revenue: 5000, // $85k revenue (after costs)
			units_sold: 100 // 100 units sold
		},
		{
			month: 'Feb',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 3200, // $320k in sales
			revenue: 2000, // $272k revenue
			units_sold: 120 // 320 units sold
		},
		{
			month: 'Mar',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 2800, // $280k in sales
			revenue: 3800, // $238k revenue
			units_sold: 280 // 280 units sold
		},
		{
			month: 'Apr',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 2370, // $237k in sales
			revenue: 6450, // $201k revenue
			units_sold: 207 // 237 units sold
		},
		{
			month: 'May',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 3500, // $350k in sales
			revenue: 7500, // $297k revenue
			units_sold: 350 // 350 units sold
		},
		{
			month: 'Jun',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 3200, // $320k in sales
			revenue: 6000, // $272k revenue
			units_sold: 320 // 320 units sold
		}
	];

	const lineColors = {
		desktop: '#ff55Ad'
	};
	// Add reactive metric selection
	let selectedMetric = 'revenue' as keyof Pick<any, 'sales' | 'revenue' | 'units_sold'>;
	const metrics = [
		{ value: 'sales' as const, label: 'Sales ($)' },
		{ value: 'revenue' as const, label: 'Revenue ($)' },
		{ value: 'units_sold' as const, label: 'Units Sold' }
	];

	// Sample data for multiple lines
	const multiLineData = [
		{
			id: 'desktop',
			label: 'Desktop',
			color: '#3b82f6',
			data: lineData
		},
		{
			id: 'mobile',
			label: 'Mobile',
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
			label: 'Tablet',
			color: '#10b981',
			data: [
				{ month: 'Jan', sales: 500, revenue: 2500, units_sold: 50 },
				{ month: 'Feb', sales: 1200, revenue: 1200, units_sold: 60 },
				{ month: 'Mar', sales: 1800, revenue: 2800, units_sold: 180 },
				{ month: 'Apr', sales: 1500, revenue: 4200, units_sold: 150 },
				{ month: 'May', sales: 2200, revenue: 5200, units_sold: 220 },
				{ month: 'Jun', sales: 2000, revenue: 4800, units_sold: 200 }
			]
		},
		{
			id: 'smartwatch',
			label: 'Smart Watch',
			color: '#f59e0b',
			data: [
				{ month: 'Jan', sales: 200, revenue: 1000, units_sold: 20 },
				{ month: 'Feb', sales: 800, revenue: 800, units_sold: 40 },
				{ month: 'Mar', sales: 1200, revenue: 1800, units_sold: 120 },
				{ month: 'Apr', sales: 1100, revenue: 2800, units_sold: 110 },
				{ month: 'May', sales: 1800, revenue: 3600, units_sold: 180 },
				{ month: 'Jun', sales: 1600, revenue: 3200, units_sold: 160 }
			]
		},
		{
			id: 'laptop',
			label: 'Laptop',
			color: '#8b5cf6',
			data: [
				{ month: 'Jan', sales: 1200, revenue: 6000, units_sold: 120 },
				{ month: 'Feb', sales: 2800, revenue: 2200, units_sold: 140 },
				{ month: 'Mar', sales: 2200, revenue: 3202, units_sold: 220 },
				{ month: 'Apr', sales: 1800, revenue: 5400, units_sold: 180 },
				{ month: 'May', sales: 3000, revenue: 6000, units_sold: 300 },
				{ month: 'Jun', sales: 2600, revenue: 5200, units_sold: 260 }
			]
		}
	];

	// Sample data with server-style dates
	const dateBasedData = [
		{
			id: 'users',
			label: 'Active Users',
			color: '#3b82f6',
			data: [
				{ date: '2024-01-15T00:00:00Z', value: 1250 },
				{ date: '2024-02-15T00:00:00Z', value: 1680 },
				{ date: '2024-03-15T00:00:00Z', value: 1420 },
				{ date: '2024-04-15T00:00:00Z', value: 1890 },
				{ date: '2024-05-15T00:00:00Z', value: 2100 },
				{ date: '2024-06-15T00:00:00Z', value: 1950 }
			]
		},
		{
			id: 'sessions',
			label: 'Session Count',
			color: '#ef4444',
			data: [
				{ date: '2024-01-15T00:00:00Z', value: 3200 },
				{ date: '2024-02-15T00:00:00Z', value: 4100 },
				{ date: '2024-03-15T00:00:00Z', value: 3800 },
				{ date: '2024-04-15T00:00:00Z', value: 4600 },
				{ date: '2024-05-15T00:00:00Z', value: 5200 },
				{ date: '2024-06-15T00:00:00Z', value: 4900 }
			]
		},
		{
			id: 'pageviews',
			label: 'Page Views',
			color: '#10b981',
			data: [
				{ date: '2024-01-15T00:00:00Z', value: 8500 },
				{ date: '2024-02-15T00:00:00Z', value: 11200 },
				{ date: '2024-03-15T00:00:00Z', value: 9800 },
				{ date: '2024-04-15T00:00:00Z', value: 12800 },
				{ date: '2024-05-15T00:00:00Z', value: 14500 },
				{ date: '2024-06-15T00:00:00Z', value: 13200 }
			]
		}
	];
</script>

<div class="container">
	<h1>Chart Components Demo</h1>

	<section class="chart-section">
		<h2>Basic Line Chart</h2>
		<p>This is a basic line chart example using Svelte and Chart.js.</p>
		<BasicLineChart
			data={daily_data.weekly_aggregated}
			xKey="week"
			yKey="bounce_rate"
			color={lineColors.desktop}
			title={`Desktop ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
		/>
	</section>

	<section class="chart-section">
		<h2>Multi Line Chart</h2>
		<p>
			This chart displays up to 5 lines simultaneously, perfect for comparing multiple datasets.
		</p>

		<div class="metric-selector">
			<label for="metric-select">Select Metric:</label>
			<select id="metric-select" bind:value={selectedMetric}>
				{#each metrics as metric}
					<option value={metric.value}>{metric.label}</option>
				{/each}
			</select>
		</div>

		<MultiLineChart
			lines={multiLineData}
			xKey="month"
			yKey={selectedMetric}
			title={`Product Performance - ${metrics.find((m) => m.value === selectedMetric)?.label || selectedMetric}`}
			showLegend={true}
			height={450}
		/>
	</section>

	<section class="chart-section">
		<h2>Date Based Chart</h2>
		<p>This chart demonstrates date-based data with server-style ISO dates.</p>
		<MultiLineChart
			lines={dateBasedData}
			xKey="date"
			yKey="value"
			title="Website Traffic Overview"
			showLegend={true}
			height={450}
		/>
	</section>

	<section class="chart-section">
		<h2>Date-Based Multi Line Chart</h2>
		<p>
			This chart demonstrates handling server dates with ISO format and custom date formatting using
			date-fns.
		</p>

		<MultiLineChart
			lines={dateBasedData}
			xKey="date"
			yKey="value"
			title="Website Analytics Over Time"
			dateFormat="MMM dd, yyyy"
			showLegend={true}
			height={450}
		/>
	</section>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.chart-section {
		margin-bottom: 3rem;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.chart-section h2 {
		color: #1e293b;
		margin-bottom: 0.5rem;
		font-size: 1.5rem;
	}

	.chart-section p {
		color: #64748b;
		margin-bottom: 1.5rem;
	}

	.metric-selector {
		margin-bottom: 1.5rem;
	}

	.metric-selector label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #374151;
	}

	.metric-selector select {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.metric-selector select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	h1 {
		color: #1e293b;
		margin-bottom: 2rem;
		text-align: center;
	}
</style>
