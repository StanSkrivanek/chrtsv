<script lang="ts">
	import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';
	import {
		Activity,
		BarChart2,
		BarChart3,
		LineChart,
		PieChart,
		TrendingDown,
		TrendingUp,
		Users
	} from 'lucide-svelte';

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
	// Sample data for multiple lines
	const multiLineData = [
		{
			id: 'desktop',
			label: 'Desktop',
			color: '#3b82f6',
			data: productData[0].data
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
			label: 'Sessions',
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

	// Sample data with negative values for testing
	const profitLossData = [
		{
			id: 'product_a',
			label: 'Product A',
			color: '#3b82f6',
			data: [
				{ month: 'Jan', profit: -1200, margin: -15.2 },
				{ month: 'Feb', profit: -800, margin: -8.5 },
				{ month: 'Mar', profit: 200, margin: 2.1 },
				{ month: 'Apr', profit: 1500, margin: 12.3 },
				{ month: 'May', profit: 2800, margin: 18.7 },
				{ month: 'Jun', profit: 2200, margin: 16.4 }
			]
		},
		{
			id: 'product_b',
			label: 'Product B',
			color: '#ef4444',
			data: [
				{ month: 'Jan', profit: -2000, margin: -22.8 },
				{ month: 'Feb', profit: -1500, margin: -18.2 },
				{ month: 'Mar', profit: -500, margin: -5.4 },
				{ month: 'Apr', profit: 800, margin: 8.9 },
				{ month: 'May', profit: 1800, margin: 15.6 },
				{ month: 'Jun', profit: 2500, margin: 21.3 }
			]
		},
		{
			id: 'product_c',
			label: 'Product C',
			color: '#10b981',
			data: [
				{ month: 'Jan', profit: 500, margin: 4.2 },
				{ month: 'Feb', profit: -200, margin: -2.1 },
				{ month: 'Mar', profit: 800, margin: 7.8 },
				{ month: 'Apr', profit: 1200, margin: 11.5 },
				{ month: 'May', profit: -300, margin: -2.8 },
				{ month: 'Jun', profit: 1500, margin: 13.2 }
			]
		}
	];

	let selectedMetric = 'sales' as 'sales' | 'revenue' | 'units_sold';
	let selectedProfitMetric = 'profit' as 'profit' | 'margin';

	const metrics = [
		{ value: 'sales' as const, label: 'Sales ($)' },
		{ value: 'revenue' as const, label: 'Revenue ($)' },
		{ value: 'units_sold' as const, label: 'Units Sold' }
	];

	const profitMetrics = [
		{ value: 'profit' as const, label: 'Profit ($)' },
		{ value: 'margin' as const, label: 'Margin (%)' }
	];
</script>

<div class="example-container">
	<h1><LineChart size={28} class="icon" /> Single Line Chart</h1>

	<MultiLineChart
		lines={[dateBasedData[2]]}
		xKey="date"
		yKey="value"
		title={`${[dateBasedData[2].label]} Count Over Time`}
		showLegend={true}
		height={450}
		yTickCount={4}
	/>

	<div class="description">
		<h2><Activity size={20} class="icon-small" /> Features Demonstrated:</h2>
		<ul>
			<li><LineChart size={16} class="feature-icon" /> Single data series (Desktop Sales)</li>
			<li><Users size={16} class="feature-icon" /> Interactive legend with hover effects</li>
			<li><Activity size={16} class="feature-icon" /> <b>Uses `date-fns` for date parsing</b></li>
			<li>
				<BarChart2 size={16} class="feature-icon" /> <strong>Custom Y-axis ticks</strong> - Using 4 ticks
				instead of default 5
			</li>
			<li><Activity size={16} class="feature-icon" /> Responsive design</li>
			<li><Activity size={16} class="feature-icon" /> Tooltip on data point hover</li>
			<li>
				<Activity size={16} class="feature-icon" /> Color-coded lines with accessibility support
			</li>
		</ul>
	</div>
</div>

<div class="example-container">
	<h1><BarChart3 size={28} class="icon" /> Multi Line Chart Example</h1>

	<div class="controls">
		<label for="metric-select"><BarChart2 size={16} class="icon-inline" /> Select Metric:</label>
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
		showValues={true}
		hasTooltip={false}
	/>

	<div class="description">
		<h2><Activity size={20} class="icon-small" /> Features Demonstrated:</h2>
		<ul>
			<li>
				<BarChart3 size={16} class="feature-icon" /> Multiple data series (Desktop, Mobile, Tablet)
			</li>
			<li><Users size={16} class="feature-icon" /> Interactive legend with hover effects</li>
			<li><BarChart2 size={16} class="feature-icon" /> Dynamic metric switching</li>
			<li><Activity size={16} class="feature-icon" /> Responsive design</li>
			<li><Activity size={16} class="feature-icon" /> Tooltip on data point hover</li>
			<li>
				<Activity size={16} class="feature-icon" /> Color-coded lines with accessibility support
			</li>
		</ul>
	</div>
</div>

<div class="example-container">
	<h1>
		<TrendingDown size={28} class="icon profit-loss" /> Profit/Loss Chart with Negative Values
	</h1>

	<div class="controls">
		<label for="profit-metric-select">Select Metric:</label>
		<select id="profit-metric-select" bind:value={selectedProfitMetric}>
			{#each profitMetrics as metric}
				<option value={metric.value}>{metric.label}</option>
			{/each}
		</select>
	</div>

	<MultiLineChart
		lines={profitLossData}
		xKey="month"
		yKey={selectedProfitMetric}
		title={`Product Performance - ${profitMetrics.find((m) => m.value === selectedProfitMetric)?.label}`}
		showLegend={true}
		showValues={true}
		hasTooltip={true}
		height={450}
		yTickCount={5}
		doubleTicksForNegatives={true}
	/>

	<div class="description">
		<h2><Activity size={20} class="icon-small" /> Features Demonstrated:</h2>
		<ul>
			<li>
				<TrendingDown size={16} class="feature-icon negative" />
				<strong>Negative values support</strong> - Properly scaled Y-axis with negative numbers
			</li>
			<li>
				<Activity size={16} class="feature-icon" /> <strong>Zero reference line</strong> - Horizontal
				line at y=0 for visual reference
			</li>
			<li>
				<TrendingUp size={16} class="feature-icon positive" /> <strong>Auto-doubled ticks</strong> -
				Automatically doubles tick count (5→10) for negative data
			</li>
			<li>
				<BarChart3 size={16} class="feature-icon" /> Multiple data series with both positive and negative
				values
			</li>
			<li>
				<BarChart2 size={16} class="feature-icon" /> Dynamic metric switching between profit and margin
			</li>
			<li><Activity size={16} class="feature-icon" /> Responsive design with proper grid lines</li>
			<li>Tooltips showing negative values correctly</li>
		</ul>
	</div>
</div>

<div class="example-container">
	<h1><PieChart size={28} class="icon" /> Comparison: Standard vs Auto-Doubled Ticks</h1>

	<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
		<div>
			<h3 style="text-align: center; margin-bottom: 1rem;">Standard Ticks (5 total)</h3>
			<MultiLineChart
				lines={profitLossData}
				xKey="month"
				yKey="profit"
				title="Profit - Standard Ticks"
				showLegend={false}
				height={350}
				yTickCount={5}
				doubleTicksForNegatives={false}
			/>
		</div>
		<div>
			<h3 style="text-align: center; margin-bottom: 1rem;">Auto-Doubled Ticks (10 total)</h3>
			<MultiLineChart
				lines={profitLossData}
				xKey="month"
				yKey="profit"
				title="Profit - Auto-Doubled Ticks"
				showLegend={false}
				height={350}
				yTickCount={5}
				doubleTicksForNegatives={true}
			/>
		</div>
	</div>

	<div class="description">
		<h2>Comparison Benefits:</h2>
		<ul>
			<li>
				<strong>Better granularity</strong> - More ticks around the zero line for precise reading
			</li>
			<li><strong>Automatic detection</strong> - No manual configuration needed</li>
			<li>
				<strong>Configurable</strong> - Can be disabled with `doubleTicksForNegatives={false}`
			</li>
			<li><strong>Smart spacing</strong> - Maintains readable tick intervals</li>
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
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.description ul {
		color: #64748b;
		line-height: 1.6;
	}

	.description li {
		margin-bottom: 0.5rem;
	}

	/* Icon styles */
	:global(.icon) {
		color: #3b82f6;
		stroke-width: 2;
	}

	:global(.icon-small) {
		color: #6b7280;
		stroke-width: 2;
	}

	:global(.icon-inline) {
		color: #6b7280;
		stroke-width: 2;
		vertical-align: middle;
	}

	:global(.feature-icon) {
		color: #6b7280;
		stroke-width: 2;
		margin-right: 0.5rem;
		vertical-align: middle;
		flex-shrink: 0;
	}

	:global(.feature-icon.positive) {
		color: #10b981;
	}

	:global(.feature-icon.negative) {
		color: #ef4444;
	}

	:global(.profit-loss) {
		color: #ef4444;
	}

	h1 :global(.icon) {
		flex-shrink: 0;
	}

	.controls label :global(.icon-inline) {
		flex-shrink: 0;
	}

	.description h2 :global(.icon-small) {
		flex-shrink: 0;
	}

	.description li {
		margin-bottom: 0.5rem;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.description li :global(.feature-icon) {
		margin-top: 0.1rem;
	}
</style>
