<script lang="ts">
	import visitorsData from '$lib/data/visitors-data.json';
	import MetricSelector from '../collapsible/MetricSelector.svelte';
	import VisitorsLineChart from './VisitorsLineChart.svelte';

	// Define the chart data type
	type ChartDataPoint = {
		date: string;
		visitors: number;
		pageviews: number;
		sessions: number;
		bounce_rate: number;
		conversion_rate: number;
		period_label?: string;
	};

	// Time period options
	const timePeriods = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' }
	];

	// Metric options based on available data
	const metrics = [
		{ value: 'visitors', label: 'Visitors' },
		{ value: 'pageviews', label: 'Pageviews' },
		{ value: 'sessions', label: 'Sessions' },
		{ value: 'bounce_rate', label: 'Bounce Rate (%)' },
		{ value: 'conversion_rate', label: 'Conversion Rate (%)' }
	];

	// State
	let selectedPeriod = $state('daily');
	let selectedMetric = $state('visitors');

	// Function to get data based on selected period
	const getDataForPeriod = (period: string): ChartDataPoint[] => {
		switch (period) {
			case 'daily':
				return visitorsData.daily_data.map((item) => ({
					date: item.date,
					visitors: item.visitors,
					pageviews: item.pageviews,
					sessions: item.sessions,
					bounce_rate: item.bounce_rate,
					conversion_rate: item.conversion_rate
				}));
			case 'weekly':
				return visitorsData.weekly_aggregated.map((item) => ({
					date: item.start_date,
					period_label: `${item.week} (${item.start_date})`,
					visitors: item.visitors,
					pageviews: item.pageviews,
					sessions: item.sessions,
					bounce_rate: item.bounce_rate,
					conversion_rate: item.conversion_rate
				}));
			case 'monthly':
				return visitorsData.monthly_aggregated.map((item) => ({
					date: `${item.month}-01`,
					period_label: item.month,
					visitors: item.visitors,
					pageviews: item.pageviews,
					sessions: item.sessions,
					bounce_rate: item.bounce_rate,
					conversion_rate: item.conversion_rate
				}));
			case 'yearly':
				return visitorsData.yearly_aggregated.map((item) => ({
					date: `${item.year}-01-01`,
					period_label: item.year.toString(),
					visitors: item.visitors,
					pageviews: item.pageviews,
					sessions: item.sessions,
					bounce_rate: item.bounce_rate,
					conversion_rate: item.conversion_rate
				}));
			default:
				return [];
		}
	};

	// Reactive data based on selected period - not re-derived unnecessarily
	let chartData: ChartDataPoint[] = $state([]);
	$effect(() => {
		chartData = getDataForPeriod(selectedPeriod);
	});

	// Color scheme for different metrics
	const metricColors = {
		visitors: '#3b82f6',
		pageviews: '#10b981',
		sessions: '#f59e0b',
		bounce_rate: '#ef4444',
		conversion_rate: '#8b5cf6'
	};

	// Format numbers for display
	const formatNumber = (value: number, metric: string) => {
		if (metric === 'bounce_rate' || metric === 'conversion_rate') {
			return `${value.toFixed(1)}%`;
		}
		return value.toLocaleString();
	};

	// Get period label for display
	const getPeriodLabel = (period: string) => {
		switch (period) {
			case 'daily':
				return 'Daily Data (Oct 2024 - Dec 2024)';
			case 'weekly':
				return 'Weekly Aggregated Data';
			case 'monthly':
				return 'Monthly Aggregated Data';
			case 'yearly':
				return 'Yearly Aggregated Data';
			default:
				return '';
		}
	};

	// Data summary stats - use regular state instead of derived
	let dataSummary = $state<{
		total: number;
		average: number;
		min: number;
		max: number;
		dataPoints: number;
	} | null>(null);

	// Calculate summary function to avoid reactivity issues
	function calculateSummary() {
		if (chartData.length === 0) {
			return null;
		}

		const values = chartData.map((d) => d[selectedMetric as keyof typeof d] as number);
		const sum = values.reduce((a, b) => a + b, 0);
		const avg = sum / values.length;
		const min = Math.min(...values);
		const max = Math.max(...values);

		return {
			total: sum,
			average: avg,
			min: min,
			max: max,
			dataPoints: values.length
		};
	}

	// Calculate summary whenever chartData or selectedMetric changes
	// Using two separate effects to avoid circular dependencies
	$effect(() => {
		// This will track when chartData changes
		const _ = chartData.length;
		// This will track when selectedMetric changes
		const __ = selectedMetric;

		// Schedule the update asynchronously to break the update cycle
		setTimeout(() => {
			dataSummary = calculateSummary();
		}, 0);
	});
