<script lang="ts">
	import { onMount } from 'svelte';
	import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
	import generateTestData from '$lib/components/charts/utils/testDataGenerator';
	// Types for our API data
	interface DataPoint {
		date: string;
		value: number;
		[key: string]: any;
	}

	interface LineData {
		id: string;
		label: string;
		color?: string;
		data: DataPoint[];
	}

	interface ApiDataset {
		name: string;
		description: string;
		fetchFn: () => Promise<LineData[]>;
		yTickCount?: number;
		height?: number;
		performanceHints?: string;
	}

	// State management
	let selectedDataset = $state<ApiDataset | null>(null);
	let chartData = $state<LineData[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let lastFetchTime = $state<number>(0);

	// Chart configuration options
	let showValues = $state(false);
	let hasTooltip = $state(true);
	let hasCrosshair = $state(false);
	let curveType = $state<'straight' | 'smooth'>('straight');
	let tension = $state(0.3);
	let showLegend = $state(true);
	let chartHeight = $state(400);

	// Performance configuration
	let performanceMode = $state<'auto' | 'mobile' | 'tablet' | 'desktop'>('auto');
	let enableSampling = $state(true);
	let useWebWorker = $state(true);

	// Generate performance config based on mode
	const currentConfig = $derived(() => {
		const configs = {
			mobile: {
				mobile: 200,
				tablet: 300,
				desktop: 500,
				enableDataSampling: enableSampling,
				useWebWorker: useWebWorker,
				mouseMoveThrottle: 32,
				resizeDebounce: 200,
				svgMaxPoints: 500 // Adding missing svgMaxPoints property
			},
			tablet: {
				mobile: 300,
				tablet: 600,
				desktop: 800,
				enableDataSampling: enableSampling,
				useWebWorker: useWebWorker,
				mouseMoveThrottle: 24,
				resizeDebounce: 150,
				svgMaxPoints: 1000 // Adding missing svgMaxPoints property
			},
			desktop: {
				mobile: 500,
				tablet: 800,
				desktop: 1200,
				enableDataSampling: enableSampling,
				useWebWorker: useWebWorker,
				mouseMoveThrottle: 16,
				resizeDebounce: 100,
				svgMaxPoints: 2000 // Adding missing svgMaxPoints property
			},
			auto: {
				enableDataSampling: enableSampling,
				useWebWorker: useWebWorker,
				svgMaxPoints: 1000 // Adding missing svgMaxPoints property
			}
		};
		return configs[performanceMode];
	});

	// API Dataset definitions
	const apiDatasets: ApiDataset[] = [
		{
			name: 'World Population Data',
			description: 'Population statistics for major countries using REST Countries API',
			performanceHints: 'Reliable API, perfect for testing with real data',
			fetchFn: async () => {
				const countries = ['china', 'india', 'unitedstates', 'indonesia', 'pakistan', 'brazil'];
				const response = await fetch(
					'https://restcountries.com/v3.1/all?fields=name,population,area,region'
				);
				const allCountries = await response.json();

				// Filter and create time series simulation
				const targetCountries = allCountries
					.filter((country: any) =>
						countries.some((target) =>
							country.name.common
								.toLowerCase()
								.includes(target.replace('unitedstates', 'united states'))
						)
					)
					.slice(0, 5);

				// Simulate historical population data (2020-2024)
				return targetCountries.map((country: any, index: number) => {
					const basePopulation = country.population;
					const growthRate = 0.01 + Math.random() * 0.02; // 1-3% annual growth
					const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

					const data: DataPoint[] = [];
					for (let year = 2020; year <= 2024; year++) {
						const yearsFromBase = year - 2024;
						const population = Math.round(basePopulation * Math.pow(1 + growthRate, yearsFromBase));

						data.push({
							date: year.toString(),
							value: Math.round(population / 1000000), // Convert to millions
							year,
							country: country.name.common,
							region: country.region
						});
					}

					return {
						id: country.name.common.toLowerCase().replace(/\s+/g, '-'),
						label: `${country.name.common} (millions)`,
						color: colors[index % colors.length],
						data
					};
				});
			}
		},
		{
			name: 'Public Holiday Statistics',
			description: 'Number of public holidays per month using Nager.Date API',
			performanceHints: 'Reliable government data API, great for testing',
			fetchFn: async () => {
				const countries = [
					{ code: 'US', name: 'United States', color: '#ef4444' },
					{ code: 'GB', name: 'United Kingdom', color: '#3b82f6' },
					{ code: 'DE', name: 'Germany', color: '#10b981' },
					{ code: 'FR', name: 'France', color: '#f59e0b' },
					{ code: 'CA', name: 'Canada', color: '#8b5cf6' }
				];

				const year = new Date().getFullYear();
				const promises = countries.map(async (country) => {
					const response = await fetch(
						`https://date.nager.at/api/v3/PublicHolidays/${year}/${country.code}`
					);
					const holidays = await response.json();

					// Group by month
					const monthlyData = new Array(12).fill(0);
					holidays.forEach((holiday: any) => {
						const month = new Date(holiday.date).getMonth();
						monthlyData[month]++;
					});

					return {
						id: country.code.toLowerCase(),
						label: country.name,
						color: country.color,
						data: monthlyData.map((count, month) => ({
							date: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' }),
							value: count,
							month: month + 1,
							monthName: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' })
						}))
					};
				});

				return Promise.all(promises);
			}
		},
		{
			name: 'JSONPlaceholder User Activity',
			description: 'Posts and comments activity simulation using JSONPlaceholder',
			performanceHints: 'Ultra-reliable test API, perfect for development',
			fetchFn: async () => {
				const [postsRes, commentsRes, usersRes] = await Promise.all([
					fetch('https://jsonplaceholder.typicode.com/posts'),
					fetch('https://jsonplaceholder.typicode.com/comments'),
					fetch('https://jsonplaceholder.typicode.com/users')
				]);

				const [posts, comments, users] = await Promise.all([
					postsRes.json(),
					commentsRes.json(),
					usersRes.json()
				]);

				// Create time series for different metrics
				const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
				const metrics = [
					{ id: 'posts', label: 'Daily Posts', data: posts },
					{ id: 'comments', label: 'Daily Comments', data: comments },
					{ id: 'users', label: 'Active Users', data: users }
				];

				// Simulate daily activity over the last 30 days
				return metrics.map((metric, index) => {
					const data: DataPoint[] = [];
					const today = new Date();

					for (let i = 29; i >= 0; i--) {
						const date = new Date(today);
						date.setDate(date.getDate() - i);

						// Simulate daily counts based on data length
						let value: number;
						if (metric.id === 'posts') {
							value = Math.floor(Math.random() * 20) + 5; // 5-25 posts per day
						} else if (metric.id === 'comments') {
							value = Math.floor(Math.random() * 50) + 10; // 10-60 comments per day
						} else {
							value = Math.floor(Math.random() * 15) + 3; // 3-18 active users per day
						}

						data.push({
							date: date.toLocaleDateString(),
							value,
							dayOfWeek: date.getDay(),
							isWeekend: date.getDay() === 0 || date.getDay() === 6
						});
					}

					return {
						id: metric.id,
						label: metric.label,
						color: colors[index % colors.length],
						data
					};
				});
			}
		},
		{
			name: 'Weather Forecast Comparison',
			description: 'Temperature trends for major cities using Open-Meteo API',
			performanceHints: 'Free weather API with no rate limits',
			height: 450,
			fetchFn: async () => {
				const cities = [
					{ name: 'New York', lat: 40.7128, lon: -74.006, color: '#ef4444' },
					{ name: 'London', lat: 51.5074, lon: -0.1278, color: '#3b82f6' },
					{ name: 'Tokyo', lat: 35.6762, lon: 139.6503, color: '#10b981' },
					{ name: 'Sydney', lat: -33.8688, lon: 151.2093, color: '#f59e0b' }
				];

				const promises = cities.map(async (city) => {
					const response = await fetch(
						`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_max&timezone=auto&forecast_days=14`
					);
					const data = await response.json();

					return {
						id: city.name.toLowerCase().replace(' ', '-'),
						label: `${city.name} (°C)`,
						color: city.color,
						data: data.daily.time.map((date: string, index: number) => ({
							date: new Date(date).toLocaleDateString(),
							value: Math.round(data.daily.temperature_2m_max[index]),
							city: city.name,
							latitude: city.lat,
							longitude: city.lon
						}))
					};
				});

				return Promise.all(promises);
			}
		},
		{
			name: 'Financial Markets Mock Data',
			description: 'Simulated stock prices with realistic volatility patterns',
			performanceHints: 'Medium dataset with realistic market movements',
			fetchFn: async () => {
				await new Promise((resolve) => setTimeout(resolve, 600));

				const stocks = [
					{ symbol: 'AAPL', name: 'Apple', startPrice: 180, volatility: 0.02, color: '#000000' },
					{ symbol: 'GOOGL', name: 'Google', startPrice: 140, volatility: 0.025, color: '#4285f4' },
					{
						symbol: 'MSFT',
						name: 'Microsoft',
						startPrice: 350,
						volatility: 0.018,
						color: '#00a1f1'
					},
					{ symbol: 'TSLA', name: 'Tesla', startPrice: 250, volatility: 0.04, color: '#cc0000' }
				];

				const days = 90;
				const startDate = new Date();
				startDate.setDate(startDate.getDate() - days);

				return stocks.map((stock) => {
					const data: DataPoint[] = [];
					let currentPrice = stock.startPrice;

					for (let i = 0; i < days; i++) {
						const date = new Date(startDate);
						date.setDate(date.getDate() + i);

						// Skip weekends
						if (date.getDay() === 0 || date.getDay() === 6) continue;

						// Random walk with trend
						const trend = Math.sin(i * 0.05) * 0.005; // Long-term trend
						const dailyChange = (Math.random() - 0.5) * stock.volatility + trend;
						currentPrice *= 1 + dailyChange;

						data.push({
							date: date.toLocaleDateString(),
							value: Math.round(currentPrice * 100) / 100,
							symbol: stock.symbol,
							volume: Math.floor(Math.random() * 1000000) + 500000,
							changePercent: dailyChange * 100
						});
					}

					return {
						id: stock.symbol,
						label: `${stock.name} (${stock.symbol})`,
						color: stock.color,
						data
					};
				});
			}
		}
	];

	// Fetch data function
	async function fetchData(dataset: ApiDataset) {
		if (!dataset) return;

		loading = true;
		error = null;
		const startTime = performance.now();

		try {
			console.log(`Fetching ${dataset.name}...`);
			const data = await dataset.fetchFn();
			chartData = data;

			const endTime = performance.now();
			lastFetchTime = endTime - startTime;

			console.log(`${dataset.name} loaded in ${lastFetchTime.toFixed(1)}ms`);
			console.log('Data summary:', {
				lines: data.length,
				totalPoints: data.reduce((sum, line) => sum + line.data.length, 0),
				avgPointsPerLine: Math.round(
					data.reduce((sum, line) => sum + line.data.length, 0) / data.length
				),
				dateRange: data[0]?.data
					? `${data[0].data[0]?.date} to ${data[0].data[data[0].data.length - 1]?.date}`
					: 'N/A'
			});
		} catch (err) {
			error = `Failed to fetch ${dataset.name}: ${(err as Error).message}`;
			console.error('Fetch error:', err);
		} finally {
			loading = false;
		}
	}

	// GENERATE data
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

		console.log('XL dataset loaded:', chartData.length, 'lines,', totalDataPoints, 'total points');
	}

	// Fixed the selectedConfig type to match available config options
	let selectedConfig = $state<'mobile' | 'tablet' | 'desktop' | 'auto'>('auto');
	const totalDataPoints = $derived(chartData.reduce((sum, line) => sum + line.data.length, 0));

	const renderingMode = $derived(
		totalDataPoints > (currentConfig.svgMaxPoints || 1000) ? 'Canvas' : 'SVG'
	);

	// Initialize with first dataset
	onMount(() => {
		selectedDataset = apiDatasets[0];
		fetchData(selectedDataset);
	});

	// Ensure we're using totalDataPoints consistently (not mixing with totalPoints)
	$effect(() => {
		console.table({
			lines: chartData.length,
			totalPoints: totalDataPoints,
			expectedMode: renderingMode,
			firstLineDataLength: chartData[0]?.data?.length || 0
		});

		console.table({
			selectedConfig,
			svgMaxPoints: currentConfig.svgMaxPoints,
			renderingMode,
			totalPoints: totalDataPoints
		});
	});

	// Remove duplicate $effect and update the variable reference
	const avgPointsPerLine = $derived(
		chartData.length > 0 ? Math.round(totalDataPoints / chartData.length) : 0
	);
