<script lang="ts">
  import { createChartContext } from './ChartContext.svelte.js';
  import type { ChartDataPoint, ChartConfig } from './types/chart.js';

  interface Props {
    data?: readonly ChartDataPoint[];
    config?: Partial<ChartConfig>;
    children: import('svelte').Snippet;
  }

  let { data = [], config = {}, children }: Props = $props();

  const chartContext = createChartContext(data, config);

  // Update context when props change
  $effect(() => {
    try {
      chartContext.setData(data);
    } catch (error) {
      console.error('Failed to update chart data:', error);
    }
  });

  $effect(() => {
    try {
      chartContext.updateConfig(config);
    } catch (error) {
      console.error('Failed to update chart config:', error);
    }
  });

  // Cleanup on unmount
  $effect(() => {
    return () => {
      chartContext.destroy();
    };
  });

  // Error boundary for debugging
  const error = $derived(chartContext.getError());
  
  $effect(() => {
    if (error) {
      console.error('Chart context error:', error);
    }
  });
</script>

{#if error}
  <div class="chart-error" role="alert">
    <h3>Chart Error</h3>
    <p>{error.message}</p>
    <details>
      <summary>Technical Details</summary>
      <pre>{error.stack}</pre>
    </details>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .chart-error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    padding: 1rem;
    margin: 1rem 0;
    color: #991b1b;
  }

  .chart-error h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .chart-error p {
    margin: 0 0 0.5rem 0;
  }

  .chart-error details {
    margin-top: 0.5rem;
  }

  .chart-error pre {
    background: #fef2f2;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre-wrap;
  }
</style>