</script>

<div class="analytics-container">
	<div class="header-section">
		<h2>Website Analytics Dashboard</h2>
		<p class="subtitle">
			Real-time visitor data visualization with multiple time periods and metrics
		</p>
	</div>

	<div class="controls-section">
		<div class="controls-row">
			<MetricSelector
				options={timePeriods}
				bind:selectedValue={selectedPeriod}
				label="Time Period"
				placeholder="Select time period..."
			/>
			<MetricSelector
				options={metrics}
				bind:selectedValue={selectedMetric}
				label="Metric"
				placeholder="Select metric..."
			/>
		</div>
	</div>

	<div class="chart-section">
		<div class="chart-header">
			<h3>
				{metrics.find((m) => m.value === selectedMetric)?.label} - {getPeriodLabel(selectedPeriod)}
			</h3>
			{#if dataSummary}
				<div class="summary-stats">
					<div class="stat">
						<span class="stat-label">Total:</span>
						<span class="stat-value">{formatNumber(dataSummary.total, selectedMetric)}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Average:</span>
						<span class="stat-value">{formatNumber(dataSummary.average, selectedMetric)}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Min:</span>
						<span class="stat-value">{formatNumber(dataSummary.min, selectedMetric)}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Max:</span>
						<span class="stat-value">{formatNumber(dataSummary.max, selectedMetric)}</span>
					</div>
				</div>
			{/if}
		</div>

		<div class="chart-wrapper">
			<VisitorsLineChart data={chartData} {selectedMetric} />
		</div>
	</div>

	<div class="insights-section">
		<h3>Key Insights</h3>
		<div class="insights-grid">
			<div class="insight-card">
				<h4>📊 Data Points</h4>
				<p>{dataSummary?.dataPoints || 0} data points in selected period</p>
			</div>
			<div class="insight-card">
				<h4>📈 Growth Trend</h4>
				<p>
					{#if chartData.length >= 2}
						{@const firstValue = chartData[0][
							selectedMetric as keyof (typeof chartData)[0]
						] as number}
						{@const lastValue = chartData[chartData.length - 1][
							selectedMetric as keyof (typeof chartData)[0]
						] as number}
						{@const growth = (((lastValue - firstValue) / firstValue) * 100).toFixed(1)}
						{growth}% change from start to end
					{:else}
						No trend data available
					{/if}
				</p>
			</div>
			<div class="insight-card">
				<h4>🎯 Performance</h4>
				<p>
					{#if selectedMetric === 'bounce_rate'}
						Lower bounce rate indicates better engagement
					{:else if selectedMetric === 'conversion_rate'}
						Higher conversion rate shows better performance
					{:else}
						Track {selectedMetric.replace('_', ' ')} over time
					{/if}
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.analytics-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.header-section {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header-section h2 {
		color: #1e293b;
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		color: #64748b;
		font-size: 1.125rem;
		margin: 0;
	}

	.controls-section {
		background: white;
		padding: 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.controls-row {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.controls-row > :global(.metric-selector) {
		flex: 1;
		min-width: 250px;
	}

	.chart-section {
		background: white;
		padding: 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.chart-header h3 {
		color: #1e293b;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.summary-stats {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1e293b;
		margin-top: 0.25rem;
	}

	.chart-wrapper {
		height: 400px;
		width: 100%;
	}

	.insights-section {
		background: white;
		padding: 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.insights-section h3 {
		color: #1e293b;
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.insight-card {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
	}

	.insight-card h4 {
		color: #1e293b;
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}

	.insight-card p {
		color: #64748b;
		font-size: 0.875rem;
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.analytics-container {
			padding: 1rem;
		}

		.controls-row {
			flex-direction: column;
		}

		.chart-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.summary-stats {
			flex-direction: column;
			gap: 1rem;
		}

		.stat {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
