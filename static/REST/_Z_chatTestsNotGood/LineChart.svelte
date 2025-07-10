<!-- src/lib/charts/LineChart.svelte -->
<script lang="ts">
  import { getChartContext, processLineChartData } from './ChartContext.svelte.js';
  import type { LineChartProps, ChartPoint } from './types/chart.js';
  import { fade, scale } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  interface Props extends LineChartProps {
    // Enhanced props for comprehensive chart
    showLegend?: boolean;
    showTooltip?: boolean;
    showCrosshair?: boolean;
    showGrid?: boolean;
    showTicks?: boolean;
    showValues?: boolean;
    xTickCount?: number;
    yTickCount?: number;
    title?: string;
    xLabel?: string;
    yLabel?: string;
    dateFormat?: string;
    valueFormat?: (value: number) => string;
    height?: number;
    tension?: number;
    pointRadius?: number;
    animations?: boolean;
    onPointClick?: (point: ChartPoint, event: MouseEvent) => void;
  }

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
    ariaLabel,
    // Enhanced props
    showLegend = false,
    showTooltip = true,
    showCrosshair = false,
    showGrid = true,
    showTicks = true,
    showValues = false,
    xTickCount = 6,
    yTickCount = 5,
    title = '',
    xLabel = '',
    yLabel = '',
    dateFormat = 'MMM dd',
    valueFormat = (value: number) => {
      if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
      return value.toFixed(1);
    },
    height = 400,
    tension = 0.3,
    pointRadius = 4,
    animations = true
  }: Props = $props();

  const chartContext = getChartContext();
  
  let svgElement: SVGSVGElement | undefined = $state();
  let chartContainer: HTMLDivElement | undefined = $state();
  let chartId: string | null = $state(null);
  let isHovered = $state(false);
  let hoveredPoint: ChartPoint | null = $state(null);
  let mounted = $state(false);
  let width = $state(0);
  let chartHeight = $state(0);
  
  // Tooltip state
  let tooltipVisible = $state(false);
  let tooltipData = $state<{
    x: number;
    y: number;
    value: string;
    label: string;
    color: string;
  } | null>(null);
  
  // Crosshair state
  let crosshairVisible = $state(false);
  let crosshairData = $state<{
    x: number;
    y: number;
    xLabel: string;
    values: Array<{ label: string; value: string; color: string; y: number }>;
  } | null>(null);
  let mouseX = $state(0);
  let mouseY = $state(0);

  // Chart dimensions
  const margin = { top: title ? 40 : 20, right: 30, bottom: xLabel ? 60 : 40, left: yLabel ? 80 : 60 };

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

  // Get reactive data from context
  const config = $derived.by(() => chartContext.getConfig());
  const processedDataResult = $derived.by(() => chartContext.processedData);
  const isReady = $derived.by(() => chartContext.isReady);
  const contextError = $derived.by(() => chartContext.getError());

  // Process line-specific data
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

  // Calculate scales and domains
  const scales = $derived.by(() => {
    if (!lineData || !processedDataResult) return null;
    
    const { scaledData, yScale } = processedDataResult;
    const chartWidth = width - margin.left - margin.right;
    const chartHeightCalc = height - margin.top - margin.bottom;
    
    // X scale - evenly distribute points
    const xScale = (index: number) => 
      margin.left + (index / Math.max(1, scaledData.length - 1)) * chartWidth;
    
    // Get Y domain for this specific data key
    const yValues = scaledData.map(d => d[dataKey]).filter(v => typeof v === 'number') as number[];
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yPadding = (yMax - yMin) * 0.1 || 1;
    const yDomain = [yMin - yPadding, yMax + yPadding];
    
    const customYScale = (value: number) => 
      margin.top + chartHeightCalc - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartHeightCalc;
    
    return { xScale, yScale: customYScale, yDomain, chartWidth, chartHeight: chartHeightCalc };
  });

  // Generate tick values
  const ticks = $derived.by(() => {
    if (!scales || !lineData) return { xTicks: [], yTicks: [] };
    
    const { yDomain } = scales;
    const { scaledData } = processedDataResult!;
    
    // X ticks
    const xTicks = [];
    const tickInterval = Math.max(1, Math.floor(scaledData.length / xTickCount));
    for (let i = 0; i < scaledData.length; i += tickInterval) {
      const point = scaledData[i];
      xTicks.push({
        index: i,
        x: scales.xScale(i),
        label: formatXValue(point[Object.keys(point)[0]]) // Use first key as x value
      });
    }
    
    // Y ticks
    const yTicks = [];
    for (let i = 0; i <= yTickCount; i++) {
      const value = yDomain[0] + (i / yTickCount) * (yDomain[1] - yDomain[0]);
      yTicks.push({
        value,
        y: scales.yScale(value),
        label: valueFormat(value)
      });
    }
    
    return { xTicks, yTicks };
  });

  // Animation state
  let shouldAnimate = $state(false);
  
  $effect(() => {
    if (animate && animations && lineData !== null && config.enableAnimations) {
      shouldAnimate = true;
      const timeout = setTimeout(() => {
        shouldAnimate = false;
      }, config.animationDuration);
      
      return () => clearTimeout(timeout);
    }
  });

  // Mount effect for resize handling
  $effect(() => {
    if (chartContainer && typeof window !== 'undefined') {
      mounted = true;
      
      const resizeObserver = new ResizeObserver(() => {
        if (chartContainer) {
          width = chartContainer.clientWidth;
          chartHeight = height - margin.top - margin.bottom;
        }
      });
      
      resizeObserver.observe(chartContainer);
      
      // Initial size
      width = chartContainer.clientWidth;
      chartHeight = height - margin.top - margin.bottom;
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  });
  // Event handlers
  function handlePointClick(point: ChartPoint, event: MouseEvent | KeyboardEvent): void {
    event.stopPropagation();
    try {
      if (event instanceof MouseEvent) {
        onPointClick?.(point, event);
      } else {
        // Create a synthetic MouseEvent for keyboard interactions
        const syntheticEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        onPointClick?.(point, syntheticEvent);
      }
    } catch (error) {
      console.error('Error in point click handler:', error);
    }
  }


  function handlePointHover(point: ChartPoint | null, event: MouseEvent): void {
    try {
      hoveredPoint = point;
      onPointHover?.(point, event);
      
      if (point && showTooltip && !showCrosshair) {
        tooltipData = {
          x: point.x,
          y: point.y,
          value: valueFormat(point.value),
          label: dataKey,
          color: lineColor
        };
        tooltipVisible = true;
      } else if (!showCrosshair) {
        tooltipVisible = false;
      }
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
    tooltipVisible = false;
    crosshairVisible = false;
    onPointHover?.(null, new MouseEvent('mouseleave'));
  }

  function handleMouseMove(event: MouseEvent): void {
    if (!showCrosshair || !scales || !lineData || !chartContainer) return;
    
    const rect = chartContainer.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    
    // Find nearest data point
    const { scaledData } = processedDataResult!;
    let nearestIndex = 0;
    let minDistance = Infinity;
    
    scaledData.forEach((_, index) => {
      const x = scales.xScale(index);
      const distance = Math.abs(mouseX - x);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
    
    const snapX = scales.xScale(nearestIndex);
    const dataPoint = scaledData[nearestIndex];
    const value = dataPoint[dataKey] as number;
    const snapY = scales.yScale(value);
    
    crosshairData = {
      x: snapX,
      y: snapY,
      xLabel: formatXValue(dataPoint[Object.keys(dataPoint)[0]]),
      values: [{
        label: dataKey,
        value: valueFormat(value),
        color: lineColor,
        y: snapY
      }]
    };
    
    crosshairVisible = true;
  }

  // Utility functions
  function formatXValue(value: any): string {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    return String(value);
  }

  // Computed accessibility properties
  const computedAriaLabel = $derived.by(() => {
    if (ariaLabel) return ariaLabel;
    const dataCount = lineData?.points.length || 0;
    return `Line chart showing ${dataKey} data with ${dataCount} data points`;
  });

  // Validate required data
  const hasValidData = $derived.by(() => {
    return isReady && lineData !== null && lineData.points.length > 0;
  });

  // Path generation for smooth curves
  function createSmoothPath(points: Array<{ x: number; y: number }>): string {
    if (points.length < 2) return '';
    
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }
    
    const path = [`M ${points[0].x} ${points[0].y}`];
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const prev = i > 0 ? points[i - 1] : current;
      const afterNext = i < points.length - 2 ? points[i + 2] : next;
      
      const cp1x = current.x + (next.x - prev.x) * tension * 0.5;
      const cp1y = current.y + (next.y - prev.y) * tension * 0.5;
      const cp2x = next.x - (afterNext.x - current.x) * tension * 0.5;
      const cp2y = next.y - (afterNext.y - current.y) * tension * 0.5;
      
      path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`);
    }
    
    return path.join(' ');
  }
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
  <div 
    class="chart-container" 
    bind:this={chartContainer}
    onmousemove={handleMouseMove}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    role="group"
    aria-label="Interactive chart container"
  >
    <!-- Chart Title -->
    {#if title}
      <h3 class="chart-title">{title}</h3>
    {/if}
    
    <svg
      bind:this={svgElement}
      width="100%"
      {height}
      class="line-chart"
      class:animated={shouldAnimate}
      class:hovered={isHovered}
      role="img"
      aria-label={computedAriaLabel}
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
      {#if showGrid && scales && ticks}
        <g class="grid" stroke={config.theme.gridColor} stroke-width="1" opacity="0.7">
          <!-- Horizontal grid lines -->
          {#each ticks.yTicks as tick}
            <line
              x1={margin.left}
              y1={tick.y}
              x2={margin.left + scales.chartWidth}
              y2={tick.y}
              class="grid-line horizontal"
            />
          {/each}
          
          <!-- Vertical grid lines -->
          {#each ticks.xTicks as tick}
            <line
              x1={tick.x}
              y1={margin.top}
              x2={tick.x}
              y2={margin.top + scales.chartHeight}
              class="grid-line vertical"
            />
          {/each}
        </g>
      {/if}

      <!-- Axes -->
      {#if showTicks && scales && ticks}
        <!-- X Axis -->
        <g class="x-axis">
          <line
            x1={margin.left}
            y1={margin.top + scales.chartHeight}
            x2={margin.left + scales.chartWidth}
            y2={margin.top + scales.chartHeight}
            stroke="#94a3b8"
            stroke-width="2"
          />
          
          {#each ticks.xTicks as tick}
            <g transform="translate({tick.x}, {margin.top + scales.chartHeight})">
              <line y2="6" stroke="#94a3b8" stroke-width="1" />
              <text y="20" text-anchor="middle" fill="#64748b" font-size="12px">
                {tick.label}
              </text>
            </g>
          {/each}
          
          {#if xLabel}
            <text
              x={margin.left + scales.chartWidth / 2}
              y={height - 10}
              text-anchor="middle"
              fill="#374151"
              font-size="14px"
              font-weight="600"
            >
              {xLabel}
            </text>
          {/if}
        </g>

        <!-- Y Axis -->
        <g class="y-axis">
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + scales.chartHeight}
            stroke="#94a3b8"
            stroke-width="2"
          />
          
          {#each ticks.yTicks as tick}
            <g transform="translate({margin.left}, {tick.y})">
              <line x2="-6" stroke="#94a3b8" stroke-width="1" />
              <text x="-10" y="4" text-anchor="end" fill="#64748b" font-size="12px">
                {tick.label}
              </text>
            </g>
          {/each}
          
          {#if yLabel}
            <text
              x={15}
              y={margin.top + scales.chartHeight / 2}
              text-anchor="middle"
              fill="#374151"
              font-size="14px"
              font-weight="600"
              transform="rotate(-90, 15, {margin.top + scales.chartHeight / 2})"
            >
              {yLabel}
            </text>
          {/if}
        </g>
      {/if}

      <!-- Main line path -->
      {#if lineData?.pathData && scales}
        {@const points = lineData.points.map(p => ({ x: p.x, y: p.y }))}
        {@const pathData = curve === 'smooth' ? createSmoothPath(points) : lineData.pathData}
        
        <path
          d={pathData}
          fill="none"
          stroke={lineColor}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
          class:animated-path-{chartId}={shouldAnimate}
        />
        
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
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePointClick(point, e); } }}
              role="button"
              tabindex="0"
              aria-label={`Data point: ${point.value} at position ${i + 1}`}
            >
              <title>{dataKey}: {point.value}</title>
            </circle>
          {/each}
        {/if}
      {/if}

      <!-- Value labels -->
      {#if showValues && lineData?.points}
        {#each lineData.points as point, i}
          <text
            x={point.x}
            y={point.y - 10}
            text-anchor="middle"
            fill={lineColor}
            font-size="11px"
            font-weight="600"
            class="value-label"
            class:animated-dot-{chartId}={shouldAnimate}
            style={shouldAnimate ? `animation-delay: ${i * 50 + 100}ms` : ''}
          >
            {valueFormat(point.value)}
          </text>
        {/each}
      {/if}

      <!-- Crosshair -->
      {#if showCrosshair && crosshairVisible && crosshairData}
        <g class="crosshair" opacity="0.8">
          <!-- Vertical line -->
          <line
            x1={crosshairData.x}
            y1={margin.top}
            x2={crosshairData.x}
            y2={margin.top + (scales?.chartHeight || 0)}
            stroke="#6b7280"
            stroke-width="1"
            stroke-dasharray="4,4"
          />
          
          <!-- Horizontal line -->
          <line
            x1={margin.left}
            y1={crosshairData.y}
            x2={margin.left + (scales?.chartWidth || 0)}
            y2={crosshairData.y}
            stroke="#6b7280"
            stroke-width="1"
            stroke-dasharray="4,4"
          />
          
          <!-- Crosshair point -->
          <circle
            cx={crosshairData.x}
            cy={crosshairData.y}
            r="4"
            fill={lineColor}
            stroke="white"
            stroke-width="2"
          />
        </g>
      {/if}
    </svg>

    <!-- Tooltip -->
    {#if showTooltip && tooltipVisible && tooltipData && !showCrosshair}
      {@const tooltipX = tooltipData.x}
      {@const tooltipY = tooltipData.y - 20}
      {@const shouldFlipX = tooltipX > width - 120}
      {@const shouldFlipY = tooltipY < 80}
      <div
        class="tooltip"
        style="left: {tooltipX}px; top: {shouldFlipY ? tooltipY + 40 : tooltipY}px; transform: translate({shouldFlipX ? '-100%' : '-50%'}, {shouldFlipY ? '10px' : '-100%'});"
        role="tooltip"
        aria-live="polite"
        transition:fade={{ duration: 200 }}
      >
        <div class="tooltip-content">
          <div class="tooltip-header">{tooltipData.label}</div>
          <div class="tooltip-value" style="color: {tooltipData.color}">
            {tooltipData.value}
          </div>
        </div>
      </div>
    {/if}

    <!-- Crosshair Tooltip -->
    {#if showCrosshair && showTooltip && crosshairVisible && crosshairData}
      {@const tooltipX = crosshairData.x}
      {@const tooltipY = crosshairData.y - 20}
      {@const shouldFlipX = tooltipX > width - 120}
      {@const shouldFlipY = tooltipY < 80}
      <div
        class="crosshair-tooltip"
        style="left: {tooltipX}px; top: {shouldFlipY ? tooltipY + 40 : tooltipY}px; transform: translate({shouldFlipX ? '-100%' : '-50%'}, {shouldFlipY ? '10px' : '-100%'});"
        role="tooltip"
        aria-live="polite"
        transition:fade={{ duration: 200 }}
      >
        <div class="tooltip-content">
          <div class="tooltip-header">{crosshairData.xLabel}</div>
          {#each crosshairData.values as valueData}
            <div class="tooltip-value-row">
              <div class="tooltip-color" style="background-color: {valueData.color}"></div>
              <span class="tooltip-label">{valueData.label}:</span>
              <span class="tooltip-value">{valueData.value}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .chart-container {
    width: 100%;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .chart-title {
    text-align: center;
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }

  .line-chart {
    width: 100%;
    transition: all 0.2s ease;
    overflow: visible;
  }

  .line-chart.hovered {
    filter: brightness(1.05);
  }

  .line-path {
    transition: stroke-width 0.2s ease, filter 0.2s ease;
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

  .value-label {
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .crosshair {
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  /* Tooltip Styles */
  .tooltip,
  .crosshair-tooltip {
    position: absolute;
    pointer-events: none;
    z-index: 20;
    max-width: 240px;
  }

  .tooltip-content {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tooltip-header {
    font-weight: 600;
    margin-bottom: 4px;
    text-align: center;
  }

  .tooltip-value {
    font-weight: 700;
    font-size: 14px;
    text-align: center;
  }

  .tooltip-value-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 2px 0;
  }

  .tooltip-color {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tooltip-label {
    flex: 1;
    font-size: 11px;
  }

  .tooltip-value {
    font-weight: 600;
    font-size: 12px;
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

  /* Responsive */
  @media (max-width: 768px) {
    .chart-title {
      font-size: 16px;
    }
    
    .tooltip-content {
      font-size: 11px;
    }
  }
</style>