<script lang="ts">
	import BarComparison from '../BarComparison.svelte';

	// Simple test data
	const testData = [
		{
			month: 'Jan',
			product_id: 'A',
			product_name: 'Product A',
			sales: 100,
			revenue: 100,
			units_sold: 100
		},
		{
			month: 'Jan',
			product_id: 'B',
			product_name: 'Product B',
			sales: 150,
			revenue: 150,
			units_sold: 150
		},
		{
			month: 'Feb',
			product_id: 'A',
			product_name: 'Product A',
			sales: 120,
			revenue: 120,
			units_sold: 120
		},
		{
			month: 'Feb',
			product_id: 'B',
			product_name: 'Product B',
			sales: 180,
			revenue: 180,
			units_sold: 180
		},
		{
			month: 'Mar',
			product_id: 'A',
			product_name: 'Product A',
			sales: 110,
			revenue: 110,
			units_sold: 110
		},
		{
			month: 'Mar',
			product_id: 'B',
			product_name: 'Product B',
			sales: 200,
			revenue: 200,
			units_sold: 200
		}
	];

	const colors = {
		A: '#3b82f6',
		B: '#ef4444'
	};
</script>

<div class="page">
	<h1>Fixed Responsive Chart Tests</h1>

	<div class="test-section">
		<h2>Test 1: Small Container (400px × 200px)</h2>
		<div class="container-small">
			<BarComparison
				apiData={testData}
				productColors={colors}
				width="100%"
				height="100%"
				metric="units_sold"
				padding={30}
				showValues={false}
			/>
		</div>
	</div>

	<div class="test-section">
		<h2>Test 2: Medium Container (800px × 300px)</h2>
		<div class="container-medium">
			<BarComparison
				apiData={testData}
				productColors={colors}
				width="100%"
				height="100%"
				metric="units_sold"
			/>
		</div>
	</div>

	<div class="test-section">
		<h2>Test 3: Large Container (1200px × 400px)</h2>
		<div class="container-large">
			<BarComparison
				apiData={testData}
				productColors={colors}
				width="100%"
				height="100%"
				metric="units_sold"
			/>
		</div>
	</div>

	<div class="test-section">
		<h2>Test 4: Percentage Container (90% × 350px)</h2>
		<div class="container-percentage">
			<BarComparison
				apiData={testData}
				productColors={colors}
				width="100%"
				height="100%"
				metric="units_sold"
			/>
		</div>
	</div>

	<div class="test-section">
		<h2>Test 5: Viewport Units (50vw × 25vh)</h2>
		<div class="container-viewport">
			<BarComparison
				apiData={testData}
				productColors={colors}
				width="50vw"
				height="25vh"
				metric="units_sold"
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

	.test-section {
		background: white;
		padding: 20px;
		margin: 20px 0;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.test-section h2 {
		margin: 0 0 15px 0;
		color: #333;
	}

	.container-small {
		width: 400px;
		height: 200px;
		border: 2px solid #e74c3c;
		background: #fff;
	}

	.container-medium {
		width: 800px;
		height: 300px;
		border: 2px solid #3498db;
		background: #fff;
	}

	.container-large {
		width: 1200px;
		height: 400px;
		border: 2px solid #2ecc71;
		background: #fff;
	}

	.container-percentage {
		width: 90%;
		height: 350px;
		border: 2px solid #9b59b6;
		background: #fff;
	}

	.container-viewport {
		border: 2px solid #f39c12;
		background: #fff;
	}

	h1 {
		text-align: center;
		color: #333;
		margin-bottom: 30px;
	}
</style>
