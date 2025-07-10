<!-- src/routes/+page.svelte -->
<script lang="ts">
  import ChartProvider from '$lib/components/_Z_chatTestsNotGood/types/ChartProvider.svelte';
  import LineChart from '$lib/components/_Z_chatTestsNotGood/LineChart.svelte';
  import type { ChartDataPoint, ChartConfig } from '$lib/components/_Z_chatTestsNotGood/types/chart.js';

  // Sample analytics data - your actual data structure
  const analyticsData: readonly ChartDataPoint[] = [
    { date: '2024-10-01', visitors: 1245, pageviews: 3891, conversion_rate: 3.2, bounce_rate: 42.3, revenue: 5200 },
    { date: '2024-10-02', visitors: 1389, pageviews: 4234, conversion_rate: 3.7, bounce_rate: 39.8, revenue: 5800 },
    { date: '2024-10-03', visitors: 1567, pageviews: 4891, conversion_rate: 4.1, bounce_rate: 37.2, revenue: 6100 },
    { date: '2024-10-04', visitors: 1823, pageviews: 5234, conversion_rate: 4.5, bounce_rate: 35.6, revenue: 6800 },
    { date: '2024-10-05', visitors: 1456, pageviews: 4567, conversion_rate: 3.9, bounce_rate: 41.2, revenue: 5500 },
    { date: '2024-10-06', visitors: 1234, pageviews: 3789, conversion_rate: 3.1, bounce_rate: 44.7, revenue: 4900 },
    { date: '2024-10-07', visitors: 1678, pageviews: 5123, conversion_rate: 4.3, bounce_rate: 38.9, revenue: 6200 },
    { date: '2024-10-08', visitors: 1890, pageviews: 5678, conversion_rate: 4.8, bounce_rate: 34.2, revenue: 7100 },
    { date: '2024-10-09', visitors: 2134, pageviews: 6234, conversion_rate: 5.2, bounce_rate: 31.8, revenue: 7800 },
    { date: '2024-10-10', visitors: 2567, pageviews: 7890, conversion_rate: 5.9, bounce_rate: 28.4, revenue: 8900 }
  ] as const;

  // Chart configuration
  const chartConfig: Partial<ChartConfig> = {
    dimensions: {
      width: 600,
      height: 350,
      margin: { top: 30, right: 40, bottom: 50, left: 70 }
    },
    theme: {
      backgroundColor: '#ffffff',
      gridColor: '#f1f5f9',
      textColor: '#334155',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    },
    animationDuration: 500,
    enableAnimations: true,
    debounceMs: 150
  } as const;

  // State for interactive demo
  let selectedMetrics = $state<Set<string>>(new Set(['visitors', 'pageviews', 'conversion_rate']));
  let showAnimations = $state(true);
  let showDots = $state(true);
  let strokeWidth = $state(2);

  // Chart metrics configuration
  interface ChartMetric {
    readonly key: string;
    readonly label: string;
    readonly color: string;
    readonly description: string;
  }

  const availableMetrics: readonly ChartMetric[] = [
    { 
      key: 'visitors', 
      label: 'Unique Visitors', 
      color: '#3b82f6',
      description: 'Daily unique website visitors'
    },
    { 
      key: 'pageviews', 
      label: 'Page Views', 
      color: '#10b981',
      description: 'Total page views including repeat visits'
    },
    { 
      key: 'conversion_rate', 
      label: 'Conversion Rate (%)', 
      color: '#f59e0b',
      description: 'Percentage of visitors who completed desired actions'
    },
    { 
      key: 'bounce_rate', 
      label: 'Bounce Rate (%)', 
      color: '#ef4444',
      description: 'Percentage of single-page sessions'
    },
    { 
      key: 'revenue', 
      label: 'Daily Revenue ($)', 
      color: '#8b5cf6',
      description: 'Total daily revenue in USD'
    }
  ] as const;

  // Dynamic config based on user preferences
  const dynamicConfig = $derived.by(() => ({
    ...chartConfig,
    enableAnimations: showAnimations,
    theme: {
      ...chartConfig.theme!,
      gridColor: chartConfig.theme!.gridColor
    }
  }));

  // Event handlers
  function handlePointClick(metric: string, point: any, event: MouseEvent): void {
    console.log(`Clicked on ${metric}:`, point);
    alert(`${metric}: ${point.value} on ${point.originalData.date}`);
  }

  function handlePointHover(metric: string, point: any | null, event: MouseEvent): void {
    if (point) {
      console.log(`Hovering over ${metric}:`, point);
    }
  }

  function toggleMetric(key: string): void {
    const newSelection = new Set(selectedMetrics);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    selectedMetrics = newSelection;
  }

  function selectAllMetrics(): void {
    selectedMetrics = new Set(availableMetrics.map(m => m.key));
  }

  function clearAllMetrics(): void {
    selectedMetrics = new Set();
  }
