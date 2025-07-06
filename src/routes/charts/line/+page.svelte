<script lang="ts">
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
	import {
		Accessibility,
		Activity,
		ArrowLeft,
		BookOpen,
		ChartLine,
		ClipboardList,
		Code,
		Smartphone,
		Sparkles,
		Tag,
		Target,
		TrendingDown,
		Users,
		Settings
	} from 'lucide-svelte';

	// Documentation visibility state
	let showDocumentation = true;

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

	// Simple function that just returns code without highlighting for now
	function highlight(code: string): string {
		return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
</script>

<!-- Back Navigation -->
<nav class="nav-back">
	<div class="container">
		<a href="/charts" class="back-link">
			<ArrowLeft size={16} />
			Back to Charts
		</a>
	</div>
</nav>

<!-- Page Header -->
<header class="page-header">
	<div class="container">
		<div class="header-content">
			<div class="header-text">
				<h1>
					<ChartLine size={32} />
					Line Charts
				</h1>
				<p class="header-description">
					Professional line chart component for Svelte 5. Display trends and changes over time with
					support for multiple data series, negative values, and comprehensive accessibility
					features.
				</p>

				<div class="header-features">
					<span class="feature-tag">Multi-line Support</span>
					<span class="feature-tag">Negative Values</span>
					<span class="feature-tag">Date Parsing</span>
					<span class="feature-tag">Accessibility</span>
				</div>
			</div>

			<div class="header-actions">
				<button class="btn btn-secondary" onclick={() => (showDocumentation = !showDocumentation)}>
					<BookOpen size={16} />
					{showDocumentation ? 'Hide' : 'Show'} Documentation
				</button>
			</div>
		</div>
	</div>
</header>

<!-- Documentation Section -->
{#if showDocumentation}
	<section class="documentation">
		<div class="container">
			<div class="doc-grid">
				<!-- Props Reference -->
				<div class="doc-section">
					<h2><ClipboardList size={20} /> Props Reference</h2>
					<div class="table-container">
						<table class="props-table">
							<thead>
								<tr>
									<th>Prop</th>
									<th>Type</th>
									<th>Default</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td><code>lines</code></td>
									<td><code>LineData[]</code></td>
									<td><code>[]</code></td>
									<td>Array of line data objects (max 5 lines)</td>
								</tr>
								<tr>
									<td><code>xKey</code></td>
									<td><code>string</code></td>
									<td><code>'date'</code></td>
									<td>Key to use for x-axis values</td>
								</tr>
								<tr>
									<td><code>yKey</code></td>
									<td><code>string</code></td>
									<td><code>'value'</code></td>
									<td>Key to use for y-axis values</td>
								</tr>
								<tr>
									<td><code>title</code></td>
									<td><code>string</code></td>
									<td><code>'Multi Line Chart'</code></td>
									<td>Chart title</td>
								</tr>
								<tr>
									<td><code>showLegend</code></td>
									<td><code>boolean</code></td>
									<td><code>true</code></td>
									<td>Whether to show the legend</td>
								</tr>
								<tr>
									<td><code>height</code></td>
									<td><code>number</code></td>
									<td><code>400</code></td>
									<td>Chart height in pixels</td>
								</tr>
								<tr>
									<td><code>showValues</code></td>
									<td><code>boolean</code></td>
									<td><code>false</code></td>
									<td>Show value labels above each data point</td>
								</tr>
								<tr>
									<td><code>hasTooltip</code></td>
									<td><code>boolean</code></td>
									<td><code>true</code></td>
									<td>Enable/disable tooltips on hover</td>
								</tr>
								<tr>
									<td><code>yTickCount</code></td>
									<td><code>number</code></td>
									<td><code>5</code></td>
									<td>Number of ticks on Y-axis</td>
								</tr>
								<tr>
									<td><code>doubleTicksForNegatives</code></td>
									<td><code>boolean</code></td>
									<td><code>true</code></td>
									<td>Auto double tick count for negative values</td>
								</tr>
								<tr>
									<td><code>dateFormat</code></td>
									<td><code>string</code></td>
									<td><code>'MMM dd'</code></td>
									<td>Date format for display (using date-fns format)</td>
								</tr>
								<tr>
									<td><code>inputDateFormat</code></td>
									<td><code>string | null</code></td>
									<td><code>null</code></td>
									<td>Expected input date format for parsing</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<!-- Basic Usage -->
				<div class="doc-section">
					<h2><Code size={20} /> Basic Usage</h2>
					<div class="code-preview">
						<div class="features-visual">
							<CodeBlock
								code={`
									<MultiLineChart
										lines={Data}
										xKey="month"
										yKey="sales"
										title="Product Performance"
										showLegend={true}
									/>`}
								language="svelte"
								theme="tokyo-night"
							/>
						</div>
					</div>
				</div>

				<!-- Negative Values Support -->
				<div class="doc-section">
					<h2><TrendingDown size={20} /> Negative Values Support</h2>
					<div class="highlight-box">
						<h4><Target size={18} /> Automatic Features</h4>
						<p>
							When negative values are detected, the component automatically adds a zero reference
							line and can double the tick count for better granularity around the zero line.
						</p>
					</div>

					<div class="code-preview">
						<div class="features-visual">
							<CodeBlock
								code={`
									<MultiLineChart
										lines={profitLossData}
										xKey="month"
										yKey="profit"
										title="Profit/Loss Analysis"
										yTickCount={5}
										doubleTicksForNegatives={true}
									/>
									`}
								language="svelte"
								theme="tokyo-night"
							/>
						</div>
					</div>
				</div>

				<!-- Key Features -->
				<div class="doc-section">
					<h2><Sparkles size={20} /> Key Features</h2>
					<div class="feature-grid">
						<div class="feature-card">
							<div class="feature-icon">
								<ChartLine size={24} />
							</div>
							<h4>Multiple Lines</h4>
							<p>
								Display up to 5 lines simultaneously with automatic color assignment and interactive
								legend.
							</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">
								<TrendingDown size={24} />
							</div>
							<h4>Negative Values Support</h4>
							<p>
								Automatic handling of negative data with zero reference line and enhanced scaling.
							</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">
								<Target size={24} />
							</div>
							<h4>Auto-Doubled Ticks</h4>
							<p>
								Automatically increases tick density when negative values are detected for better
								granularity.
							</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">
								<Smartphone size={24} />
							</div>
							<h4>Responsive Design</h4>
							<p>Automatically adjusts to container size with smooth animations and transitions.</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">
								<Tag size={24} />
							</div>
							<h4>Value Labels</h4>
							<p>Optional display of values above each data point for precise reading.</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">
								<Accessibility size={24} />
							</div>
							<h4>Accessibility</h4>
							<p>
								Full keyboard navigation, comprehensive ARIA support, screen reader compatibility,
								and alternative data table access.
							</p>
						</div>
					</div>
				</div>

				<!-- Advanced Examples -->
				<div class="doc-section">
					<h2><Settings size={20} /> Advanced Configuration</h2>
					<div class="config-grid">
						<div class="config-item">
							<h4><Tag size={18} /> Point Value Labels</h4>
							<div class="code-preview small">
								<CodeBlock
									code={`
										<MultiLineChart
											lines={data}
											xKey="date"
											yKey="value"
											showValues={true}
											showLegend={false}
										/>
										`}
									language="svelte"
									theme="tokyo-night"
								/>
							</div>
						</div>
						<div class="config-item">
							<h4><Target size={18} /> Custom Tick Count</h4>
							<div class="code-preview small">
								<CodeBlock
								code={`
									<MultiLineChart
										lines={data}
										xKey="date"
										yKey="value"
										yTickCount={8}
										doubleTicksForNegatives={false}
									/>
									`}
								language="svelte"
								theme="tokyo-night"
							/>
							</div>
						</div>
						
						<div class="config-item">
							<h4><Activity size={18} /> Disable Tooltips</h4>
							<div class="code-preview small">
								<CodeBlock
								code={`
									<MultiLineChart
										lines={data}
										xKey="date"
										yKey="value"
										yTickCount={8}
										hasTooltip={false}
									/>
									`}
								language="svelte"
								theme="tokyo-night"
							/>
							</div>
						</div>
						<div class="config-item">
							<h4><ChartLine size={18} /> Custom Date Format</h4>
							<div class="code-preview small">
								<CodeBlock
								code={`
									<MultiLineChart
										lines={data}
										xKey="date"
										yKey="value"
										dateFormat="MMM dd, yyyy"
										inputDateFormat="dd/MM/yyyy"
									/>
									`}
								language="svelte"
								theme="tokyo-night"
							/>
							</div>
						</div>
					</div>
				</div>

				<!-- LineData Interface -->
				<!-- <div class="doc-section">
					<h2><Code size={20} /> LineData Interface</h2>
					<div class="code-preview">
						<div class="code-header">TypeScript Interface</div>
						<div class="code-content">
							<code>
								<span class="prop">interface</span> <span class="code-tag">LineData</span>
								<span class="ltgt">&#123;</span><br />
								&nbsp;&nbsp;<span class="prop">id</span>:
								<span class="value">string</span
								>;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="comment"
									>// Unique identifier</span
								><br />
								&nbsp;&nbsp;<span class="prop">label</span>:
								<span class="value">string</span>;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span
									class="comment">// Display name</span
								><br />
								&nbsp;&nbsp;<span class="prop">color</span>:
								<span class="value">string</span>;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span
									class="comment">// Hex color code</span
								><br />
								&nbsp;&nbsp;<span class="prop">data</span>:
								<span class="code-tag">Array&lt;Record&lt;string, any&gt;&gt;</span>;
								<span class="comment">// Data points</span><br />
								<span class="ltgt">&#125;</span>
							</code>
						</div>
					</div>
				</div> -->

				<!-- Accessibility Features -->
				<div class="doc-section">
					<h2><Accessibility size={20} /> Accessibility Features</h2>
					<p class="accessibility-intro">
						This chart component is designed with accessibility as a core feature, providing
						multiple ways to interact with and understand the data:
					</p>

					<div class="accessibility-grid">
						<div class="accessibility-card">
							<div class="accessibility-icon">
								<Activity size={24} />
							</div>
							<h4>Keyboard Navigation</h4>
							<div class="accessibility-content">
								<div class="keyboard-shortcuts">
									<div class="shortcut">
										<kbd>Tab</kbd>
										<span>Navigate between legend items</span>
									</div>
									<div class="shortcut">
										<kbd>Enter</kbd> / <kbd>Space</kbd>
										<span>Toggle line highlighting</span>
									</div>
									<div class="shortcut">
										<kbd>Escape</kbd>
										<span>Clear all highlights</span>
									</div>
								</div>
							</div>
						</div>

						<div class="accessibility-card">
							<div class="accessibility-icon">
								<Users size={24} />
							</div>
							<h4>Screen Reader Support</h4>
							<div class="accessibility-content">
								<ul class="accessibility-list">
									<li>Comprehensive ARIA labels and descriptions</li>
									<li>Live region announcements for interactions</li>
									<li>Chart summary and data point information</li>
								</ul>
							</div>
						</div>

						<div class="accessibility-card">
							<div class="accessibility-icon">
								<ChartLine size={24} />
							</div>
							<h4>Alternative Data Access</h4>
							<div class="accessibility-content">
								<ul class="accessibility-list">
									<li>Optional accessible data table view</li>
									<li>Proper table headers and structure</li>
									<li>Toggle between chart and table views</li>
								</ul>
							</div>
						</div>

						<div class="accessibility-card">
							<div class="accessibility-icon">
								<Activity size={24} />
							</div>
							<h4>Visual Accessibility</h4>
							<div class="accessibility-content">
								<ul class="accessibility-list">
									<li>High contrast colors and tooltips</li>
									<li>Clear focus indicators</li>
									<li>Responsive design for all screen sizes</li>
								</ul>
							</div>
						</div>
					</div>

					<div class="wcag-compliance">
						<div class="wcag-icon">
							<Activity size={20} />
						</div>
						<div class="wcag-content">
							<h4>WCAG Compliance</h4>
							<p>
								This component meets WCAG 2.1 AA standards for accessibility, providing perceivable,
								operable, understandable, and robust chart interactions for all users.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Examples Section -->
<section class="examples">
	<div class="container">
		<h2>Live Examples</h2>

		<!-- Single Line Chart -->
		<div class="example-card">
			<div class="example-header">
				<h3>Single Line Chart</h3>
				<p>Basic implementation with date parsing and custom tick count</p>
			</div>

			<div class="example-content">
				<MultiLineChart
					lines={[dateBasedData[2]]}
					xKey="date"
					yKey="value"
					title={`${[dateBasedData[2].label]} Count Over Time`}
					showLegend={true}
					height={300}
					yTickCount={4}
				/>
			</div>

			<div class="example-features">
				<span class="feature-tag">Date Parsing</span>
				<span class="feature-tag">Custom Ticks</span>
			</div>
		</div>

		<!-- Multi Line Chart -->
		<div class="example-card">
			<div class="example-header">
				<h3>Multi Line Chart</h3>
				<p>Multiple data series with interactive metric switching</p>
			</div>

			<div class="example-controls">
				<label for="metric-select">Metric:</label>
				<select id="metric-select" bind:value={selectedMetric} class="select">
					{#each metrics as metric}
						<option value={metric.value}>{metric.label}</option>
					{/each}
				</select>
			</div>

			<div class="example-content">
				<MultiLineChart
					lines={productData}
					xKey="month"
					yKey={selectedMetric}
					title={`Product Performance - ${metrics.find((m) => m.value === selectedMetric)?.label}`}
					showLegend={true}
					showValues={true}
					hasTooltip={false}
					height={350}
				/>
			</div>

			<div class="example-features">
				<span class="feature-tag">Multi-line</span>
				<span class="feature-tag">Value Labels</span>
				<span class="feature-tag">Interactive</span>
			</div>
		</div>

		<!-- Negative Values Chart -->
		<div class="example-card">
			<div class="example-header">
				<h3>Profit/Loss Chart</h3>
				<p>Handling negative values with auto-doubled ticks and zero reference</p>
			</div>

			<div class="example-controls">
				<label for="profit-metric-select">Metric:</label>
				<select id="profit-metric-select" bind:value={selectedProfitMetric} class="select">
					{#each profitMetrics as metric}
						<option value={metric.value}>{metric.label}</option>
					{/each}
				</select>
			</div>

			<div class="example-content">
				<MultiLineChart
					lines={profitLossData}
					xKey="month"
					yKey={selectedProfitMetric}
					title={`Product Performance - ${profitMetrics.find((m) => m.value === selectedProfitMetric)?.label}`}
					showLegend={true}
					showValues={true}
					height={350}
					yTickCount={5}
					doubleTicksForNegatives={true}
				/>
			</div>

			<div class="example-features">
				<span class="feature-tag negative">Negative Values</span>
				<span class="feature-tag">Zero Reference</span>
				<span class="feature-tag">Auto Ticks</span>
			</div>
		</div>

		<!-- Comparison: Standard vs Auto-Doubled Ticks -->
		<div class="example-card">
			<div class="example-header">
				<h3>Comparison: Standard vs Auto-Doubled Ticks</h3>
				<p>Demonstrating the difference between standard and auto-doubled tick configurations</p>
			</div>

			<div class="example-content">
				<div class="comparison-grid">
					<div class="comparison-item">
						<h4>Standard Ticks (5 total)</h4>
						<MultiLineChart
							lines={profitLossData}
							xKey="month"
							yKey="profit"
							title=""
							showLegend={false}
							height={280}
							yTickCount={5}
							doubleTicksForNegatives={false}
						/>
					</div>
					<div class="comparison-item">
						<h4>Auto-Doubled Ticks (10 total)</h4>
						<MultiLineChart
							lines={profitLossData}
							xKey="month"
							yKey="profit"
							title=""
							showLegend={false}
							height={280}
							yTickCount={5}
							doubleTicksForNegatives={true}
						/>
					</div>
				</div>
			</div>

			<div class="example-features">
				<span class="feature-tag">Comparison</span>
				<span class="feature-tag">Auto Ticks</span>
				<span class="feature-tag">Granularity</span>
			</div>
		</div>
	</div>
</section>

<style>
	/* Swiss Design Variables */
	:root {
		--color-black: #000000;
		--color-brand: oklch(65.805% 0.22836 27.671);
		--color-white: #ffffff;
		--color-gray-light: #f5f5f5;
		--color-gray-medium: #cccccc;
		--color-gray-dark: #666666;
		--color-gray-text: #999999;
		--color-yellow: oklch(91.507% 0.16649 101.73);
		--color-salmon: oklch(0.704 0.191 22.216);
		--color-violet: oklch(79.002% 0.12088 296.501);
		--color-green: oklch(0.871 0.15 154.449);

		--font-system:
			-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
		--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

		--spacing-xs: 0.5rem;
		--spacing-sm: 1rem;
		--spacing-md: 2rem;
		--spacing-lg: 4rem;
		--spacing-xl: 6rem;

		--transition: all 0.2s ease;
	}

	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-sm);
		font-family: var(--font-system);
		line-height: 1.5;
		color: var(--color-black);
	}

	/* Navigation */
	.nav-back {
		border-bottom: 1px solid var(--color-gray-medium);
		padding: var(--spacing-sm) 0;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-gray-dark);
		text-decoration: none;
		font-size: 0.875rem;
		transition: var(--transition);
	}

	.back-link:hover {
		color: var(--color-brand);
	}

	/* Page Header */
	.page-header {
		border-bottom: 1px solid var(--color-gray-medium);
		padding: var(--spacing-lg) 0;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-md);
	}

	.header-text h1 {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 2.5rem;
		font-weight: 400;
		margin-bottom: var(--spacing-sm);
	}

	.header-text h1 :global(svg) {
		color: var(--color-brand);
	}

	.header-description {
		font-size: 1.125rem;
		color: var(--color-gray-dark);
		max-width: 600px;
		margin-bottom: var(--spacing-md);
	}

	.header-features {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	.feature-tag {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-gray-medium);
		color: var(--color-gray-dark);
	}

	.feature-tag.negative {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		text-decoration: none;
		font-weight: 500;
		border: 2px solid var(--color-black);
		transition: var(--transition);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.95rem;
		background: transparent;
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-black);
	}

	.btn-secondary:hover {
		background: var(--color-gray-light);
	}

	/* Documentation */
	.documentation {
		border-bottom: 1px solid var(--color-gray-medium);
		padding: var(--spacing-lg) 0;
		background: var(--color-gray-light);
	}

	.doc-grid {
		display: grid;
		gap: var(--spacing-lg);
	}

	.doc-section {
		background: var(--color-white);
		padding: var(--spacing-md);
		border: 1px solid var(--color-gray-medium);
	}

	.doc-section h2 {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 1.5rem;
		font-weight: 400;
		margin-bottom: var(--spacing-md);
		padding-bottom: var(--spacing-sm);
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.doc-section h2 :global(svg) {
		color: var(--color-brand);
	}

	/* Tables */
	.table-container {
		overflow-x: auto;
		border: 1px solid var(--color-gray-medium);
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.props-table th,
	.props-table td {
		padding: var(--spacing-sm);
		text-align: left;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.props-table th {
		background: var(--color-gray-light);
		font-weight: 500;
	}

	.props-table code {
		background: var(--color-gray-light);
		padding: 0.25rem 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		border: 1px solid var(--color-gray-medium);
	}

	/* Code Blocks with Syntax Highlighting */
	.code-preview {
		background: var(--color-black);
		color: var(--color-white);
		font-family: var(--font-mono);
	}

	.code-preview.small {
		font-size: 0.8rem;
	}

	.code-header {
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--color-gray-dark);
		font-size: 0.875rem;
		color: var(--color-gray-medium);
	}

	.code-content {
		padding: var(--spacing-md);
	}

	.code-content code {
		font-size: 0.875rem;
		line-height: 1.6;
	}

	/* Syntax highlighting */
	.code-tag {
		color: var(--color-yellow);
		font-weight: bold;
	}
	.ltgt {
		color: var(--color-salmon);
	}
	.prop {
		color: var(--color-violet);
	}
	.value {
		color: var(--color-green);
	}
	.features-visual {
		display: flex;
		flex-direction: column;
	}
	/* Features List */
	.features-list {
		display: grid;
		gap: var(--spacing-md);
	}

	.feature-item {
		display: flex;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
		border: 1px solid var(--color-gray-medium);
	}

	.feature-item :global(svg) {
		color: var(--color-brand);
		flex-shrink: 0;
		margin-top: 0.2rem;
	}

	.feature-item h4 {
		font-size: 1rem;
		font-weight: 500;
		margin: 0 0 0.25rem 0;
	}

	.feature-item p {
		font-size: 0.875rem;
		color: var(--color-gray-dark);
		margin: 0;
	}

	/* Configuration Grid */
	.config-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.config-item h4 {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: var(--spacing-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Examples */
	.examples {
		padding: var(--spacing-lg) 0;
	}

	.examples h2 {
		font-size: 2rem;
		font-weight: 400;
		margin-bottom: var(--spacing-lg);
		text-align: center;
	}

	.example-card {
		border: 2px solid var(--color-gray-medium);
		margin-bottom: var(--spacing-lg);
		background: var(--color-white);
	}

	.example-header {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.example-header h3 {
		font-size: 1.25rem;
		font-weight: 500;
		margin: 0 0 0.5rem 0;
	}

	.example-header p {
		color: var(--color-gray-dark);
		margin: 0;
	}

	.example-controls {
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--color-gray-medium);
		background: var(--color-gray-light);
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.example-controls label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.select {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-gray-medium);
		font-family: inherit;
		font-size: 0.875rem;
	}

	.example-content {
		padding: var(--spacing-md);
	}

	.example-features {
		padding: var(--spacing-sm) var(--spacing-md);
		border-top: 1px solid var(--color-gray-medium);
		background: var(--color-gray-light);
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	/* Comparison Grid */
	.comparison-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.comparison-item h4 {
		text-align: center;
		margin-bottom: var(--spacing-sm);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-dark);
	}

	.comment {
		color: var(--color-gray-text);
		font-style: italic;
	}

	@media (max-width: 768px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}

		.config-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Feature Grid - Swiss Design */
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}

	.feature-card {
		background: var(--color-white);
		border: 2px solid var(--color-gray-medium);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-sm);
		transition: var(--transition);
		position: relative;
	}

	.feature-card:hover {
		border-color: var(--color-brand);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.feature-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: var(--color-gray-light);
		border: 1px solid var(--color-gray-medium);
		color: var(--color-brand);
		flex-shrink: 0;
	}

	.feature-card h4 {
		font-size: 1.125rem;
		font-weight: 500;
		margin: 0;
		color: var(--color-black);
		line-height: 1.3;
	}

	.feature-card p {
		font-size: 0.875rem;
		color: var(--color-gray-dark);
		margin: 0;
		line-height: 1.5;
	}

	/* Accessibility Features - Swiss Design */
	.accessibility-intro {
		font-size: 1rem;
		color: var(--color-gray-dark);
		margin-bottom: var(--spacing-md);
		line-height: 1.6;
	}

	.accessibility-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.accessibility-card {
		background: var(--color-white);
		border: 2px solid var(--color-gray-medium);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		transition: var(--transition);
	}

	.accessibility-card:hover {
		border-color: var(--color-brand);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.accessibility-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: var(--color-gray-light);
		border: 1px solid var(--color-gray-medium);
		color: var(--color-brand);
		flex-shrink: 0;
		margin-bottom: var(--spacing-xs);
	}

	.accessibility-card h4 {
		font-size: 1.125rem;
		font-weight: 500;
		margin: 0;
		color: var(--color-black);
		line-height: 1.3;
	}

	.accessibility-content {
		flex: 1;
	}

	.keyboard-shortcuts {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.shortcut {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 0.875rem;
	}

	.shortcut kbd {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-family: var(--font-mono);
		background: var(--color-gray-light);
		border: 1px solid var(--color-gray-medium);
		border-radius: 3px;
		color: var(--color-black);
		min-width: 2rem;
		text-align: center;
	}

	.shortcut span {
		color: var(--color-gray-dark);
		line-height: 1.4;
	}

	.accessibility-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.accessibility-list li {
		font-size: 0.875rem;
		color: var(--color-gray-dark);
		line-height: 1.5;
		position: relative;
		padding-left: 1rem;
	}

	.accessibility-list li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--color-brand);
		font-weight: bold;
	}

	/* WCAG Compliance Box */
	.wcag-compliance {
		background: var(--color-gray-light);
		border: 2px solid var(--color-brand);
		padding: var(--spacing-md);
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-sm);
	}

	.wcag-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: var(--color-brand);
		color: var(--color-white);
		flex-shrink: 0;
	}

	.wcag-content h4 {
		font-size: 1.125rem;
		font-weight: 500;
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--color-black);
	}

	.wcag-content p {
		font-size: 0.875rem;
		color: var(--color-gray-dark);
		margin: 0;
		line-height: 1.5;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.feature-grid {
			grid-template-columns: 1fr;
		}

		.accessibility-grid {
			grid-template-columns: 1fr;
		}

		.feature-card,
		.accessibility-card {
			padding: var(--spacing-sm);
		}

		.wcag-compliance {
			flex-direction: column;
			text-align: center;
		}

		.wcag-icon {
			align-self: center;
		}
	}
</style>
