<script lang="ts">
	import LineChart from '../LineChart.svelte';

	// Simple single line data to match your example image
	const desktopData = [
		{
			month: 'Jan',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 100,
			revenue: 100,
			units_sold: 100
		},
		{
			month: 'Feb',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 320,
			revenue: 320,
			units_sold: 320
		},
		{
			month: 'Mar',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 280,
			revenue: 280,
			units_sold: 280
		},
		{
			month: 'Apr',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 237,
			revenue: 237,
			units_sold: 237
		},
		{
			month: 'May',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 350,
			revenue: 350,
			units_sold: 350
		},
		{
			month: 'Jun',
			product_id: 'desktop',
			product_name: 'Desktop',
			sales: 320,
			revenue: 320,
			units_sold: 320
		}
	];

	const colors = {
		desktop: '#60a5fa' // Light blue similar to your image
	};
</script>

<div class="container">
	<h1>Desktop Analytics - Line Chart</h1>

	<div class="chart-wrapper">
		<LineChart
			apiData={desktopData}
			productColors={colors}
			width={600}
			height={300}
			metric="units_sold"
			showPoints={true}
			showValues={false}
			curveType="smooth"
			strokeWidth={2}
			pointRadius={4}
			showLegend={false}
			padding={50}
		/>
	</div>

	<div class="chart-info">
		<p><strong>Current Value:</strong> 237 units</p>
		<p><strong>Trend:</strong> Positive growth trajectory</p>
		<p><strong>Peak:</strong> May (350 units)</p>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 40px auto;
		padding: 20px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	h1 {
		text-align: center;
		margin-bottom: 30px;
		color: #333;
		font-size: 24px;
	}

	.chart-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
		padding: 20px;
		background: #fafafa;
		border-radius: 6px;
	}

	.chart-info {
		display: flex;
		justify-content: space-around;
		background: #f8f9fa;
		padding: 15px;
		border-radius: 6px;
		margin-top: 20px;
	}

	.chart-info p {
		margin: 0;
		font-size: 14px;
		color: #666;
	}

	.chart-info strong {
		color: #333;
	}
</style>