</script>

<div class="page-container">
  <header class="page-header">
    <h1>📊 SVG Chart System Demo</h1>
    <p>Interactive, performance-optimized charts built with Svelte 5</p>
  </header>

  <!-- Chart Controls -->
  <div class="controls-section">
    <div class="control-group">
      <h3>Chart Options</h3>
      <label class="control-item">
        <input type="checkbox" bind:checked={showAnimations} />
        <span>Enable Animations</span>
      </label>
      <label class="control-item">
        <input type="checkbox" bind:checked={showDots} />
        <span>Show Data Points</span>
      </label>
      <label class="control-item">
        <span>Stroke Width:</span>
        <input 
          type="range" 
          min="1" 
          max="5" 
          bind:value={strokeWidth}
          class="range-input"
        />
        <span>{strokeWidth}px</span>
      </label>
    </div>

    <div class="control-group">
      <h3>Metrics Selection</h3>
      <div class="metric-controls">
        <button onclick={selectAllMetrics} class="control-btn">Select All</button>
        <button onclick={clearAllMetrics} class="control-btn">Clear All</button>
      </div>
      <div class="metrics-grid">
        {#each availableMetrics as metric}
          <label class="metric-item">
            <input 
              type="checkbox" 
              checked={selectedMetrics.has(metric.key)}
              onchange={() => toggleMetric(metric.key)}
            />
            <div class="metric-info">
              <div class="metric-header">
                <span class="metric-color" style="background-color: {metric.color}"></span>
                <span class="metric-label">{metric.label}</span>
              </div>
              <span class="metric-description">{metric.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>
  </div>

  <!-- Charts Display -->
  <ChartProvider data={analyticsData} config={dynamicConfig}>
    <div class="charts-section">
      <h2>📈 Analytics Charts ({selectedMetrics.size} selected)</h2>
      
      {#if selectedMetrics.size === 0}
        <div class="empty-state">
          <p>🎯 Select one or more metrics to display charts</p>
        </div>
      {:else}
        <div class="charts-grid">
          {#each availableMetrics as metric}
            {#if selectedMetrics.has(metric.key)}
              <div class="chart-card">
                <div class="chart-header">
                  <h3>{metric.label}</h3>
                  <p class="chart-description">{metric.description}</p>
                </div>
                
                <div class="chart-wrapper">
                  <LineChart
                    dataKey={metric.key}
                    color={metric.color}
                    strokeWidth={strokeWidth}
                    showDots={showDots}
                    animate={showAnimations}
                    dotRadius={4}
                    curve="linear"
                    onPointClick={(point, event) => handlePointClick(metric.key, point, event)}
                    onPointHover={(point, event) => handlePointHover(metric.key, point, event)}
                    ariaLabel={`${metric.label} trend chart showing data from ${analyticsData[0].date} to ${analyticsData[analyticsData.length - 1].date}`}
                  />
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </ChartProvider>

  <!-- Usage Examples -->
  <div class="examples-section">
    <h2>💻 Usage Examples</h2>
    
    <div class="example-card">
      <h3>Basic Usage</h3>
      <pre><code>{`<!-- Basic LineChart -->
<ChartProvider data={analyticsData}>
  <LineChart 
    dataKey="visitors" 
    color="#3b82f6" 
  />
</ChartProvider>`}</code></pre>
    </div>

    <div class="example-card">
      <h3>Advanced Configuration</h3>
      <pre><code>{`<!-- Advanced LineChart with custom config -->
<ChartProvider 
  data={analyticsData} 
  config={{
    dimensions: { width: 600, height: 350 },
    theme: { colors: ['#3b82f6', '#10b981'] },
    enableAnimations: true
  }}
>
  <LineChart
    dataKey="visitors"
    color="#3b82f6"
    strokeWidth={3}
    showDots={true}
    animate={true}
    dotRadius={5}
    curve="linear"
    onPointClick={(point, event) => console.log(point)}
    onPointHover={(point, event) => showTooltip(point)}
    ariaLabel="Visitor analytics chart"
  />
</ChartProvider>`}</code></pre>
    </div>

    <div class="example-card">
      <h3>Multiple Charts</h3>
      <pre><code>{`<!-- Multiple charts sharing the same data -->
<ChartProvider data={analyticsData}>
  <LineChart dataKey="visitors" color="#3b82f6" />
  <LineChart dataKey="pageviews" color="#10b981" />
  <LineChart dataKey="conversion_rate" color="#f59e0b" />
</ChartProvider>`}</code></pre>
    </div>

    <div class="example-card">
      <h3>Data Format</h3>
      <pre><code>{`// Your data should be an array of objects
const data = [
  { 
    date: '2024-10-01', 
    visitors: 1245, 
    pageviews: 3891, 
    conversion_rate: 3.2 
  },
  { 
    date: '2024-10-02', 
    visitors: 1389, 
    pageviews: 4234, 
    conversion_rate: 3.7 
  },
  // ... more data points
];`}</code></pre>
    </div>
  </div>

  <!-- Features -->
  <div class="features-section">
    <h2>✨ Features</h2>
    <div class="features-grid">
      <div class="feature-card">
        <h4>🚀 High Performance</h4>
        <p>Handles 10+ charts simultaneously with smooth 60fps animations</p>
      </div>
      <div class="feature-card">
        <h4>🎯 Type Safe</h4>
        <p>Built with TypeScript for complete type safety and IntelliSense</p>
      </div>
      <div class="feature-card">
        <h4>♿ Accessible</h4>
        <p>Screen reader support, keyboard navigation, and ARIA labels</p>
      </div>
      <div class="feature-card">
        <h4>📱 Responsive</h4>
        <p>Automatically adapts to different screen sizes and containers</p>
      </div>
      <div class="feature-card">
        <h4>🎨 Customizable</h4>
        <p>Flexible theming, colors, animations, and styling options</p>
      </div>
      <div class="feature-card">
        <h4>⚡ Zero Dependencies</h4>
        <p>Pure SVG with no external chart libraries required</p>
      </div>
    </div>
  </div>
</div>

<style>
  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
  }

  .page-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .page-header h1 {
    font-size: 3rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-header p {
    font-size: 1.25rem;
    color: #64748b;
    margin: 0;
  }

  .controls-section {
    background: #f8fafc;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 3rem;
    border: 1px solid #e2e8f0;
  }

  .control-group {
    margin-bottom: 2rem;
  }

  .control-group:last-child {
    margin-bottom: 0;
  }

  .control-group h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .range-input {
    margin: 0 0.5rem;
  }

  .metric-controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .control-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background 0.2s;
  }

  .control-btn:hover {
    background: #2563eb;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .metric-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .metric-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }

  .metric-info {
    flex: 1;
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .metric-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .metric-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
  }

  .metric-description {
    font-size: 0.8rem;
    color: #64748b;
  }

  .charts-section {
    margin-bottom: 3rem;
  }

  .charts-section h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 2rem 0;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #64748b;
    font-size: 1.125rem;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
    gap: 2rem;
  }

  .chart-card {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.2s;
    overflow: hidden;
  }

  .chart-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .chart-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .chart-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
  }

  .chart-description {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  .chart-wrapper {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  .examples-section,
  .features-section {
    margin-bottom: 3rem;
  }

  .examples-section h2,
  .features-section h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 2rem 0;
  }

  .example-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .example-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .example-card pre {
    margin: 0;
    padding: 1.5rem;
    background: #1e293b;
    overflow-x: auto;
  }

  .example-card code {
    color: #e2e8f0;
    font-size: 0.875rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .feature-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
  }

  .feature-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }

  .feature-card h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  @media (max-width: 768px) {
    .page-container {
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 2rem;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>