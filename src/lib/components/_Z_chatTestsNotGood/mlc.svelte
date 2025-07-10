<!-- MultiLineChart.svelte -->
<script lang="ts">
    // Props with default values using Svelte 5 $props rune
    let { 
      data = [], 
      selectedMetrics = ['visitors', 'pageviews'], 
      width = 800, 
      height = 400,
      showTooltip = true,
      showDots = true,
      title = ''
    } = $props();
  
    // Metrics configuration
    const metrics = {
      visitors: { label: 'Visitors', color: '#3b82f6', scale: 'main' },
      pageviews: { label: 'Page Views', color: '#10b981', scale: 'main' },
      sessions: { label: 'Sessions', color: '#f59e0b', scale: 'main' },
      bounce_rate: { label: 'Bounce Rate (%)', color: '#ef4444', scale: 'percent' },
      conversion_rate: { label: 'Conversion Rate (%)', color: '#8b5cf6', scale: 'percent' }
    };
  
    // Chart dimensions
    const margin = { top: 20, right: 80, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
  
    // Reactive state using $state rune
    let hoveredPoint = $state(null);
    let mousePosition = $state({ x: 0, y: 0 });
  
    // Derived scales using $derived rune
    const scales = $derived(() => {
      if (!data.length) return { x: [], main: {}, percent: {} };
  
      // X scale (evenly distributed across chart width)
      const xScale = data.map((_, i) => (i / (data.length - 1)) * chartWidth);
  
      // Get values for main scale (visitors, pageviews, sessions)
      const mainValues = data.flatMap(d => 
        selectedMetrics
          .filter((key): key is keyof typeof metrics => key in metrics && metrics[key]?.scale === 'main')
          .map(key => d[key])
      ).filter(v => v !== undefined);
  
      // Get values for percent scale (rates)
      const percentValues = data.flatMap(d => 
        selectedMetrics
          .filter((key): key is keyof typeof metrics => key in metrics && metrics[key]?.scale === 'percent')
          .map(key => d[key])
      ).filter(v => v !== undefined);
  
      // Calculate main scale
      const mainMin = mainValues.length ? Math.min(...mainValues, 0) : 0;
      const mainMax = mainValues.length ? Math.max(...mainValues) : 1000;
      const mainPadding = (mainMax - mainMin) * 0.1;
  
      // Calculate percent scale  
      const percentMin = percentValues.length ? Math.min(...percentValues, 0) : 0;
      const percentMax = percentValues.length ? Math.max(...percentValues) : 100;
      const percentPadding = (percentMax - percentMin) * 0.1;
  
      return {
        x: xScale,
        main: {
          min: mainMin - mainPadding,
          max: mainMax + mainPadding,
          scale: (value) => chartHeight - ((value - (mainMin - mainPadding)) / (mainMax + mainPadding - (mainMin - mainPadding))) * chartHeight
        },
        percent: {
          min: percentMin - percentPadding,
          max: percentMax + percentPadding,
          scale: (value) => chartHeight - ((value - (percentMin - percentPadding)) / (percentMax + percentPadding - (percentMin - percentPadding))) * chartHeight
        }
      };
    });
  
    // Derived line paths
    const linePaths = $derived(() => {
      if (!data.length || !scales.x.length) return {};
  
      const paths = {};
      
      selectedMetrics.forEach(metricKey => {
        const metric = metrics[metricKey];
        if (!metric) return;
  
        const scaleType = metric.scale;
        const yScale = scales[scaleType]?.scale;
        if (!yScale) return;
  
        const points = data.map((d, i) => ({
          x: scales.x[i],
          y: yScale(d[metricKey])
        })).filter(p => !isNaN(p.y));
  
        if (points.length > 1) {
          paths[metricKey] = `M ${points[0].x},${points[0].y} ` + 
            points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
        }
      });
  
      return paths;
    });
  
    // Derived tick marks for X axis
    const xTicks = $derived(() => {
      if (!data.length) return [];
      const step = Math.max(1, Math.floor(data.length / 6));
      return data.filter((_, i) => i % step === 0).map((d, i) => ({
        x: scales.x[i * step],
        label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    });
  
    // Derived tick marks for Y axes
    const yTicks = $derived(() => {
      const ticks = [];
      
      // Main scale ticks (left axis)
      if (selectedMetrics.some(key => metrics[key]?.scale === 'main')) {
        const { min, max } = scales.main;
        const step = (max - min) / 5;
        for (let i = 0; i <= 5; i++) {
          const value = min + (step * i);
          ticks.push({
            type: 'main',
            y: scales.main.scale(value),
            label: formatNumber(value),
            side: 'left'
          });
        }
      }
  
      // Percent scale ticks (right axis)
      if (selectedMetrics.some(key => metrics[key]?.scale === 'percent')) {
        const { min, max } = scales.percent;
        const step = (max - min) / 5;
        for (let i = 0; i <= 5; i++) {
          const value = min + (step * i);
          ticks.push({
            type: 'percent',
            y: scales.percent.scale(value),
            label: `${value.toFixed(1)}%`,
            side: 'right'
          });
        }
      }
  
      return ticks;
    });
  
    // Format numbers for display
    function formatNumber(num) {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return Math.round(num).toString();
    }
  
    // Handle mouse events
    function handleMouseMove(event) {
      if (!showTooltip) return;
  
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left - margin.left;
      const y = event.clientY - rect.top - margin.top;
  
      // Find closest data point
      let closestIndex = 0;
      let minDistance = Infinity;
  
      scales.x.forEach((xPos, i) => {
        const distance = Math.abs(x - xPos);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      });
  
      if (minDistance < 50) { // Only show tooltip if mouse is close enough
        hoveredPoint = {
          index: closestIndex,
          data: data[closestIndex],
          x: scales.x[closestIndex],
          metrics: selectedMetrics.map(key => ({
            key,
            ...metrics[key],
            value: data[closestIndex][key]
          }))
        };
        mousePosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      } else {
        hoveredPoint = null;
      }
    }
  
    function handleMouseLeave() {
      hoveredPoint = null;
    }
  </script>
  
  <div class="chart-container">
    {#if title}
      <h3 class="chart-title">{title}</h3>
    {/if}
    
    <svg 
      {width} 
      {height} 
      onmousemove={handleMouseMove}
      onmouseleave={handleMouseLeave}
    >
      <!-- Chart background -->
      <rect 
        x={margin.left} 
        y={margin.top} 
        width={chartWidth} 
        height={chartHeight} 
        fill="white" 
        stroke="#e5e7eb" 
      />
  
      <!-- Grid lines -->
      {#each yTicks as tick}
        <line
          x1={margin.left}
          y1={margin.top + tick.y}
          x2={margin.left + chartWidth}
          y2={margin.top + tick.y}
          stroke="#f3f4f6"
          stroke-width="1"
        />
      {/each}
  
      {#each xTicks as tick}
        <line
          x1={margin.left + tick.x}
          y1={margin.top}
          x2={margin.left + tick.x}
          y2={margin.top + chartHeight}
          stroke="#f3f4f6"
          stroke-width="1"
        />
      {/each}
  
      <!-- Y axis ticks and labels -->
      {#each yTicks as tick}
        <line
          x1={tick.side === 'left' ? margin.left - 5 : margin.left + chartWidth}
          y1={margin.top + tick.y}
          x2={tick.side === 'left' ? margin.left : margin.left + chartWidth + 5}
          y2={margin.top + tick.y}
          stroke="#6b7280"
          stroke-width="1"
        />
        <text
          x={tick.side === 'left' ? margin.left - 10 : margin.left + chartWidth + 10}
          y={margin.top + tick.y + 4}
          text-anchor={tick.side === 'left' ? 'end' : 'start'}
          fill="#6b7280"
          font-size="12"
        >
          {tick.label}
        </text>
      {/each}
  
      <!-- X axis ticks and labels -->
      {#each xTicks as tick}
        <line
          x1={margin.left + tick.x}
          y1={margin.top + chartHeight}
          x2={margin.left + tick.x}
          y2={margin.top + chartHeight + 5}
          stroke="#6b7280"
          stroke-width="1"
        />
        <text
          x={margin.left + tick.x}
          y={margin.top + chartHeight + 20}
          text-anchor="middle"
          fill="#6b7280"
          font-size="12"
        >
          {tick.label}
        </text>
      {/each}
  
      <!-- Data lines -->
      {#each selectedMetrics as metricKey}
        {#if linePaths[metricKey] && metrics[metricKey]}
          <path
            d={linePaths[metricKey]}
            fill="none"
            stroke={metrics[metricKey].color}
            stroke-width="2"
            transform="translate({margin.left}, {margin.top})"
          />
        {/if}
      {/each}
  
      <!-- Data points -->
      {#if showDots}
        {#each selectedMetrics as metricKey}
          {#if metrics[metricKey]}
            {#each data as point, i}
              {@const metric = metrics[metricKey]}
              {@const scaleType = metric.scale}
              {@const yScale = scales[scaleType]?.scale}
              {#if yScale && point[metricKey] !== undefined}
                <circle
                  cx={margin.left + scales.x[i]}
                  cy={margin.top + yScale(point[metricKey])}
                  r="3"
                  fill={metric.color}
                  stroke="white"
                  stroke-width="1"
                />
              {/if}
            {/each}
          {/if}
        {/each}
      {/if}
  
      <!-- Hover indicator line -->
      {#if hoveredPoint}
        <line
          x1={margin.left + hoveredPoint.x}
          y1={margin.top}
          x2={margin.left + hoveredPoint.x}
          y2={margin.top + chartHeight}
          stroke="#6b7280"
          stroke-width="1"
          stroke-dasharray="4,4"
          opacity="0.7"
        />
      {/if}
    </svg>
  
    <!-- Tooltip -->
    {#if hoveredPoint && showTooltip}
      <div 
        class="tooltip"
        style="left: {mousePosition.x + 10}px; top: {mousePosition.y - 10}px;"
      >
        <div class="tooltip-date">
          {new Date(hoveredPoint.data.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        {#each hoveredPoint.metrics as metric}
          <div class="tooltip-metric">
            <span 
              class="tooltip-color" 
              style="background-color: {metric.color};"
            ></span>
            <span class="tooltip-label">{metric.label}:</span>
            <span class="tooltip-value">
              {metric.scale === 'percent' ? `${metric.value}%` : formatNumber(metric.value)}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  
    <!-- Legend -->
    <div class="legend">
      {#each selectedMetrics as metricKey}
        {#if metrics[metricKey]}
          {@const metric = metrics[metricKey]}
          <div class="legend-item">
            <span class="legend-color" style="background-color: {metric.color};"></span>
            <span class="legend-label">{metric.label}</span>
          </div>
        {/if}
      {/each}
    </div>
  </div>
  
  <style>
    .chart-container {
      position: relative;
      display: inline-block;
      background: white;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  
    .chart-title {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      text-align: center;
    }
  
    .tooltip {
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      min-width: 120px;
    }
  
    .tooltip-date {
      font-weight: 600;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
  
    .tooltip-metric {
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
    }
  
    .tooltip-value {
      font-weight: 600;
      text-align: right;
    }
  
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
  
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #374151;
    }
  
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  
    .legend-label {
      font-weight: 500;
    }
  </style>