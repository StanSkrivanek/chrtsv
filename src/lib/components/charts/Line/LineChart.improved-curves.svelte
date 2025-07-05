<script lang="ts">
	import LineChart from '../UNUSED/LineChart.svelte';

	// Test data with clear ups and downs to see curve behavior
	const testData = [
		// January - Low point
		{
			month: 'Jan',
			product_id: 'prod_001',
			product_name: 'iPhone 15',
			sales: 100000,
			revenue: 100000,
			units_sold: 100
		},
		{
			month: 'Jan',
			product_id: 'prod_002',
			product_name: 'Samsung Galaxy S24',
			sales: 80000,
			revenue: 80000,
			units_sold: 80
		},
		// February - High point
		{
			month: 'Feb',
			product_id: 'prod_001',
			product_name: 'iPhone 15',
			sales: 300000,
			revenue: 300000,
			units_sold: 300
		},
		{
			month: 'Feb',
			product_id: 'prod_002',
			product_name: 'Samsung Galaxy S24',
			sales: 250000,
			revenue: 250000,
			units_sold: 250
		},
		// March - Very low point
		{
			month: 'Mar',
			product_id: 'prod_001',
			product_name: 'iPhone 15',
			sales: 50000,
			revenue: 50000,
			units_sold: 50
		},
		{
			month: 'Mar',
			product_id: 'prod_002',
			product_name: 'Samsung Galaxy S24',
			sales: 40000,
			revenue: 40000,
			units_sold: 40
		},
		// April - Medium point
		{
			month: 'Apr',
			product_id: 'prod_001',
			product_name: 'iPhone 15',
			sales: 180000,
			revenue: 180000,
			units_sold: 180
		},
		{
			month: 'Apr',
			product_id: 'prod_002',
			product_name: 'Samsung Galaxy S24',
			sales: 160000,
			revenue: 160000,
			units_sold: 160
		},
		// May - High point again
		{
			month: 'May',
			product_id: 'prod_001',
			product_name: 'iPhone 15',
			sales: 280000,
			revenue: 280000,
			units_sold: 280
		},
		{
			month: 'May',
			product_id: 'prod_002',
			product_name: 'Samsung Galaxy S24',
			sales: 220000,
			revenue: 220000,
			units_sold: 220
		}
	];
</script>

<div class="space-y-8 p-8">
	<h1 class="text-2xl font-bold">Improved Curve Algorithm Test</h1>

	<div class="space-y-6">
		<h2 class="text-xl font-semibold">Smooth Curves (Catmull-Rom)</h2>
		<p class="text-gray-600">
			The curves should be smooth and natural, following the data points without overshooting.
		</p>

		<div class="rounded-lg bg-white p-6 shadow">
			<LineChart
				apiData={testData}
				metric="units_sold"
				width={800}
				height={400}
				tension={0.3}
				curveType="smooth"
				showPoints={true}
				showValues={true}
				animate={false}
			/>
		</div>

		<h2 class="text-xl font-semibold">Low Tension (0.1) - Tighter Curves</h2>
		<div class="rounded-lg bg-white p-6 shadow">
			<LineChart
				apiData={testData}
				metric="units_sold"
				width={800}
				height={400}
				tension={0.1}
				curveType="smooth"
				showPoints={true}
				showValues={true}
				animate={false}
			/>
		</div>

		<h2 class="text-xl font-semibold">High Tension (0.6) - Looser Curves</h2>
		<div class="rounded-lg bg-white p-6 shadow">
			<LineChart
				apiData={testData}
				metric="units_sold"
				width={800}
				height={400}
				tension={0.6}
				curveType="smooth"
				showPoints={true}
				showValues={true}
				animate={false}
			/>
		</div>

		<h2 class="text-xl font-semibold">Straight Lines (for comparison)</h2>
		<div class="rounded-lg bg-white p-6 shadow">
			<LineChart
				apiData={testData}
				metric="units_sold"
				width={800}
				height={400}
				curveType="straight"
				showPoints={true}
				showValues={true}
				animate={false}
			/>
		</div>
	</div>
</div>

<style>
	.space-y-8 > * + * {
		margin-top: 2rem;
	}
	.space-y-6 > * + * {
		margin-top: 1.5rem;
	}
</style>
