<!-- =============================================================================
FILE: src/lib/charts/Dashboard.svelte (EXAMPLE USAGE)
============================================================================= -->
<script lang="ts">
    import ChartProvider from './ChartProvider.svelte';
    import LineChart from './LineChart.svelte';
    import type { ChartDataPoint, ChartConfig } from './types/chart.js';
  
    // Your analytics data (properly typed)
    const analyticsData: readonly ChartDataPoint[] = [
      { date: '2024-10-01', visitors: 1245, pageviews: 3891, conversion_rate: 3.2, bounce_rate: 42.3 },
      { date: '2024-10-02', visitors: 1389, pageviews: 4234, conversion_rate: 3.7, bounce_rate: 39.8 },
      { date: '2024-10-03', visitors: 1567, pageviews: 4891, conversion_rate: 4.1, bounce_rate: 37.2 },
      { date: '2024-10-04', visitors: 1823, pageviews: 5234, conversion_rate: 4.5, bounce_rate: 35.6 },
      { date: '2024-10-05', visitors: 1456, pageviews: 4567, conversion_rate: 3.9, bounce_rate: 41.2 },
      { date: '2024-10-06', visitors: 1234, pageviews: 3789, conversion_rate: 3.1, bounce_rate: 44.7 },
      { date: '2024-10-07', visitors: 1678, pageviews: 5123, conversion_rate: 4.3, bounce_rate: 38.9 },
      { date: '2024-10-08', visitors: 1890, pageviews: 5678, conversion_rate: 4.8, bounce_rate: 34.2 },
      { date: '2024-10-09', visitors: 2134, pageviews: 6234, conversion_rate: 5.2, bounce_rate: 31.8 },
      { date: '2024-10-10', visitors: 2567, pageviews: 7890, conversion_rate: 5.9, bounce_rate: 28.4 }
    ] as const;
  
    const chartConfig: Partial<ChartConfig> = {
      dimensions: {
        width: 500,
        height: 300,
        margin: { top: 20, right: 30, bottom: 40, left: 60 }
      },
      theme: {
        backgroundColor: '#ffffff',
        gridColor: '#f1f5f9',
        textColor: '#334155',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
      },
      animationDuration: 400,
      enableAnimations: true,
      debounceMs: 150
    } as const;
  
    interface ChartMetric {
      readonly key: string;
      readonly label: string;
      readonly color: string;
      readonly description: string;
    }
  
    const chartMetrics: readonly ChartMetric[] = [
      { 
        key: 'visitors', 
        label: 'Unique Visitors', 
        color: '#3b82f6',
        description: 'Number of unique visitors over time'
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
        description: 'Percentage of visitors who left after viewing only one page'
      }
    ] as const;
  
    // State for interactive features
    let selectedMetrics = $state<Set<string>>(new Set(['visitors', 'pageviews']));
    let showGridLines = $state(true);
    let enableAnimations = $state(true);
  
    // Computed config based on user preferences - using $derived.by for proper reactivity
    const dynamicConfig = $derived.by(() => {
      return {
        ...chartConfig,
        enableAnimations,
        theme: {
          ...chartConfig.theme!,
          gridColor: showGridLines ? chartConfig.theme!.gridColor : 'transparent'
        }
      } as Partial<ChartConfig>;
    });
  
    // Event handlers with proper error handling
    function handlePointClick(metric: string, point: any, event: MouseEvent): void {
      try {
        console.log(`Clicked on ${metric}:`, point);
        // Add your custom logic here
      } catch (error) {
        console.error('Error handling point click:', error);
      }
    }
  
    function handlePointHover(metric: string, point: any | null, event: MouseEvent): void {
      try {
        if (point) {
          console.log(`Hovering over ${metric}:`, point);
          // Add your custom logic here (e.g., show tooltip)
        }
      } catch (error) {
        console.error('Error handling point hover:', error);
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
  </script>
  
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Analytics Dashboard</h1>
      <p>Interactive charts with bulletproof TypeScript implementation</p>
    </header>
  
    <div class="dashboard-controls">
      <fieldset>
        <legend>Chart Options</legend>
        <label>
          <input type="checkbox" bind:checked={showGridLines} />
          Show Grid Lines
        </label>
        <label>
          <input type="checkbox" bind:checked={enableAnimations} />
          Enable Animations
        </label>
      </fieldset>
  
      <fieldset>
        <legend>Metrics</legend>
        {#each chartMetrics as metric}
          <label>
            <input 
              type="checkbox" 
              checked={selectedMetrics.has(metric.key)}
              onchange={() => toggleMetric(metric.key)}
            />
            <span style="color: {metric.color}">●</span>
            {metric.label}
          </label>
        {/each}
      </fieldset>
    </div>
  
    <ChartProvider data={analyticsData} config={dynamicConfig}>
      <div class="charts-grid">
        {#each chartMetrics as metric}
          {#if selectedMetrics.has(metric.key)}
            <div class="chart-container">
              <div class="chart-header">
                <h3>{metric.label}</h3>
                <p class="chart-description">{metric.description}</p>
              </div>
              
              <LineChart
                dataKey={metric.key}
                color={metric.color}
                strokeWidth={2}
                showDots={true}
                animate={enableAnimations}
                dotRadius={4}
                curve="linear"
                onPointClick={(point, event) => handlePointClick(metric.key, point, event)}
                onPointHover={(point, event) => handlePointHover(metric.key, point, event)}
                ariaLabel={`${metric.label} trend chart with ${analyticsData.length} data points`}
              />
            </div>
          {/if}
        {/each}
      </div>
    </ChartProvider>
  
    {#if selectedMetrics.size === 0}
      <div class="no-charts-message">
        <p>Select at least one metric to display charts.</p>
      </div>
    {/if}
  </div>
  
  <style>
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  
    .dashboard-header {
      margin-bottom: 2rem;
      text-align: center;
    }
  
    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }
  
    .dashboard-header p {
      font-size: 1.125rem;
      color: #64748b;
      margin: 0;
    }
  
    .dashboard-controls {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
  
    .dashboard-controls fieldset {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 1rem;
      margin: 0;
      min-width: 200px;
    }
  
    .dashboard-controls legend {
      font-weight: 600;
      color: #374151;
      padding: 0 0.5rem;
    }
  
    .dashboard-controls label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
    }
  
    .dashboard-controls label:last-child {
      margin-bottom: 0;
    }
  
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 2rem;
    }
  
    .chart-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
  
    .chart-container:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
  
    .chart-header {
      margin-bottom: 1rem;
    }
  
    .chart-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }
  
    .chart-description {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }
  
    .no-charts-message {
      text-align: center;
      padding: 3rem;
      color: #64748b;
      font-size: 1.125rem;
    }
  
    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }
  
      .dashboard-controls {
        flex-direction: column;
        gap: 1rem;
      }
  
      .charts-grid {
        grid-template-columns: 1fr;
      }
  
      .chart-container {
        padding: 1rem;
      }
    }
  </style>