<script lang="ts">
	import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
	import {
		Accessibility,
		Activity,
		BookOpen,
		ChartLine,
		ClipboardList,
		Code,
		Settings,
		Smartphone,
		Sparkles,
		Tag,
		Target,
		TrendingDown,
		TrendingUp,
		Users
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
		return code
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
</script>

<!-- Documentation Section -->
{#if showDocumentation}
	<div class="documentation-container">
		<div class="doc-header">
			<h1>MultiLineChart Component Documentation</h1>
			<p>A flexible, feature-rich line chart component for Svelte 5</p>
			<div class="badge-container">
				<span class="badge">Svelte 5</span>
				<span class="badge">TypeScript</span>
				<span class="badge">Negative Values</span>
				<span class="badge">Auto Ticks</span>
			</div>
			<button class="toggle-docs" onclick={() => (showDocumentation = false)}>
				<BookOpen size={16} /> Hide Documentation
			</button>
		</div>

		<div class="doc-section">
			<h2><Sparkles size={20} /> Key Features</h2>
			<div class="feature-grid">
				<div class="feature-card">
					<h4><ChartLine size={18} /> Multiple Lines</h4>
					<p>
						Display up to 5 lines simultaneously with automatic color assignment and interactive
						legend.
					</p>
				</div>
				<div class="feature-card">
					<h4><TrendingDown size={18} /> Negative Values Support</h4>
					<p>Automatic handling of negative data with zero reference line and enhanced scaling.</p>
				</div>
				<div class="feature-card">
					<h4><Target size={18} /> Auto-Doubled Ticks</h4>
					<p>
						Automatically increases tick density when negative values are detected for better
						granularity.
					</p>
				</div>
				<div class="feature-card">
					<h4><Smartphone size={18} /> Responsive Design</h4>
					<p>Automatically adjusts to container size with smooth animations and transitions.</p>
				</div>
				<div class="feature-card">
					<h4><Tag size={18} /> Value Labels</h4>
					<p>Optional display of values above each data point for precise reading.</p>
				</div>
				<div class="feature-card">
					<h4><Accessibility size={18} /> Accessibility</h4>
					<p>
						Full keyboard navigation, comprehensive ARIA support, screen reader compatibility, and
						alternative data table access.
					</p>
				</div>
			</div>
		</div>

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
							<td><code>showValues</code> <span class="badge new">New</span></td>
							<td><code>boolean</code></td>
							<td><code>false</code></td>
							<td>Show value labels above each data point</td>
						</tr>
						<tr>
							<td><code>hasTooltip</code> <span class="badge new">New</span></td>
							<td><code>boolean</code></td>
							<td><code>true</code></td>
							<td>Enable/disable tooltips on hover</td>
						</tr>
						<tr>
							<td><code>yTickCount</code> <span class="badge new">New</span></td>
							<td><code>number</code></td>
							<td><code>5</code></td>
							<td>Number of ticks on Y-axis</td>
						</tr>
						<tr>
							<td><code>doubleTicksForNegatives</code> <span class="badge new">New</span></td>
							<td><code>boolean</code></td>
							<td><code>true</code></td>
							<td>Automatically double tick count when negative values detected</td>
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

		<div class="doc-section">
			<h2><Code size={20} /> Basic Usage</h2>
			<div class="code-block">
				<pre><code
						>{@html highlight(`import { MultiLineChart } from '$lib';

const lines = [
  {
    id: 'desktop',
    label: 'Desktop Sales',
    color: '#3b82f6',
    data: [
      { month: 'Jan', sales: 1000 },
      { month: 'Feb', sales: 3200 }
      // ... more data
    ]
  }
];

<MultiLineChart
  {lines}
  xKey="month"
  yKey="sales"
  title="Product Performance"
  showLegend={true}
/>`)}</code
					></pre>
			</div>
		</div>

		<div class="doc-section">
			<h2><TrendingDown size={20} /> Negative Values Support</h2>
			<div class="highlight-box">
				<h4><Target size={18} /> Automatic Features</h4>
				<p>
					When negative values are detected, the component automatically adds a zero reference line
					and can double the tick count for better granularity around the zero line.
				</p>
			</div>

			<div class="code-block">
				<pre><code
						>{@html highlight(`const profitLossData = [
  {
    id: 'product_a',
    label: 'Product A',
    color: '#3b82f6',
    data: [
      { month: 'Jan', profit: -1200 },
      { month: 'Feb', profit: -800 },
      { month: 'Mar', profit: 200 },
      { month: 'Apr', profit: 1500 }
    ]
  }
];

<MultiLineChart
  lines={profitLossData}
  xKey="month"
  yKey="profit"
  title="Profit/Loss Analysis"
  yTickCount={5}
  doubleTicksForNegatives={true}
/>`)}</code
					></pre>
			</div>
		</div>

		<div class="doc-section">
			<h2><Settings size={20} /> Advanced Configuration</h2>

			<div class="example-grid">
				<div class="example-card">
					<h4><Tag size={18} /> With Value Labels</h4>
					<div class="code-block">
						<pre><code
								>{@html highlight(`<MultiLineChart
  {lines}
  showValues={true}
  showLegend={true}
/>`)}</code
							></pre>
					</div>
				</div>

				<div class="example-card">
					<h4><Target size={18} /> Custom Tick Count</h4>
					<div class="code-block">
						<pre><code
								>{@html highlight(`<MultiLineChart
  {lines}
  yTickCount={8}
  doubleTicksForNegatives={false}
/>`)}</code
							></pre>
					</div>
				</div>

				<div class="example-card">
					<h4><Activity size={18} /> Disable Tooltips</h4>
					<div class="code-block">
						<pre><code
								>{@html highlight(`<MultiLineChart
  {lines}
  hasTooltip={false}
/>`)}</code
							></pre>
					</div>
				</div>

				<div class="example-card">
					<h4><ChartLine size={18} /> Custom Date Format</h4>
					<div class="code-block">
						<pre><code
								>{@html highlight(`<MultiLineChart
  {lines}
  dateFormat="MMM dd, yyyy"
  inputDateFormat="dd/MM/yyyy"
/>`)}</code
							></pre>
					</div>
				</div>
			</div>
		</div>

		<div class="doc-section">
			<h2><Code size={20} /> LineData Interface</h2>
			<div class="code-block">
				<pre><code
						>{@html highlight(`interface LineData {
  id: string;        // Unique identifier
  label: string;     // Display name
  color: string;     // Hex color code
  data: Array<Record<string, any>>; // Data points
}`)}</code
					></pre>
			</div>
		</div>

		<div class="doc-section">
			<h2><Accessibility size={20} /> Accessibility Features</h2>
			<p>
				This chart component is designed with accessibility as a core feature, providing multiple
				ways to interact with and understand the data:
			</p>

			<div class="feature-grid">
				<div class="feature-card">
					<h4><Activity size={18} /> Keyboard Navigation</h4>
					<p>
						<strong>Tab:</strong> Navigate between legend items<br />
						<strong>Enter/Space:</strong> Toggle line highlighting<br />
						<strong>Escape:</strong> Clear all highlights
					</p>
				</div>

				<div class="feature-card">
					<h4><Users size={18} /> Screen Reader Support</h4>
					<p>
						• Comprehensive ARIA labels and descriptions<br />
						• Live region announcements for interactions<br />
						• Chart summary and data point information
					</p>
				</div>

				<div class="feature-card">
					<h4><ChartLine size={18} /> Alternative Data Access</h4>
					<p>
						• Optional accessible data table view<br />
						• Proper table headers and structure<br />
						• Toggle between chart and table views
					</p>
				</div>

				<div class="feature-card">
					<h4><Activity size={18} /> Visual Accessibility</h4>
					<p>
						• High contrast colors and tooltips<br />
						• Clear focus indicators<br />
						• Responsive design for all screen sizes
					</p>
				</div>
			</div>

			<div class="highlight-box">
				<h4><Activity size={18} /> WCAG Compliance</h4>
				<p>
					This component meets WCAG 2.1 AA standards for accessibility, providing perceivable,
					operable, understandable, and robust chart interactions for all users.
				</p>
			</div>
		</div>

		<div class="doc-section">
			<h2><BookOpen size={20} /> More Examples</h2>
			<p>
				Check out the live examples in your application to see all features in action, including:
			</p>
			<ul style="margin: 1rem 0; padding-left: 2rem">
				<li>Single line charts with date parsing</li>
				<li>Multi-line charts with metric switching</li>
				<li>Profit/loss charts with negative values</li>
				<li>Comparison examples showing different tick configurations</li>
			</ul>
		</div>
	</div>
{:else}
	<div class="show-docs-container">
		<button class="show-docs-btn" onclick={() => (showDocumentation = true)}>
			<BookOpen size={16} /> Show Documentation
		</button>
	</div>
{/if}

<div class="example-container">
	<h1><ChartLine size={28} class="icon" /> Single Line Chart</h1>

	<MultiLineChart
		lines={[dateBasedData[2]]}
		xKey="date"
		yKey="value"
		title={`${[dateBasedData[2].label]} Count Over Time`}
		showLegend={true}
		height={450}
		yTickCount={4}
	/>

	<div class="description">
		<h2><Activity size={20} class="icon-small" /> Features Demonstrated:</h2>
		<ul>
			<li><ChartLine size={16} class="feature-icon" /> Single data series (Desktop Sales)</li>
			<li><Users size={16} class="feature-icon" /> Interactive legend with hover effects</li>
			<li><Activity size={16} class="feature-icon" /> <b>Uses `date-fns` for date parsing</b></li>
			<li>
				<ChartLine size={16} class="feature-icon" /> <strong>Custom Y-axis ticks</strong> - Using 4 ticks
				instead of default 5
			</li>
			<li><Activity size={16} class="feature-icon" /> Responsive design</li>
			<li><Activity size={16} class="feature-icon" /> Tooltip on data point hover</li>
			<li>
				<Activity size={16} class="feature-icon" /> Color-coded lines with accessibility support
			</li>
		</ul>
	</div>
</div>

<div class="example-container">
	<h1><ChartLine size={28} class="icon" /> Multi Line Chart Example</h1>

	<div class="controls">
		<label for="metric-select"><ChartLine size={16} class="icon-inline" /> Select Metric:</label>
		<select id="metric-select" bind:value={selectedMetric}>
			{#each metrics as metric}
				<option value={metric.value}>{metric.label}</option>
			{/each}
		</select>
	</div>

	<MultiLineChart
		lines={productData}
		xKey="month"
		yKey={selectedMetric}
		title={`Product Performance - ${metrics.find((m) => m.value === selectedMetric)?.label}`}
		showLegend={true}
		showValues={true}
		hasTooltip={false}
	/>

	<div class="description">
		<h2><Activity size={20} class="icon-small" /> Features Demonstrated:</h2>
		<ul>
			<li>
				<ChartLine size={16} class="feature-icon" /> Multiple data series (Desktop, Mobile, Tablet)
			</li>
			<li><Users size={16} class="feature-icon" /> Interactive legend with hover effects</li>
			<li><ChartLine size={16} class="feature-icon" /> Dynamic metric switching</li>
			<li><Activity size={16} class="feature-icon" /> Responsive design</li>
			<li><Activity size={16} class="feature-icon" /> Tooltip on data point hover</li>
			<li>
				<Activity size={16} class="feature-icon" /> Color-coded lines with accessibility support
			</li>
		</ul>
	</div>
</div>

<div class="example-container">
	<h1>
		<TrendingDown size={28} class="icon profit-loss" /> Profit/Loss Chart with Negative Values
	</h1>

	<div class="controls">
		<label for="profit-metric-select">Select Metric:</label>
		<select id="profit-metric-select" bind:value={selectedProfitMetric}>
			{#each profitMetrics as metric}
				<option value={metric.value}>{metric.label}</option>
			{/each}
		</select>
	</div>

	<MultiLineChart
		lines={profitLossData}
		xKey="month"
		yKey={selectedProfitMetric}
		title={`Product Performance - ${profitMetrics.find((m) => m.value === selectedProfitMetric)?.label}`}
		showLegend={true}
		showValues={true}
		hasTooltip={true}
		height={450}
		yTickCount={5}
		doubleTicks={true}
	/>

	<div class="description">
		<h2><Activity size={20} class="icon-small" /> Features Demonstrated:</h2>
		<ul>
			<li>
				<TrendingDown size={16} class="feature-icon negative" />
				<strong>Negative values support</strong> - Properly scaled Y-axis with negative numbers
			</li>
			<li>
				<Activity size={16} class="feature-icon" /> <strong>Zero reference line</strong> - Horizontal
				line at y=0 for visual reference
			</li>
			<li>
				<TrendingUp size={16} class="feature-icon positive" /> <strong>Auto-doubled ticks</strong> -
				Automatically doubles tick count (5→10) for negative data
			</li>
			<li>
				<ChartLine size={16} class="feature-icon" /> Multiple data series with both positive and negative
				values
			</li>
			<li>
				<ChartLine size={16} class="feature-icon" /> Dynamic metric switching between profit and margin
			</li>
			<li><Activity size={16} class="feature-icon" /> Responsive design with proper grid lines</li>
			<li>Tooltips showing negative values correctly</li>
		</ul>
	</div>
</div>

<div class="example-container">
	<h1><ChartLine size={28} class="icon" /> Comparison: Standard vs Auto-Doubled Ticks</h1>

	<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
		<div>
			<h3 style="text-align: center; margin-bottom: 1rem;">Standard Ticks (5 total)</h3>
			<MultiLineChart
				lines={profitLossData}
				xKey="month"
				yKey="profit"
				title="Profit - Standard Ticks"
				showLegend={false}
				height={350}
				yTickCount={5}
				doubleTicks={false}
			/>
		</div>
		<div>
			<h3 style="text-align: center; margin-bottom: 1rem;">Auto-Doubled Ticks (10 total)</h3>
			<MultiLineChart
				lines={profitLossData}
				xKey="month"
				yKey="profit"
				title="Profit - Auto-Doubled Ticks"
				showLegend={false}
				height={350}
				yTickCount={5}
				doubleTicks={true}
			/>
		</div>
	</div>

	<div class="description">
		<h2>Comparison Benefits:</h2>
		<ul>
			<li>
				<strong>Better granularity</strong> - More ticks around the zero line for precise reading
			</li>
			<li><strong>Automatic detection</strong> - No manual configuration needed</li>
			<li>
				<strong>Configurable</strong> - Can be disabled with `doubleTicksForNegatives={false}`
			</li>
			<li><strong>Smart spacing</strong> - Maintains readable tick intervals</li>
		</ul>
	</div>
</div>

<style>
	.example-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		color: #1e293b;
		margin-bottom: 2rem;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.controls {
		margin-bottom: 2rem;
		text-align: center;
	}

	.controls label {
		/* display: inline-block; */
		margin-right: 1rem;
		font-weight: 600;
		color: #374151;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
	}

	.controls select {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.controls select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.description {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.description h2 {
		color: #1e293b;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.description ul {
		color: #64748b;
		line-height: 1.6;
	}

	.description li {
		margin-bottom: 0.5rem;
	}

	/* Icon styles */
	:global(.icon) {
		color: #3b82f6;
		stroke-width: 2;
	}

	:global(.icon-small) {
		color: #6b7280;
		stroke-width: 2;
	}

	:global(.icon-inline) {
		color: #6b7280;
		stroke-width: 2;
		vertical-align: middle;
	}

	:global(.feature-icon) {
		color: #6b7280;
		stroke-width: 2;
		margin-right: 0.5rem;
		vertical-align: middle;
		flex-shrink: 0;
	}

	:global(.feature-icon.positive) {
		color: #10b981;
	}

	:global(.feature-icon.negative) {
		color: #ef4444;
	}

	:global(.profit-loss) {
		color: #ef4444;
	}

	h1 :global(.icon) {
		flex-shrink: 0;
	}

	.controls label :global(.icon-inline) {
		flex-shrink: 0;
	}

	.description h2 :global(.icon-small) {
		flex-shrink: 0;
	}

	.description li {
		margin-bottom: 0.5rem;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.description li :global(.feature-icon) {
		margin-top: 0.1rem;
	}

	/* Documentation styles */
	.documentation-container {
		max-width: 1200px;
		margin: 0 auto 3rem auto;
		padding: 2rem;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		line-height: 1.7;
		color: #2d3748;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
	}

	.show-docs-container {
		text-align: center;
		margin-bottom: 2rem;
	}

	.show-docs-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.show-docs-btn:hover {
		background: #2563eb;
	}

	.doc-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem;
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		position: relative;
	}

	.doc-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
		color: #1a202c;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.doc-header p {
		font-size: 1.25rem;
		color: #4a5568;
		font-weight: 400;
		margin-bottom: 1.5rem;
	}

	.badge-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.badge {
		display: inline-block;
		background: #4a5568;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 16px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.badge.new {
		background: #8e4ea1;
	}

	.toggle-docs {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #e2e8f0;
		color: #4a5568;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background-color 0.2s ease;
	}

	.toggle-docs:hover {
		background: #cbd5e0;
	}

	.doc-section {
		background: white;
		margin-bottom: 2rem;
		padding: 2rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
	}

	.doc-section h2 {
		color: #1a202c;
		margin-bottom: 1.5rem;
		font-size: 1.75rem;
		font-weight: 600;
		border-bottom: 1px solid #e2e8f0;
		padding-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin: 1.5rem 0;
	}

	.feature-card {
		background: #f7fafc;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		transition: border-color 0.2s ease;
	}

	.feature-card:hover {
		border-color: #cbd5e0;
	}

	.feature-card h4 {
		color: #1a202c;
		margin-bottom: 0.75rem;
		font-size: 1.125rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.feature-card p {
		color: #4a5568;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.table-container {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		margin: 0;
		background: white;
		font-size: 0.95rem;
	}

	.props-table th,
	.props-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	.props-table th {
		background: #f7fafc;
		font-weight: 600;
		color: #2d3748;
	}

	.props-table tr:last-child td {
		border-bottom: none;
	}

	.props-table code {
		background: #edf2f7;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		font-size: 0.875rem;
		color: #2d3748;
		border: 1px solid #e2e8f0;
	}

	.code-block {
		background: #131517;
		color: #e6e6e6; /* Better base color for readability */
		padding: 1.5rem;
		border-radius: 8px;
		margin: 1rem 0;
		overflow-x: auto;
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		border: 1px solid #e2e8f0;
	}

	.code-block pre {
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		overflow: visible;
	}

	.code-block code {
		background: transparent;
		color: inherit;
		padding: 0;
		border: none;
		font-size: inherit;
		font-family: inherit;
	}

	/* Remove all the broken syntax highlighting rules */

	.highlight-box {
		background: #f0fff4;
		border: 1px solid #9ae6b4;
		border-radius: 8px;
		padding: 1.25rem;
		margin: 1.5rem 0;
	}

	.highlight-box h4 {
		color: #22543d;
		margin-bottom: 0.5rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.highlight-box p {
		color: #2f855a;
		margin: 0;
	}

	.example-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.example-card {
		background: #f7fafc;
		border-radius: 8px;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
	}

	.example-card h4 {
		color: #1a202c;
		margin-bottom: 1rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.example-card .code-block {
		margin: 0.5rem 0 0 0;
		padding: 1rem;
	}

	@media (max-width: 768px) {
		.documentation-container {
			padding: 1rem;
		}

		.doc-header {
			padding: 1.5rem;
		}

		.doc-header h1 {
			font-size: 2rem;
		}

		.doc-section {
			padding: 1.5rem;
		}

		.feature-grid {
			grid-template-columns: 1fr;
		}

		.example-grid {
			grid-template-columns: 1fr;
		}

		.toggle-docs {
			position: static;
			margin-top: 1rem;
		}
	}
</style>

 