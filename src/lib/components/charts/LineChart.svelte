<!-- src/lib/charts/LineChart.svelte -->
<script lang="ts">
  import { getChartContext, processLineChartData } from './ChartContext.svelte.js';
  import type { LineChartProps, ChartPoint } from './types/chart.js';

  interface Props extends LineChartProps {}

  let {
    dataKey,
    color,
    strokeWidth = 2,
    showDots = true,
    animate = true,
    dotRadius = 4,
    curve = 'linear',
    onPointClick,
    onPointHover,
    ariaLabel
  }: Props = $props();

  const chartContext = getChartContext();
  
  let svgElement: SVGSVGElement | undefined = $state();
  let chartId: string | null = $state(null);
  let isHovered = $state(false);
  let hoveredPoint: ChartPoint | null = $state(null);

  // Register this chart when element is available
  $effect(() => {
    if (svgElement && chartContext && !chartId) {
      try {
        chartId = chartContext.registerChart({
          element: svgElement,
          dataKey,
          config: {
            color,
            strokeWidth,
            showDots,
            animate,
            dotRadius,
            curve
          }
        });
      } catch (error) {
        console.error('Failed to register chart:', error);
      }
    }

    return () => {
      if (chartId && chartContext) {
        try {
          chartContext.unregisterChart(chartId);
        } catch (error) {
          console.error('Failed to unregister chart:', error);
        }
      }
    };
  });

  // Get reactive data from context using the getter
  const config = $derived.by(() => chartContext.getConfig());
  const processedDataResult = $derived.by(() => chartContext.processedData);
  const isReady = $derived.by(() => chartContext.isReady);
  const contextError = $derived.by(() => chartContext.getError());

  // ✅ FIXED: Process line-specific data using $derived.by()
  const lineData = $derived.by(() => {
    if (!processedDataResult || contextError) return null;
    
    try {
      return processLineChartData(processedDataResult, dataKey, config);
    } catch (error) {
      console.error(`Failed to process line chart data for key "${dataKey}":`, error);
      return null;
    }
  });

  // Use color from config if not provided
  const lineColor = $derived.by(() => {
    if (color) return color;
    
    const colors = config.theme.colors;
    const registeredCharts = chartContext.getRegisteredCharts();
    
    let chartIndex = 0;
    for (const [id, registration] of registeredCharts) {
      if (id === chartId) break;
      chartIndex++;
    }
    
    return colors[chartIndex % colors.length] || colors[0];
  });

  // Animation state
  let shouldAnimate = $state(false);
  
  $effect(() => {
    if (animate && lineData !== null && config.enableAnimations) {
      shouldAnimate = true;
      const timeout = setTimeout(() => {
        shouldAnimate = false;
      }, config.animationDuration);
      
      return () => clearTimeout(timeout);
    }
  });

  // Event handlers
  function handlePointClick(point: ChartPoint, event: MouseEvent): void {
    event.stopPropagation();
    try {
      onPointClick?.(point, event);
    } catch (error) {
      console.error('Error in point click handler:', error);
    }
  }

  function handlePointHover(point: ChartPoint | null, event: MouseEvent): void {
    try {
      hoveredPoint = point;
      onPointHover?.(point, event);
    } catch (error) {
      console.error('Error in point hover handler:', error);
    }
  }

  function handleMouseEnter(): void {
    isHovered = true;
  }

  function handleMouseLeave(): void {
    isHovered = false;
    hoveredPoint = null;
    onPointHover?.(null, new MouseEvent('mouseleave'));
  }

  // ✅ FIXED: Computed accessibility properties using $derived.by()
  const computedAriaLabel = $derived.by(() => {
    if (ariaLabel) return ariaLabel;
    const dataCount = lineData?.points.length || 0;  // Now lineData is actual data, not function
    return `Line chart showing ${dataKey} data with ${dataCount} data points`;
  });

  // ✅ FIXED: Validate required data using $derived.by()
  const hasValidData = $derived.by(() => {
    return isReady && lineData !== null && lineData.points.length > 0;  // Now works correctly
  });
</script>

