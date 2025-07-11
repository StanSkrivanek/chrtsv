<script lang="ts">
	import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
	import type {
		ChartPerformanceConfig,
		LineData
	} from '$lib/components/charts/types/chart.types.js';
	import { onMount } from 'svelte';

	// Sample data with proper typing
	let chartData = $state<LineData[]>([
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

	// Performance configurations
	const performanceConfigs = {
		default: {
			svgMaxPoints: 1000,
			animationMaxPoints: 500,
			enableMemoization: true,
			enableDataSampling: true,
			mouseMoveThrottle: 16,
			resizeDebounce: 150
		},
		highPerformance: {
			svgMaxPoints: 500,
			animationMaxPoints: 200,
			enableMemoization: true,
			enableDataSampling: true,
			enableWebWorkers: true,
			mouseMoveThrottle: 32,
			resizeDebounce: 300
		},
		mobile: {
			svgMaxPoints: 300,
			animationMaxPoints: 100,
			enableMemoization: true,
			enableDataSampling: true,
			mouseMoveThrottle: 50,
			resizeDebounce: 500,
			devicePixelRatio: 2
		}
	} satisfies Record<string, Partial<ChartPerformanceConfig>>;

	// UI state
	let selectedConfig = $state<keyof typeof performanceConfigs>('default');
	let showCrosshair = $state(false);
	let curveType = $state<'straight' | 'smooth'>('straight');
	let tension = $state(0.3);
	let showValues = $state(false);
	let hasTooltip = $state(true);

	// Derived configuration
	const currentConfig = $derived(performanceConfigs[selectedConfig]);

	// Derived performance info
	const totalDataPoints = $derived(chartData.reduce((sum, line) => sum + line.data.length, 0));

	const renderingMode = $derived(
		totalDataPoints > (currentConfig.svgMaxPoints || 1000) ? 'Canvas' : 'SVG'
	);

	// Generate test datasets
	function generateTestData(points: number): LineData[] {
		console.log(`Generating ${points} points for 3 lines...`);

		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
		const lines: LineData[] = [];

		for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
			const data = [];
			let value = Math.random() * 1000;

			for (let i = 0; i < points; i++) {
				const date = new Date(2025, 0, 1 + i);
				value += (Math.random() - 0.5) * 100;
				value = Math.max(0, value);

				data.push({
					date: date.toISOString().split('T')[0],
					value: Math.round(value)
				});
			}

			lines.push({
				id: `dataset-${lineIndex}`,
				label: `Dataset ${lineIndex + 1}`,
				color: colors[lineIndex],
				data
			});
		}

		console.log(
			`Generated data:`,
			lines.map((line) => ({
				id: line.id,
				points: line.data.length
			}))
		);

		return lines;
	}

	// Dataset loading functions with better reactivity and debugging
	function loadSmallDataset() {
		console.log('Loading small dataset...');
		chartData = generateTestData(50);

		console.log(
			'Small dataset loaded:',
			chartData.length,
			'lines,',
			totalDataPoints,
			'total points'
		);
	}

	function loadMediumDataset() {
		console.log('Loading medium dataset...');
		chartData = generateTestData(500);

		console.log(
			'Medium dataset loaded:',
			chartData.length,
			'lines,',
			totalDataPoints,
			'total points'
		);
	}

	function loadLargeDataset() {
		console.log('Loading large dataset...');
		chartData = generateTestData(2000);

		console.log(
			'Large dataset loaded:',
			chartData.length,
			'lines,',
			totalDataPoints,
			'total points'
		);
	}

	function loadXLDataset() {
		console.log('Loading XL dataset...');
		chartData = generateTestData(10000);

		console.log(
			'XL dataset loaded:',
			chartData.length,
			'lines,',
			totalDataPoints,
			'total points'
		);
	}

	// Debug reactive changes
	$effect(() => {
		console.log('Chart data reactivity:', {
			lines: chartData.length,
			totalPoints: totalDataPoints,
			expectedMode: renderingMode,
			firstLineDataLength: chartData[0]?.data?.length || 0,
			dataStructure: chartData.map((line) => ({
				id: line.id,
				points: line.data.length,
				firstPoint: line.data[0],
				lastPoint: line.data[line.data.length - 1]
			}))
		});
	});

	$effect(() => {
		console.log('Config reactivity:', {
			selectedConfig,
			svgMaxPoints: currentConfig.svgMaxPoints,
			renderingMode,
			totalPoints: totalDataPoints
		});
	});

	// Development debugging
	onMount(() => {
		console.log('Demo page mounted');

		if (import.meta.env.DEV) {
			const params = new URLSearchParams(window.location.search);
			if (params.has('debug')) {
				console.log('Debug mode enabled');

				// Log initial state
				console.log('Initial state:', {
					chartData: chartData.length,
					selectedConfig,
					renderingMode,
					totalDataPoints
				});
			}
		}
	});
</script>

<svelte:head>
	<title>Optimized Multi-Line Chart Demo</title>
	<meta name="description" content="High-performance multi-line chart component for Svelte 5" />
</svelte:head>

<main class="demo-container">
	<header>
		<h1>Optimized Multi-Line Chart Demo</h1>
		<p class="subtitle">
			High-performance chart component for Svelte 5 with automatic optimization
		</p>
	</header>

	<!-- Controls Section -->
	<section class="controls">
		<div class="control-group">
			<h3>Dataset Size</h3>
			<div class="button-group">
				<button type="button" onclick={loadSmallDataset}> Small (50 points) </button>
				<button type="button" onclick={loadMediumDataset}> Medium (500 points) </button>
				<button type="button" onclick={loadLargeDataset}> Large (2K points) </button>
				<button type="button" onclick={loadXLDataset}> XL (10K points) </button>
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
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={showCrosshair} />
				Show Crosshair
			</label>
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={hasTooltip} />
				Enable Tooltips
			</label>
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={showValues} />
				Show Values
			</label>
		</div>

		<div class="control-group">
			<h3>Line Style</h3>
			<label class="radio-label">
				<input type="radio" bind:group={curveType} value="straight" />
				Straight Lines
			</label>
			<label class="radio-label">
				<input type="radio" bind:group={curveType} value="smooth" />
				Smooth Curves
			</label>
			{#if curveType === 'smooth'}
				<label class="range-label">
					Tension: {tension.toFixed(1)}
					<input type="range" bind:value={tension} min="0" max="1" step="0.1" />
				</label>
			{/if}
		</div>
	</section>

	<!-- Chart Section -->
	<section class="chart-section">
		<div class="chart-wrapper">
			<!-- {#key `${chartData.length}-${totalDataPoints}-${selectedConfig}`} -->
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
				performanceConfig={currentConfig}
			/>
			<!-- {/key} -->
		</div>
	</section>

	<!-- Performance Info -->
	<section class="performance-info">
		<h3>Performance Information</h3>
		<div class="info-grid">
			<div class="info-item">
				<strong>Total Data Points:</strong>
				<span>{totalDataPoints.toLocaleString()}</span>
			</div>
			<div class="info-item">
				<strong>Current Config:</strong>
				<span>{selectedConfig}</span>
			</div>
			<div class="info-item">
				<strong>Rendering Mode:</strong>
				<span class="mode-badge mode-{renderingMode.toLowerCase()}">{renderingMode}</span>
			</div>
			<div class="info-item">
				<strong>SVG Threshold:</strong>
				<span>{currentConfig.svgMaxPoints || 1000} points</span>
			</div>
		</div>
	</section>

	<!-- Debug Info -->
	{#if import.meta.env.DEV}
		<section class="debug-info">
			<h3>Debug Information</h3>
			<details>
				<summary>Show Debug Data</summary>
				<div class="debug-content">
					<pre>{JSON.stringify(
							{
								chartDataLength: chartData.length,
								totalDataPoints,
								renderingMode,
								selectedConfig,
								currentConfig,
								firstLineData: chartData[0]?.data?.slice(0, 3),
								hasTooltip,
								showCrosshair,
								curveType,
								tension
							},
							null,
							2
						)}</pre>
				</div>
			</details>
		</section>
	{/if}

	<!-- Integration Guide -->
	<!-- <section class="integration-guide">
		<h2>Integration Guide</h2>
		
		<div class="guide-section">
			<h3>Installation</h3>
			<pre><code># Install dependencies
npm install date-fns svelte</code></pre>
		</div>

		<div class="guide-section">
			<h3>Basic Usage</h3>
			<pre><code>{`<script lang="ts">
  import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
  import type { LineData } from '$lib/components/charts/types/chart.types.js';
  
  const data: LineData[] = [
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
		</div>

		<div class="guide-section">
			<h3>Performance Testing</h3>
			<p>Use the buttons above to test different dataset sizes:</p>
			<ul>
				<li><strong>Small (50 points):</strong> SVG mode, smooth animations</li>
				<li><strong>Medium (500 points):</strong> SVG mode, reduced animations</li>
				<li><strong>Large (2K points):</strong> Canvas mode (default config)</li>
				<li><strong>XL (10K points):</strong> Canvas mode with data sampling</li>
			</ul>
		</div>

		<div class="guide-section">
			<h3>Debugging Canvas Issues</h3>
			<p>Open browser console and watch for log messages when switching datasets:</p>
			<ul>
				<li>✅ <code>Canvas rendered successfully</code> - Canvas working</li>
				<li>❌ <code>Canvas element not available</code> - Setup issue</li>
				<li>⚠️ <code>Line paths not available</code> - Data processing issue</li>
			</ul>
		</div>
	</section> -->
</main>

<style>
	.demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		color: #1f2937;
		margin-bottom: 0.5rem;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.subtitle {
		color: #6b7280;
		font-size: 1.125rem;
		margin: 0;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.control-group h3 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1rem;
		font-weight: 600;
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
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
		color: #374151;
	}

	.button-group button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
		transform: translateY(-1px);
	}

	.button-group button:active {
		transform: translateY(0);
	}

	.checkbox-label,
	.radio-label {
		display: flex;
		align-items: center;
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		color: #4b5563;
		cursor: pointer;
	}

	.checkbox-label input,
	.radio-label input {
		margin-right: 0.5rem;
	}

	.range-label {
		display: block;
		margin-top: 1rem;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.range-label input[type='range'] {
		width: 100%;
		margin-top: 0.5rem;
	}

	select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		font-size: 0.875rem;
		color: #374151;
	}

	.chart-section {
		margin: 2rem 0;
	}

	.chart-wrapper {
		padding: 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
	}

	.performance-info {
		margin: 2rem 0;
		padding: 1.5rem;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 12px;
	}

	.performance-info h3 {
		margin: 0 0 1rem 0;
		color: #92400e;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-item strong {
		font-size: 0.875rem;
		color: #78350f;
		font-weight: 600;
	}

	.info-item span {
		font-size: 1rem;
		color: #92400e;
		font-weight: 500;
	}

	.mode-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.mode-svg {
		background: #dbeafe;
		color: #1e40af;
	}

	.mode-canvas {
		background: #dcfce7;
		color: #166534;
	}

	.debug-info {
		margin: 2rem 0;
		padding: 1rem;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 8px;
	}

	.debug-info h3 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1rem;
	}

	.debug-content {
		margin-top: 1rem;
	}

	.debug-content pre {
		background: #1f2937;
		color: #f9fafb;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.integration-guide {
		margin-top: 3rem;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.integration-guide h2 {
		color: #1f2937;
		margin-bottom: 2rem;
		font-size: 1.875rem;
		font-weight: 700;
	}

	.guide-section {
		margin-bottom: 2rem;
	}

	.guide-section h3 {
		color: #374151;
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.guide-section p {
		color: #4b5563;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.guide-section ul {
		color: #4b5563;
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.guide-section li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}

	.guide-section pre {
		background: #1f2937;
		color: #f9fafb;
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
	}

	.guide-section code {
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	@media (max-width: 768px) {
		.demo-container {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.controls {
			grid-template-columns: 1fr;
			padding: 1rem;
		}

		.button-group {
			flex-direction: column;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.chart-wrapper {
			padding: 1rem;
		}

		.integration-guide {
			padding: 1rem;
		}

		.integration-guide h2 {
			font-size: 1.5rem;
		}
	}
</style>
