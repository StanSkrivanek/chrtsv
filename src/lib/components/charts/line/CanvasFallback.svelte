<script lang="ts">
    // Large dataset handling with automatic Canvas fallback
  import { onMount } from 'svelte';
  
  // Component props
   let lines = $state([]);
   let xKey = $state('date');
   let yKey = $state('value');
   let height = $state(400);
   let title = $state('Line Chart');
   let margin = $state({ top: 20, right: 20, bottom: 30, left: 50 });
   let chartHeight = height - margin.top - margin.bottom;
   let defaultColors = $state(['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']);

  // Configuration for performance optimization
  const PERFORMANCE_THRESHOLDS = {
    SVG_MAX_POINTS: 1000,        // Switch to Canvas above this
    ANIMATION_MAX_POINTS: 500,   // Disable animations above this
    TOOLTIP_MAX_POINTS: 2000,    // Disable individual tooltips above this
    VIRTUALIZATION_THRESHOLD: 100 // Start data virtualization above this
  };

  // Calculate total data points
  const totalDataPoints = $derived(
    lines.reduce((sum, line) => sum + line.data.length, 0)
  );

  // Performance mode determination
  const performanceMode = $derived(() => {
    if (totalDataPoints > PERFORMANCE_THRESHOLDS.SVG_MAX_POINTS) {
      return 'canvas';
    }
    if (totalDataPoints > PERFORMANCE_THRESHOLDS.ANIMATION_MAX_POINTS) {
      return 'svg-no-animation';
    }
    return 'svg-full';
  });

  // Data sampling for large datasets
  const sampledLines = $derived.by(() => {
    if (performanceMode === 'canvas' || totalDataPoints <= PERFORMANCE_THRESHOLDS.VIRTUALIZATION_THRESHOLD) {
      return lines;
    }

    // Sample data points intelligently
    return lines.map(line => {
      if (line.data.length <= PERFORMANCE_THRESHOLDS.VIRTUALIZATION_THRESHOLD) {
        return line;
      }

      // Keep first, last, and sampled middle points
      const sampleRate = Math.ceil(line.data.length / PERFORMANCE_THRESHOLDS.VIRTUALIZATION_THRESHOLD);
      const sampledData = line.data.filter((_, index) => 
        index === 0 || 
        index === line.data.length - 1 || 
        index % sampleRate === 0
      );

      return {
        ...line,
        data: sampledData
      };
    });
  });

  // Canvas-based rendering for large datasets
  let canvasElement: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D | null = null;

  function renderCanvas() {
    if (!canvasElement || !canvasContext || performanceMode !== 'canvas') return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasElement.getBoundingClientRect();
    
    // Set canvas size accounting for device pixel ratio
    canvasElement.width = rect.width * dpr;
    canvasElement.height = rect.height * dpr;
    canvasContext.scale(dpr, dpr);

    // Clear canvas
    canvasContext.clearRect(0, 0, rect.width, rect.height);

    // Draw chart using canvas API
    const chartData = calculateChartData();
    if (!chartData) return;

    // Draw axes
    drawCanvasAxes(canvasContext, chartData, rect.width, rect.height);

    // Draw lines
    sampledLines.forEach((lineData, index) => {
      const color = lineData.color || defaultColors[index % defaultColors.length];
      drawCanvasLine(canvasContext, lineData, chartData, color);
    });
  }

  function drawCanvasLine(
    ctx: CanvasRenderingContext2D,
    lineData: LineData,
    chartData: any,
    color: string
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let firstPoint = true;
    chartData.allXValues.forEach((xValue: string, xIndex: number) => {
      const dataPoint = lineData.data.find(d => String(d[xKey]) === xValue);
      if (dataPoint) {
        const x = chartData.xScale(xIndex);
        const y = chartData.yScale(Number(dataPoint[yKey]));
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });

    ctx.stroke();
  }

  function drawCanvasAxes(
    ctx: CanvasRenderingContext2D,
    chartData: any,
    width: number,
    height: number
  ) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartData.width, margin.top + chartHeight);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();

    // Draw grid and labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';

    // X-axis labels
    const tickInterval = Math.max(1, Math.ceil(chartData.allXValues.length / 7));
    for (let i = 0; i < chartData.allXValues.length; i += tickInterval) {
      const x = chartData.xScale(i);
      const label = formatDateForDisplay(chartData.allXValues[i]);
      
      ctx.textAlign = 'center';
      ctx.fillText(label, x, margin.top + chartHeight + 20);
    }

    // Y-axis labels and grid
    const yTicks = generateYTicks(chartData.yMin, chartData.yMax);
    yTicks.forEach(tickValue => {
      const y = chartData.yScale(tickValue);
      
      // Grid line
      ctx.strokeStyle = '#e2e8f0';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
  // Helper functions for rendering
  function calculateChartData() {
    // This is a simplified version - you'll need to implement the actual logic
    return {
      allXValues: lines.flatMap(line => line.data.map(d => String(d[xKey]))),
      xScale: (index) => margin.left + (index / (lines[0]?.data.length - 1 || 1)) * chartHeight,
      yScale: (value) => margin.top + chartHeight - ((value - chartData.yMin) / (chartData.yMax - chartData.yMin)) * chartHeight,
      yMin: Math.min(...lines.flatMap(line => line.data.map(d => Number(d[yKey])))),
      yMax: Math.max(...lines.flatMap(line => line.data.map(d => Number(d[yKey])))),
      width: chartHeight
    };
  }
  
  function formatDateForDisplay(dateStr) {
    return dateStr;
  }
  
  function formatYValue(value) {
    return value.toString();
  }
  
  function generateYTicks(min, max) {
    const range = max - min;
    const step = range / 5;
    return Array.from({ length: 6 }, (_, i) => min + i * step);
  }
  
  // Canvas mouse event handlers
  function handleCanvasMouseMove(event) {
  <canvas
    bind:this={canvasElement}
    class="chart-canvas"
    width="100%"
    {height}
    aria-label="Line chart: {title}"
    on:mousemove={handleCanvasMouseMove}
    on:mouseleave={handleCanvasMouseLeave}
  ></canvas>
  $effect(() => {
    if (performanceMode === 'canvas' && canvasElement) {
      canvasContext = canvasElement.getContext('2d');
      renderCanvas();
    }
  });
      ctx.textAlign = 'right';
      ctx.fillText(formatYValue(tickValue), margin.left - 10, y + 4);
    });
  }

  // Effect for canvas rendering
  $effect(() => {
    if (performanceMode === 'canvas' && canvasElement) {
      canvasContext = canvasElement.getContext('2d');
      renderCanvas();
    }
  });

  // Debounced canvas resize
  let canvasResizeTimer: number;
  function handleCanvasResize() {
    clearTimeout(canvasResizeTimer);
    canvasResizeTimer = setTimeout(renderCanvas, 100);
  }

  onMount(() => {
    if (performanceMode === 'canvas') {
      window.addEventListener('resize', handleCanvasResize);
      return () => {
        window.removeEventListener('resize', handleCanvasResize);
        clearTimeout(canvasResizeTimer);
      };
    }
  });
</script>

<!-- Conditional rendering based on performance mode -->
{#if performanceMode === 'canvas'}
	<!-- Canvas for large datasets -->
	<canvas
		bind:this={canvasElement}
		class="chart-canvas"
		width="100%"
		{height}
		role="img"
		aria-label="Line chart: {title}"
		onmousemove={handleCanvasMouseMove}
		onmouseleave={handleCanvasMouseLeave}
	></canvas>

	<!-- Canvas performance notice -->
	<div class="performance-notice">
		<small>
			Large dataset detected ({totalDataPoints.toLocaleString()} points). Using optimized Canvas rendering.
		</small>
	</div>
{:else}
	<!-- SVG for smaller datasets -->
	<svg
		bind:this={chart}
		class="multi-line-chart"
		width="100%"
		{height}
		role="img"
		aria-label="Line chart: {title}"
	>
		<!-- Your existing SVG content -->
	</svg>
{/if}

<style>
	.chart-canvas {
		width: 100%;
		cursor: crosshair;
	}

	.performance-notice {
		margin-top: 8px;
		padding: 8px 12px;
		background: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 4px;
		color: #0369a1;
		text-align: center;
	}
</style>
