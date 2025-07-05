<script lang="ts">
	import LineChart from '../LineChart.svelte';

	// Test data with more variation to see smooth curves better
	const testData = [
		{
			month: 'Jan',
			product_id: 'A',
			product_name: 'Product A',
			sales: 50,
			revenue: 50,
			units_sold: 50
		},
		{
			month: 'Feb',
			product_id: 'A',
			product_name: 'Product A',
			sales: 180,
			revenue: 180,
			units_sold: 180
		},
		{
			month: 'Mar',
			product_id: 'A',
			product_name: 'Product A',
			sales: 120,
			revenue: 120,
			units_sold: 120
		},
		{
			month: 'Apr',
			product_id: 'A',
			product_name: 'Product A',
			sales: 250,
			revenue: 250,
			units_sold: 250
		},
		{
			month: 'May',
			product_id: 'A',
			product_name: 'Product A',
			sales: 80,
			revenue: 80,
			units_sold: 80
		},
		{
			month: 'Jun',
			product_id: 'A',
			product_name: 'Product A',
			sales: 220,
			revenue: 220,
			units_sold: 220
		},

		{
			month: 'Jan',
			product_id: 'B',
			product_name: 'Product B',
			sales: 100,
			revenue: 100,
			units_sold: 100
		},
		{
			month: 'Feb',
			product_id: 'B',
			product_name: 'Product B',
			sales: 150,
			revenue: 150,
			units_sold: 150
		},
		{
			month: 'Mar',
			product_id: 'B',
			product_name: 'Product B',
			sales: 200,
			revenue: 200,
			units_sold: 200
		},
		{
			month: 'Apr',
			product_id: 'B',
			product_name: 'Product B',
			sales: 170,
			revenue: 170,
			units_sold: 170
		},
		{
			month: 'May',
			product_id: 'B',
			product_name: 'Product B',
			sales: 230,
			revenue: 230,
			units_sold: 230
		},
		{
			month: 'Jun',
			product_id: 'B',
			product_name: 'Product B',
			sales: 190,
			revenue: 190,
			units_sold: 190
		}
	];

	const colors = {
		A: '#3b82f6',
		B: '#ef4444'
	};

	// Simple single line data
	const singleData = [
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

	const singleColors = {
		desktop: '#60a5fa'
	};
</script>

<div class="page">
	<h1>LineChart - Smooth Curves Test</h1>

	<div class="test-grid">
		<div class="test-item">
			<h2>Smooth Curves (Single Line)</h2>
			<LineChart
				apiData={singleData}
				productColors={singleColors}
				width={500}
				height={250}
				metric="units_sold"
				curveType="smooth"
				showLegend={false}
				strokeWidth={3}
				pointRadius={5}
			/>
		</div>

		<div class="test-item">
			<h2>Straight Lines (Single Line)</h2>
			<LineChart
				apiData={singleData}
				productColors={singleColors}
				width={500}
				height={250}
				metric="units_sold"
				curveType="straight"
				showLegend={false}
				strokeWidth={3}
				pointRadius={5}
			/>
		</div>

		<div class="test-item">
			<h2>Smooth Curves (Multiple Lines)</h2>
			<LineChart
				apiData={testData}
				productColors={colors}
				width={500}
				height={250}
				metric="units_sold"
				curveType="smooth"
				strokeWidth={2}
				pointRadius={4}
			/>
		</div>

		<div class="test-item">
			<h2>Straight Lines (Multiple Lines)</h2>
			<LineChart
				apiData={testData}
				productColors={colors}
				width={500}
				height={250}
				metric="units_sold"
				curveType="straight"
				strokeWidth={2}
				pointRadius={4}
			/>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 20px;
		background: #f8f9fa;
		min-height: 100vh;
	}

	h1 {
		text-align: center;
		margin-bottom: 30px;
		color: #333;
	}

	.test-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.test-item {
		background: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.test-item h2 {
		margin: 0 0 20px 0;
		font-size: 16px;
		color: #333;
		text-align: center;
	}
</style>