{#if contextError}
  <div class="chart-error" role="alert">
    <p>Failed to load chart: {contextError.message}</p>
  </div>
{:else if !hasValidData}
  <div class="chart-loading" aria-live="polite">
    <p>Loading chart data...</p>
  </div>
{:else}
  <svg
    bind:this={svgElement}
    width={config.dimensions.width}
    height={config.dimensions.height}
    class="line-chart"
    class:animated={shouldAnimate}
    class:hovered={isHovered}
    role="img"
    aria-label={computedAriaLabel}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <defs>
      <!-- Gradient for enhanced visuals -->
      <linearGradient id="line-gradient-{chartId}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:{lineColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:{lineColor};stop-opacity:0.8" />
      </linearGradient>
      
      <!-- Drop shadow filter -->
      <filter id="drop-shadow-{chartId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
      </filter>

      {#if shouldAnimate}
        <style>
          .animated-path-{chartId} {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: drawPath-{chartId} {config.animationDuration}ms ease-out forwards;
          }
          
          @keyframes drawPath-{chartId} {
            to {
              stroke-dashoffset: 0;
            }
          }
          
          .animated-dot-{chartId} {
            opacity: 0;
            transform: scale(0);
            animation: fadeInDot-{chartId} {config.animationDuration}ms ease-out forwards;
          }
          
          @keyframes fadeInDot-{chartId} {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        </style>
      {/if}
    </defs>

    <!-- Grid lines -->
    <g class="grid" stroke={config.theme.gridColor} stroke-width="1" opacity="0.7">
      <!-- Horizontal grid lines -->
      {#each Array(5) as _, i}
        {@const y = config.dimensions.margin.top + (i / 4) * (config.dimensions.height - config.dimensions.margin.top - config.dimensions.margin.bottom)}
        <line
          x1={config.dimensions.margin.left}
          y1={y}
          x2={config.dimensions.width - config.dimensions.margin.right}
          y2={y}
          class="grid-line horizontal"
        />
      {/each}
      
      <!-- Vertical grid lines -->
      {#each Array(6) as _, i}
        {@const x = config.dimensions.margin.left + (i / 5) * (config.dimensions.width - config.dimensions.margin.left - config.dimensions.margin.right)}
        <line
          x1={x}
          y1={config.dimensions.margin.top}
          x2={x}
          y2={config.dimensions.height - config.dimensions.margin.bottom}
          class="grid-line vertical"
        />
      {/each}
    </g>

    <!-- Main line path -->
    {#if lineData?.pathData}
      <path
        d={lineData.pathData}
        fill="none"
        stroke={lineColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
        class="line-path"
        class:animated-path-{chartId}={shouldAnimate}
        filter={isHovered ? `url(#drop-shadow-${chartId})` : undefined}
      />
    {/if}

    <!-- Data points -->
    {#if showDots && lineData?.points}
      {#each lineData.points as point, i}
        {@const isPointHovered = hoveredPoint === point}
        <circle
          cx={point.x}
          cy={point.y}
          r={isPointHovered ? dotRadius * 1.5 : dotRadius}
          fill={lineColor}
          stroke="white"
          stroke-width="2"
          class="data-point"
          class:animated-dot-{chartId}={shouldAnimate}
          class:hovered={isPointHovered}
          style={shouldAnimate ? `animation-delay: ${i * 50}ms` : ''}
          onclick={(e) => handlePointClick(point, e)}
          onmouseenter={(e) => handlePointHover(point, e)}
          onmouseleave={(e) => handlePointHover(null, e)}
          role="button"
          tabindex="0"
          aria-label={`Data point: ${point.value} at position ${i + 1}`}
        >
          <title>{dataKey}: {point.value}</title>
        </circle>
      {/each}
    {/if}

    <!-- Hover line indicator -->
    {#if hoveredPoint}
      <line
        x1={hoveredPoint.x}
        y1={config.dimensions.margin.top}
        x2={hoveredPoint.x}
        y2={config.dimensions.height - config.dimensions.margin.bottom}
        stroke={lineColor}
        stroke-width="1"
        stroke-dasharray="4,4"
        opacity="0.5"
        class="hover-line"
      />
    {/if}

    <!-- Screen reader accessible data table -->
    <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
      <div style="position: absolute; left: -10000px;">
        <table>
          <caption>Chart data for {dataKey}</caption>
          <thead>
            <tr>
              <th>Position</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {#if lineData?.points}
              {#each lineData.points as point, i}
                <tr>
                  <td>{i + 1}</td>
                  <td>{point.value}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </foreignObject>
  </svg>
{/if}

<style>
  .line-chart {
    transition: all 0.2s ease;
    overflow: visible;
  }

  .line-chart.hovered {
    filter: brightness(1.05);
  }

  .line-path {
    transition: stroke-width 0.2s ease, filter 0.2s ease;
  }

  .line-chart.hovered .line-path {
    stroke-width: calc(var(--stroke-width, 2) + 1);
  }

  .data-point {
    cursor: pointer;
    transition: all 0.2s ease;
    transform-origin: center;
  }

  .data-point:hover,
  .data-point.hovered {
    filter: brightness(1.1);
    transform: scale(1.2);
  }

  .data-point:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .grid-line {
    transition: opacity 0.2s ease;
  }

  .line-chart:hover .grid-line {
    opacity: 0.9;
  }

  .hover-line {
    pointer-events: none;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 0.5; }
  }

  .chart-error,
  .chart-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: #6b7280;
  }

  .chart-error {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #991b1b;
  }
</style>