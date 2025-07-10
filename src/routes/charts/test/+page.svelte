<script lang="ts">
	import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';
	import type { LineData, ChartPerformanceConfig } from '$lib/components/charts/types/chart.types.js';
	import { onMount } from 'svelte';

	// Sample data
	let chartData: LineData[] = $state([
		{
			id: 'sales',
			label: 'Sales',
			color: '#3b82f6',
			data: [
				{ date: '2024-01-01', value: 1000 },
				{ date: '2024-01-02', value: 1200 },
				{ date: '2024-01-03', value: 900 },
				{ date: '2024-01-04', value: 1500 },
				{ date: '2024-01-05', value: 1800 },
				{ date: '2024-01-06', value: 2000 },
				{ date: '2024-01-07', value: 1700 }
			]
		},
		{
			id: 'revenue',
			label: 'Revenue',
			color: '#10b981',
			data: [
				{ date: '2024-01-01', value: 800 },
				{ date: '2024-01-02', value: 950 },
				{ date: '2024-01-03', value: 750 },
				{ date: '2024-01-04', value: 1200 },
				{ date: '2024-01-05', value: 1400 },
				{ date: '2024-01-06', value: 1600 },
				{ date: '2024-01-07', value: 1350 }
			]
		},
		{
			id: 'profit',
			label: 'Profit',
			color: '#f59e0b',
			data: [
				{ date: '2024-01-01', value: 200 },
				{ date: '2024-01-02', value: 250 },
				{ date: '2024-01-03', value: 150 },
				{ date: '2024-01-04', value: 300 },
				{ date: '2024-01-05', value: 400 },
				{ date: '2024-01-06', value: 400 },
				{ date: '2024-01-07', value: 350 }
			]
		}
	]);

	// Performance configuration for different scenarios
	const performanceConfigs = {
		default: {
			svgMaxPoints: 1000,
			animationMaxPoints: 500,
			enableMemoization: true,
			enableDataSampling: true,
			mouseMoveThrottle: 16,
			resizeDebounce: 150
		} as Partial<ChartPerformanceConfig>,
		
		highPerformance: {
			svgMaxPoints: 500,
			animationMaxPoints: 200,
			enableMemoization: true,
			enableDataSampling: true,
			enableWebWorkers: true,
			mouseMoveThrottle: 32,
			resizeDebounce: 300
		} as Partial<ChartPerformanceConfig>,
		
		mobile: {
			svgMaxPoints: 300,
			animationMaxPoints: 100,
			enableMemoization: true,
			enableDataSampling: true,
			mouseMoveThrottle: 50,
			resizeDebounce: 500,
			devicePixelRatio: 2
		} as Partial<ChartPerformanceConfig>
	};

	let selectedConfig = $state<keyof typeof performanceConfigs>('default');
	let chartConfig = $derived(performanceConfigs[selectedConfig]);

	// Chart options
	let showCrosshair = $state(false);
	let curveType = $state<'straight' | 'smooth'>('straight');
	let tension = $state(0.3);
	let showValues = $state(false);
	let hasTooltip = $state(true);

	// Generate large dataset for performance testing
	function generateLargeDataset(points: number): LineData[] {
		const lines: LineData[] = [];
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
		
		for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
			const data = [];
			let value = Math.random() * 1000;
			
			for (let i = 0; i < points; i++) {
				const date = new Date(2024, 0, 1 + i);
				value += (Math.random() - 0.5) * 100;
				value = Math.max(0, value);
				
				data.push({
					date: date.toISOString().split('T')[0],
					value: Math.round(value)
				});
			}
			
			lines.push({
				id: `line-${lineIndex}`,
				label: `Dataset ${lineIndex + 1}`,
				color: colors[lineIndex],
				data
			});
		}
		
		return lines;
	}

	// Load different dataset sizes
	function loadDataset(size: 'small' | 'medium' | 'large' | 'xlarge') {
		switch (size) {
			case 'small':
				chartData = generateLargeDataset(50);
				break;
			case 'medium':
				chartData = generateLargeDataset(500);
				break;
			case 'large':
				chartData = generateLargeDataset(2000);
				break;
			case 'xlarge':
				chartData = generateLargeDataset(10000);
				break;
		}
	}

	// Enable performance debugging in development
	onMount(() => {
		if (import.meta.env.DEV) {
			// Enable performance logging
			const searchParams = new URLSearchParams(window.location.search);
			if (searchParams.has('debug')) {
				console.log('🚀 Chart performance debugging enabled');
			}
		}
	});
</script>

<svelte:head>
	<title>Optimized Multi-Line Chart Demo</title>
</svelte:head>

