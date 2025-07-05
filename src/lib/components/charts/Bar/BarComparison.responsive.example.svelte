<script lang="ts">
	import BarComparison from '../BarComparison.svelte';

	// Sample API data
	const sampleData = [
		{
			month: 'Jan',
			product_id: 'prod_001',
			product_name: 'Product A',
			sales: 150000,
			revenue: 150000,
			units_sold: 150
		},
		{
			month: 'Jan',
			product_id: 'prod_002',
			product_name: 'Product B',
			sales: 200000,
			revenue: 200000,
			units_sold: 200
		},
		{
			month: 'Feb',
			product_id: 'prod_001',
			product_name: 'Product A',
			sales: 180000,
			revenue: 180000,
			units_sold: 180
		},
		{
			month: 'Feb',
			product_id: 'prod_002',
			product_name: 'Product B',
			sales: 220000,
			revenue: 220000,
			units_sold: 220
		},
		{
			month: 'Mar',
			product_id: 'prod_001',
			product_name: 'Product A',
			sales: 170000,
			revenue: 170000,
			units_sold: 170
		},
		{
			month: 'Mar',
			product_id: 'prod_002',
			product_name: 'Product B',
			sales: 240000,
			revenue: 240000,
			units_sold: 240
		}
	];

	const productColors = {
		prod_001: '#3b82f6',
		prod_002: '#10b981'
	};
</script>

<div class="page">
	<h1>Responsive Bar Chart Examples</h1>

	<div class="examples">
		<div class="example">
			<h2>Fixed Size (900px × 360px)</h2>
			<BarComparison
				apiData={sampleData}
				{productColors}
				width={900}
				height={360}
				metric="units_sold"
			/>
		</div>

		<div class="example">
			<h2>Viewport Width (50vw × 25vh)</h2>
			<BarComparison
				apiData={sampleData}
				{productColors}
				width="50vw"
				height="25vh"
				metric="units_sold"
			/>
		</div>

		<div class="example">
			<h2>Percentage (100% × 300px)</h2>
			<div class="container">
				<BarComparison
					apiData={sampleData}
					{productColors}
					width="100%"
					height="300px"
					metric="units_sold"
				/>
			</div>
		</div>

		<div class="example">
			<h2>Mixed Units (80vw × 400px)</h2>
			<BarComparison
				apiData={sampleData}
				{productColors}
				width="80vw"
				height="400px"
				metric="sales"
			/>
		</div>

		<div class="example">
			<h2>Small Viewport (30vw × 20vh)</h2>
			<BarComparison
				apiData={sampleData}
				{productColors}
				width="30vw"
				height="20vh"
				metric="revenue"
				showValues={false}
			/>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.examples {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.example {
		border: 1px solid #e0e0e0;
		padding: 20px;
		border-radius: 8px;
		background: white;
	}

	.example h2 {
		margin: 0 0 20px 0;
		font-size: 18px;
		color: #333;
	}

	.container {
		width: 600px;
		height: 350px;
		border: 2px dashed #ccc;
		padding: 10px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	h1 {
		text-align: center;
		margin-bottom: 40px;
		color: #333;
	}
</style>