</script>

<div class="demo-container">
	<div class="control-panel">
		<!-- Chart Controls -->
		<div class="chart-controls">
			<h3>Chart Options</h3>
			<div class="controls-grid">
				<div class="control-group">
					<label>
						<input type="checkbox" bind:checked={showValues} />
						Show Values
					</label>
					<label>
						<input type="checkbox" bind:checked={hasTooltip} />
						Enable Tooltips
					</label>
					<label>
						<input type="checkbox" bind:checked={hasCrosshair} />
						Show Crosshair
					</label>
					<label>
						<input type="checkbox" bind:checked={showLegend} />
						Show Legend
					</label>
				</div>
				<div class="control-group">
					<label>
						<input type="checkbox" bind:checked={enableSampling} />
						Enable Data Sampling
					</label>
					<label>
						<input type="checkbox" bind:checked={useWebWorker} />
						Use Web Worker
					</label>
					<div class="control-group">
						<label for="height">Chart Height: {chartHeight}px</label>
						<input
							id="height"
							type="range"
							min="300"
							max="800"
							step="50"
							bind:value={chartHeight}
						/>
					</div>
				</div>

				<div class="performance-controls">
					<h3>Performance Settings</h3>
					<div class="controls-grid">
						<div class="control-group">
							<label for="perf-mode">Performance Mode:</label>
							<select id="perf-mode" bind:value={performanceMode}>
								<option value="auto">Auto (Recommended)</option>
								<option value="mobile">Mobile Optimized</option>
								<option value="tablet">Tablet Optimized</option>
								<option value="desktop">Desktop Performance</option>
							</select>
						</div>
					</div>
					<div class="control-group">
						<label for="curve-type">Curve Type:</label>
						<select id="curve-type" bind:value={curveType}>
							<option value="straight">Straight Lines</option>
							<option value="smooth">Smooth Curves</option>
						</select>

						{#if curveType === 'smooth'}
							<label for="tension">Curve Tension: {tension}</label>
							<input id="tension" type="range" min="0" max="1" step="0.1" bind:value={tension} />
						{/if}
					</div>
				</div>
			</div>
			<div class="sources">
				<div class="dataset-selector">
					<h3>Choose Dataset API</h3>
					<div class="dataset-grid">
						{#each apiDatasets as dataset}
							<button
								class="dataset-card"
								class:selected={selectedDataset?.name === dataset.name}
								class:loading={loading && selectedDataset?.name === dataset.name}
								onclick={() => {
									selectedDataset = dataset;
									chartHeight = dataset.height || 400;
									fetchData(dataset);
								}}
								disabled={loading}
							>
								<div class="dataset-name">{dataset.name}</div>
								<!-- <div class="dataset-description">{dataset.description}</div>
								{#if dataset.performanceHints}
									<div class="performance-hint">{dataset.performanceHints}</div>
								{/if} -->
							</button>
						{/each}
					</div>
					<div class="control-group">
						<h3>Dataset Size</h3>
						<div class="dataset-grid">
							<button type="button" class="dataset-card" onclick={loadSmallDataset}>
								Small (50 points)
							</button>
							<button type="button" class="dataset-card" onclick={loadMediumDataset}>
								Medium (500 points)
							</button>
							<button type="button" class="dataset-card" onclick={loadLargeDataset}>
								Large (2K points)
							</button>
							<button type="button" class="dataset-card" onclick={loadXLDataset}>
								XL (10K points)
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		{#if loading}
			<div class="loading-container">
				<div class="loading-spinner"></div>
				<p>Loading data...</p>
			</div>
		{/if}
		{#if error}
			<div class="error-container">
				<p class="error-message">Error: {error}</p>
				<button onclick={() => fetchData(selectedDataset)}>Retry</button>
			</div>
		{/if}
		{#if chartData.length > 0 && !loading}
			<div class="chart-wrapper">
				<MultiLineChart
					lines={chartData}
					xKey="date"
					yKey="value"
					title={selectedDataset?.name || 'API Data Chart'}
					{showLegend}
					height={chartHeight}
					dateFormat="MMM dd"
					{showValues}
					{hasTooltip}
					{hasCrosshair}
					{curveType}
					{tension}
					yTickCount={selectedDataset?.yTickCount || 5}
					performanceConfig={currentConfig || {}}
				/>

				<!-- Placeholder for demo -->
				<!-- <div class="chart-placeholder" style="height: {chartHeight}px;"> -->
				<!-- <div class="placeholder-content"> -->
				<!-- <h3>MultiLineChart Component Goes Here</h3>
					<p>Uncomment the MultiLineChart component above to see the actual chart</p>
					<div class="placeholder-stats">
						<div>{chartData.length} lines loaded</div>
						<div>{totalPoints.toLocaleString()} total data points</div>
						<div> Performance mode: {performanceMode}</div>
					</div> -->
				<!-- </div> -->
				<!-- </div> -->
			</div>
			<div>
				{#if selectedDataset}
					<div class="status-panel">
						<div class="status-grid">
							<div class="status-item">
								<span class="status-label">Dataset:</span>
								<span class="status-value">{selectedDataset.name}</span>
							</div>
							<div class="status-item">
								<span class="status-label">Load Time:</span>
								<span class="status-value">{lastFetchTime.toFixed(1)}ms</span>
							</div>
							<div class="status-item">
								<span class="status-label">Total Points:</span>
								<span class="status-value">{totalDataPoints.toLocaleString()}</span>
							</div>
							<div class="status-item">
								<span class="status-label">Lines:</span>
								<span class="status-value">{chartData.length}</span>
							</div>
							<div class="status-item">
								<span class="status-label">Avg Points/Line:</span>
								<span class="status-value">{avgPointsPerLine}</span>
							</div>
							<div class="status-item">
								<span class="status-label">Performance Mode:</span>
								<span class="status-value">{performanceMode}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
			<!-- Data Preview -->
			<!-- <div class="data-preview">
			<h3>Data Preview</h3>
			<div class="preview-grid">
				{#each chartData.slice(0, 3) as line}
					<div class="preview-line">
						<div class="preview-header">
							<div 
								class="line-color" 
								style="background-color: {line.color}"
							></div>
							<strong>{line.label}</strong>
						</div>
						<div class="preview-data">
							{#each line.data.slice(0, 3) as point}
								<div class="data-point">
									{point.date}: <strong>{point.value.toLocaleString()}</strong>
								</div>
							{/each}
							{#if line.data.length > 3}
								<div class="data-point">... +{line.data.length - 3} more points</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div> -->
		{/if}
	</div>
</div>

<style>
	.demo-container {
		max-width: 1680px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.demo-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: #64748b;
		font-size: 1.1rem;
	}

	.control-panel {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 1rem;
		border: 1px solid #e2e8f0;
	}

	.dataset-selector h3,
	.chart-controls h3,
	.performance-controls h3 {
		margin: 0 0 1rem 0;
		color: #1e293b;
		font-size: 1.1rem;
	}

	.dataset-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
	}

	.dataset-card {
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 0.5rem;
		background: white;
		cursor: pointer;
		transition: all 0.2s ease;
		/* text-align: left; */
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.dataset-card:hover {
		border-color: #3b82f6;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}

	.dataset-card.selected {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.dataset-card.loading {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.dataset-name {
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 0.5rem;
	}

	.dataset-description {
		font-size: 0.9rem;
		color: #64748b;
		margin-bottom: 0.5rem;
	}

	.performance-hint {
		font-size: 0.8rem;
		color: #059669;
		font-style: italic;
	}

	.controls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #374151;
	}

	.control-group select,
	.control-group input[type='range'] {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.9rem;
	}

	/* Checkboxes */

	input[type='checkbox'] {
		/* Add if not using autoprefixer */
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		/* For iOS < 15 to remove gradient background */

		/* Not removed via appearance */
		margin: 0;
		position: relative;
		-webkit-border-radius: 0;
		display: inline-block;
		overflow: hidden;
		width: 51px;
		height: 31px;
		border-radius: 4px;
		background-color: #e9e9ea;
		transition: background-color 250ms;
		vertical-align: middle;
	}
	@media (prefers-reduced-motion) {
		input[type='checkbox'] {
			transition: none;
		}
	}
	@media (prefers-color-scheme: dark) {
		input[type='checkbox'] {
			background-color: #39393d;
		}
	}
	input[type='checkbox']:before {
		position: absolute;
		top: 2px;
		left: 2px;
		border-radius: 4px;
		content: '';
		display: inline-block;
		width: 27px;
		height: 27px;
		background-color: white;
		transition: all 200ms;
		box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.2);
	}
	@media (prefers-reduced-motion) {
		input[type='checkbox']:before {
			transition: none;
		}
	}
	input[type='checkbox']:checked {
		background-color: #35c759;
	}
	@media (prefers-color-scheme: dark) {
		input[type='checkbox']:checked {
			background-color: #2ed158;
		}
	}
	input[type='checkbox']:checked:before {
		left: 22px;
	}
	input[type='checkbox']:disabled {
		background-color: #efefef;
	}
	@media (prefers-color-scheme: dark) {
		input[type='checkbox']:disabled {
			background-color: #1e1e1e;
		}
	}
	input[type='checkbox']:disabled:before {
		box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
	}
	input[type='checkbox']:disabled:checked {
		background-color: #b7dec0;
	}
	@media (prefers-color-scheme: dark) {
		input[type='checkbox']:disabled:checked {
			background-color: #243f2a;
		}
	}
	input[type='checkbox'] + label {
		vertical-align: middle;
		font-family: Verdana;
	}

	/*  RANGE */

	input[type='range'] {
		outline: 0;
		border: 0;
		width: 240px;
		max-width: 100%;
		margin: 24px 0 16px;
		transition: box-shadow 0.2s ease-in-out;
		@media screen and (-webkit-min-device-pixel-ratio: 0) {
			& {
				overflow: hidden;
				height: 34px;
				appearance: none;
				background-color: #ddd;
			}
			&::-webkit-slider-runnable-track {
				height: 34px;
				-webkit-appearance: none;
				color: #444;

				transition: box-shadow 0.2s ease-in-out;
			}
			&::-webkit-slider-thumb {
				width: 40px;
				-webkit-appearance: none;
				height: 34px;
				cursor: ew-resize;
				background: #fff;
				box-shadow:
					-340px 0 0 320px #2ed158,
					inset 0 0 0 40px #fff;
				border-radius: 4px;
				transition: box-shadow 0.2s ease-in-out;
				position: relative;
			}
			&:active::-webkit-slider-thumb {
				background: #fff;
				box-shadow:
					-340px 0 0 320px #2ed158,
					inset 0 0 0 3px #fff;
			}
		}
	}

	.status-panel {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: #f0fdf4;
		border: 1px solid #22c55e;
		border-radius: 0.5rem;
	}

	.status-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.status-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.status-label {
		font-size: 0.8rem;
		color: #059669;
		font-weight: 500;
	}

	.status-value {
		font-weight: 600;
		color: #1e293b;
	}

	.loading-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		gap: 1rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.error-container {
		background: #fef2f2;
		border: 1px solid #fca5a5;
		border-radius: 0.5rem;
	}

	.error-message {
		color: #dc2626;
		font-weight: 500;
	}

	.error-container button {
		padding: 0.5rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
	}

	.chart-wrapper {
		margin-bottom: 2rem;
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.chart-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
		border: 2px dashed #cbd5e1;
		border-radius: 0.5rem;
	}

	.placeholder-content {
		text-align: center;
		color: #64748b;
	}

	.placeholder-stats {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.data-preview {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
	}

	.data-preview h3 {
		margin: 0 0 1rem 0;
		color: #1e293b;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.preview-line {
		padding: 1rem;
		background: #f8fafc;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		font-size: 0.9rem;
	}

	.line-color {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.preview-data {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.data-point {
		font-size: 0.8rem;
		color: #64748b;
	}

	.api-info {
		padding: 1.5rem;
		background: #f1f5f9;
		border-radius: 0.5rem;
		border: 1px solid #cbd5e1;
	}

	.api-info h3 {
		margin: 0 0 1rem 0;
		color: #1e293b;
	}

	.api-list {
		display: grid;
		gap: 1rem;
	}

	.api-item {
		padding: 1rem;
		background: white;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
	}

	.api-item strong {
		color: #1e293b;
	}

	.api-item small {
		color: #64748b;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.api-demo-container {
			padding: 1rem;
		}

		.demo-header h1 {
			font-size: 2rem;
		}

		.dataset-grid {
			grid-template-columns: 1fr;
		}

		.controls-grid {
			grid-template-columns: 1fr;
		}

		.status-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.preview-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