<div class="demo-container">
	<h1>Optimized Multi-Line Chart Demo</h1>
	
	<!-- Controls -->
	<div class="controls">
		<div class="control-group">
			<h3>Dataset Size</h3>
			<div class="button-group">
				<button onclick={() => loadDataset('large')}>Large (2K points)</button>
				<button onclick={() => loadDataset('xlarge')}>XL (10K points)</button>
			</div>
		</div>

		<div class="control-group">
			<h3>Performance Config</h3>
			<select bind:value={selectedConfig}>
				<option value="default">Default</option>
				<option value="highPerformance">High Performance</option>
				<option value="mobile">Mobile Optimized</option>
			</select>
		</div>

		<div class="control-group">
			<h3>Chart Options</h3>
			<label>
				<input type="checkbox" bind:checked={showCrosshair} />
				Show Crosshair
			</label>
			<label>
				<input type="checkbox" bind:checked={hasTooltip} />
				Enable Tooltips
			</label>
			<label>
				<input type="checkbox" bind:checked={showValues} />
				Show Values
			</label>
		</div>

		<div class="control-group">
			<h3>Line Style</h3>
			<label>
				<input type="radio" bind:group={curveType} value="straight" />
				Straight Lines
			</label>
			<label>
				<input type="radio" bind:group={curveType} value="smooth" />
				Smooth Curves
			</label>
			{#if curveType === 'smooth'}
				<label>
					Tension: {tension}
					<input type="range" bind:value={tension} min="0" max="1" step="0.1" />
				</label>
			{/if}
		</div>
	</div>

	<!-- Chart -->
	<div class="chart-wrapper">
		<MultiLineChart
			lines={chartData}
			xKey="date"
			yKey="value"
			title="Performance Demo Chart"
			showLegend={true}
			height={400}
			dateFormat="MMM dd"
			{showValues}
			{hasTooltip}
			{showCrosshair}
			{curveType}
			{tension}
			performanceConfig={chartConfig}
		/>
	</div>

	<!-- Performance Info -->
	<div class="performance-info">
		<h3>Performance Information</h3>
		<div class="info-grid">
			<div class="info-item">
				<strong>Total Data Points:</strong>
				{chartData.reduce((sum, line) => sum + line.data.length, 0).toLocaleString()}
			</div>
			<div class="info-item">
				<strong>Current Config:</strong>
				{selectedConfig}
			</div>
			<div class="info-item">
				<strong>Rendering Mode:</strong>
				{chartData.reduce((sum, line) => sum + line.data.length, 0) > (chartConfig.svgMaxPoints || 1000) ? 'Canvas' : 'SVG'}
			</div>
		</div>
	</div>

	<!-- Integration Guide -->
	<div class="integration-guide">
		<h2>Integration Guide</h2>
		
		<h3>Installation</h3>
		<pre><code># Install dependencies
npm install date-fns svelte</code></pre>

		<h3>Basic Usage</h3>
		<pre><code>{`<script>
  import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';
  
  const data = [
    {
      id: 'sales',
      label: 'Sales',
      color: '#3b82f6',
      data: [
        { date: '2024-01-01', value: 1000 },
        { date: '2024-01-02', value: 1200 }
        // ... more data
      ]
    }
  ];
</script>

<MultiLineChart
  lines={data}
  xKey="date"
  yKey="value"
  title="My Chart"
  showLegend={true}
  hasTooltip={true}
/>`}</code></pre>

		<h3>Performance Optimization</h3>
		<pre><code>{`// For large datasets
const performanceConfig = {
  svgMaxPoints: 500,      // Switch to Canvas above 500 points
  enableDataSampling: true, // Sample large datasets
  enableMemoization: true,  // Cache calculations
  mouseMoveThrottle: 32    // Throttle mouse events
};

<MultiLineChart
  lines={largeDataset}
  performanceConfig={performanceConfig}
/>`}</code></pre>

		<h3>Advanced Features</h3>
		<pre><code>{`<MultiLineChart
  lines={data}
  showCrosshair={true}     // Multi-line hover
  curveType="smooth"       // Smooth curves
  tension={0.3}           // Curve tension
  showValues={true}       // Show data point values
  doubleTicks={true}      // More Y-axis ticks for negative values
/>`}</code></pre>
	</div>
</div>

<style>
	.demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		text-align: center;
		color: #1f2937;
		margin-bottom: 2rem;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.control-group h3 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1rem;
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.button-group button {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		background: white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.button-group button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.control-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.control-group input[type="checkbox"],
	.control-group input[type="radio"] {
		margin-right: 0.5rem;
	}

	.control-group select,
	.control-group input[type="range"] {
		width: 100%;
		margin-top: 0.25rem;
	}

	.chart-wrapper {
		margin: 2rem 0;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.performance-info {
		margin: 2rem 0;
		padding: 1rem;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 8px;
	}

	.performance-info h3 {
		margin: 0 0 1rem 0;
		color: #92400e;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.info-item {
		font-size: 0.875rem;
		color: #78350f;
	}

	.integration-guide {
		margin-top: 3rem;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.integration-guide h2 {
		color: #1f2937;
		margin-bottom: 1.5rem;
	}

	.integration-guide h3 {
		color: #374151;
		margin: 1.5rem 0 0.5rem 0;
	}

	.integration-guide pre {
		background: #1f2937;
		color: #f9fafb;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.integration-guide code {
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	@media (max-width: 768px) {
		.demo-container {
			padding: 1rem;
		}

		.controls {
			grid-template-columns: 1fr;
		}

		.button-group {
			flex-direction: column;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>