<script lang="ts">
	import LineChart from '../LineChart.svelte';

	// Simple test data - using the same structure as BarComparison
	const testData = [
		{
			month: 'Jan',
			product_id: 'A',
			product_name: 'Desktop',
			sales: 100,
			revenue: 100,
			units_sold: 100
		},
		{
			month: 'Jan',
			product_id: 'B',
			product_name: 'Mobile',
			sales: 150,
			revenue: 150,
			units_sold: 150
		},
		{
			month: 'Jan',
			product_id: 'C',
			product_name: 'Tablet',
			sales: 80,
			revenue: 80,
			units_sold: 80
		},

		{
			month: 'Feb',
			product_id: 'A',
			product_name: 'Desktop',
			sales: 320,
			revenue: 320,
			units_sold: 320
		},
		{
			month: 'Feb',
			product_id: 'B',
			product_name: 'Mobile',
			sales: 180,
			revenue: 180,
			units_sold: 180
		},
		{
			month: 'Feb',
			product_id: 'C',
			product_name: 'Tablet',
			sales: 120,
			revenue: 120,
			units_sold: 120
		},

		{
			month: 'Mar',
			product_id: 'A',
			product_name: 'Desktop',
			sales: 280,
			revenue: 280,
			units_sold: 280
		},
		{
			month: 'Mar',
			product_id: 'B',
			product_name: 'Mobile',
			sales: 220,
			revenue: 220,
			units_sold: 220
		},
		{
			month: 'Mar',
			product_id: 'C',
			product_name: 'Tablet',
			sales: 160,
			revenue: 160,
			units_sold: 160
		},

		{
			month: 'Apr',
			product_id: 'A',
			product_name: 'Desktop',
			sales: 237,
			revenue: 237,
			units_sold: 237
		},
		{
			month: 'Apr',
			product_id: 'B',
			product_name: 'Mobile',
			sales: 250,
			revenue: 250,
			units_sold: 250
		},
		{
			month: 'Apr',
			product_id: 'C',
			product_name: 'Tablet',
			sales: 180,
			revenue: 180,
			units_sold: 180
		},

		{
			month: 'May',
			product_id: 'A',
			product_name: 'Desktop',
			sales: 350,
			revenue: 350,
			units_sold: 350
		},
		{
			month: 'May',
			product_id: 'B',
			product_name: 'Mobile',
			sales: 280,
			revenue: 280,
			units_sold: 280
		},
		{
			month: 'May',
			product_id: 'C',
			product_name: 'Tablet',
			sales: 200,
			revenue: 200,
			units_sold: 200
		},

		{
			month: 'Jun',
			product_id: 'A',
			product_name: 'Desktop',
			sales: 320,
			revenue: 320,
			units_sold: 320
		},
		{
			month: 'Jun',
			product_id: 'B',
			product_name: 'Mobile',
			sales: 300,
			revenue: 300,
			units_sold: 300
		},
		{
			month: 'Jun',
			product_id: 'C',
			product_name: 'Tablet',
			sales: 240,
			revenue: 240,
			units_sold: 240
		}
	];

	const colors = {
		A: '#3b82f6', // Blue
		B: '#ef4444', // Red
		C: '#10b981' // Green
	};

	// Example data that matches your uploaded image (single line)
	const singleLineData = [
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

	const singleLineColors = {
		desktop: '#60a5fa' // Light blue like in your image
	};
</script>

<div class="page">
	<h1>LineChart Component Examples</h1>

	<div class="examples">
		<div class="example">
			<h2>Single Line Chart (Like Your Image)</h2>
			<p>Similar to the uploaded image with smooth curve and points</p>
			<LineChart
				apiData={singleLineData}
				productColors={singleLineColors}
				width={600}
				height={300}
				metric="units_sold"
				showPoints={true}
				showValues={false}
				curveType="smooth"
				strokeWidth={2}
				pointRadius={4}
			/>
		</div>

		<div class="example">
			<h2>Multiple Lines Chart</h2>
			<p>Multiple products comparison over time</p>
			<LineChart
				apiData={testData}
				productColors={colors}
				width={700}
				height={350}
				metric="units_sold"
				showPoints={true}
				showValues={false}
				curveType="smooth"
			/>
		</div>

		<div class="example">
			<h2>Responsive Chart (50vw × 25vh)</h2>
			<p>Chart that adapts to viewport size</p>
			<LineChart
				apiData={testData}
				productColors={colors}
				width="50vw"
				height="25vh"
				metric="units_sold"
				showPoints={true}
				showValues={false}
			/>
		</div>

		<div class="example">
			<h2>Straight Lines (No Curve)</h2>
			<p>Angular lines instead of smooth curves</p>
			<LineChart
				apiData={testData}
				productColors={colors}
				width={600}
				height={300}
				metric="units_sold"
				showPoints={true}
				showValues={false}
				curveType="straight"
				strokeWidth={3}
			/>
		</div>

		<div class="example">
			<h2>With Value Labels</h2>
			<p>Show actual values on data points</p>
			<LineChart
				apiData={testData}
				productColors={colors}
				width={700}
				height={350}
				metric="units_sold"
				showPoints={true}
				showValues={true}
				curveType="smooth"
			/>
		</div>

		<div class="example">
			<h2>Container-Based Sizing (100%)</h2>
			<div class="container">
				<LineChart
					apiData={singleLineData}
					productColors={singleLineColors}
					width="100%"
					height="100%"
					metric="units_sold"
					showPoints={true}
					showValues={false}
					curveType="smooth"
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
		background: #f8f9fa;
		min-height: 100vh;
	}

	.examples {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.example {
		border: 1px solid #e0e0e0;
		padding: 25px;
		border-radius: 8px;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.example h2 {
		margin: 0 0 10px 0;
		font-size: 18px;
		color: #333;
	}

	.example p {
		margin: 0 0 20px 0;
		color: #666;
		font-size: 14px;
	}

	.container {
		width: 500px;
		height: 250px;
		border: 2px dashed #ccc;
		margin: 0 auto;
		background: #fafafa;
	}

	h1 {
		text-align: center;
		margin-bottom: 40px;
		color: #333;
	}
</style>
