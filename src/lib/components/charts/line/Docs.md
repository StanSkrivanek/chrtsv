# Optimized Multi-Line Chart Component

A high-performance, accessible, and feature-rich multi-line chart component for Svelte 5 applications. Built with performance optimization for datasets ranging from small to enterprise-scale (10k+ points).

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Performance Configuration](#performance-configuration)
- [Data Formats](#data-formats)
- [Styling & Theming](#styling--theming)
- [Accessibility](#accessibility)
- [Performance Optimization](#performance-optimization)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **Multi-line visualization** with unlimited data series
- **Automatic performance optimization** (SVG ↔ Canvas switching)
- **Responsive design** with mobile optimization
- **Interactive tooltips** (single point & crosshair modes)
- **Smooth animations** with configurable easing
- **Date/time support** with flexible parsing
- **Negative value handling** with zero-line display
- **Data table export** for accessibility

### Performance Features
- **Intelligent caching** with LRU eviction
- **Data sampling** for large datasets
- **Web Workers** for background processing
- **Throttled event handling** for smooth interactions
- **Memory leak prevention** with automatic cleanup
- **Render time monitoring** with performance metrics

### Accessibility Features
- **Screen reader support** with ARIA labels
- **Keyboard navigation** for interactive elements
- **High contrast support** with accessible color palettes
- **Focus management** with visible focus indicators
- **Semantic markup** with proper roles and descriptions

## 🚀 Installation

### Prerequisites
- Svelte 5.x
- TypeScript (recommended)
- Modern browser with ES2020 support

### Dependencies
```bash
npm install date-fns
# or
pnpm add date-fns
# or
yarn add date-fns
```

### File Setup
Copy the following files to your project:

```
src/lib/components/charts/
├── MultiLineChart.svelte
├── types/chart.types.ts
└── utils/
    ├── PathGenerator.ts
    ├── ChartDataManager.ts
    ├── PerformanceMonitor.ts
    └── helpers.ts

static/
└── chart-worker.js
```

## Quick Start

### Basic Example

```svelte
<script lang="ts">
  import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';
  import type { LineData } from '$lib/components/charts/types/chart.types.js';

  const salesData: LineData[] = [
    {
      id: 'revenue',
      label: 'Revenue',
      color: '#3b82f6',
      data: [
        { date: '2024-01-01', value: 10000 },
        { date: '2024-01-02', value: 12000 },
        { date: '2024-01-03', value: 11500 },
        { date: '2024-01-04', value: 13000 }
      ]
    },
    {
      id: 'profit',
      label: 'Profit',
      color: '#10b981',
      data: [
        { date: '2024-01-01', value: 2000 },
        { date: '2024-01-02', value: 2400 },
        { date: '2024-01-03', value: 2300 },
        { date: '2024-01-04', value: 2600 }
      ]
    }
  ];
</script>

<MultiLineChart
  lines={salesData}
  xKey="date"
  yKey="value"
  title="Sales Performance"
  showLegend={true}
  hasTooltip={true}
/>
```

### Advanced Example with Performance Config

```svelte
<script lang="ts">
  import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';
  import type { LineData, ChartPerformanceConfig } from '$lib/components/charts/types/chart.types.js';

  const performanceConfig: Partial<ChartPerformanceConfig> = {
    svgMaxPoints: 1500,
    enableDataSampling: true,
    enableMemoization: true,
    mouseMoveThrottle: 16
  };

  const timeSeriesData: LineData[] = [
    // ... large dataset
  ];
</script>

<MultiLineChart
  lines={timeSeriesData}
  xKey="timestamp"
  yKey="measurement"
  title="Real-time Monitoring"
  height={500}
  showCrosshair={true}
  curveType="smooth"
  tension={0.3}
  dateFormat="MMM dd, HH:mm"
  {performanceConfig}
/>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lines` | `LineData[]` | `[]` | Array of line data objects |
| `xKey` | `string` | `'date'` | Key for x-axis values in data objects |
| `yKey` | `string` | `'value'` | Key for y-axis values in data objects |
| `title` | `string` | `'Multi Line Chart'` | Chart title |
| `showLegend` | `boolean` | `true` | Show/hide legend |
| `height` | `number` | `400` | Chart height in pixels |
| `dateFormat` | `string` | `'MMM dd'` | Date display format (date-fns format) |
| `inputDateFormat` | `string \| null` | `null` | Custom input date parsing format |
| `showValues` | `boolean` | `false` | Show values on data points |
| `hasTooltip` | `boolean` | `false` | Enable tooltip interactions |
| `yTickCount` | `number` | `5` | Number of Y-axis ticks |
| `doubleTicks` | `boolean` | `false` | Double tick count for negative values |
| `tension` | `number` | `0.3` | Curve tension (0-1) for smooth lines |
| `curveType` | `'straight' \| 'smooth'` | `'straight'` | Line curve type |
| `showCrosshair` | `boolean` | `false` | Enable crosshair mode |
| `performanceConfig` | `Partial<ChartPerformanceConfig>` | `{}` | Performance optimization settings |

### LineData Interface

```typescript
interface LineData {
  id: string;           // Unique identifier
  label: string;        // Display name in legend
  data: Array<Record<string, any>>; // Data points
  color: string;        // Line color (hex, rgb, hsl)
}
```

### ChartPerformanceConfig Interface

```typescript
interface ChartPerformanceConfig {
  // Rendering thresholds
  svgMaxPoints: number;           // Switch to Canvas above this (default: 1000)
  animationMaxPoints: number;     // Disable animations above this (default: 500)
  tooltipMaxPoints: number;       // Disable tooltips above this (default: 2000)
  
  // Optimization flags
  enableMemoization: boolean;     // Cache calculations (default: true)
  enableWebWorkers: boolean;      // Use Web Workers (default: true)
  enableDataSampling: boolean;    // Sample large datasets (default: true)
  
  // Performance tuning
  mouseMoveThrottle: number;      // Mouse event throttling ms (default: 16)
  resizeDebounce: number;         // Resize debounce ms (default: 150)
  maxCacheEntries: number;        // Max cache size (default: 50)
  enablePathCache: boolean;       // Cache SVG paths (default: true)
  
  // Canvas settings
  devicePixelRatio: number;       // Pixel ratio (default: window.devicePixelRatio)
  canvasSmoothing: boolean;       // Canvas antialiasing (default: true)
}
```

## Performance Configuration

### Automatic Mode Switching

The component automatically switches between rendering modes based on data size:

#### SVG Mode (Default)
- **Trigger**: < `svgMaxPoints` data points
- **Features**: Full animations, individual tooltips, accessibility
- **Best for**: Interactive dashboards, small to medium datasets

#### Canvas Mode (Automatic)
- **Trigger**: > `svgMaxPoints` data points  
- **Features**: High performance, crosshair tooltips only
- **Best for**: Large datasets, real-time monitoring, analytics

### Performance Presets

#### Default Configuration
```typescript
const defaultConfig = {
  svgMaxPoints: 1000,
  animationMaxPoints: 500,
  enableMemoization: true,
  mouseMoveThrottle: 16,        // 60fps
  resizeDebounce: 150
};
```

#### High Performance
```typescript
const highPerformanceConfig = {
  svgMaxPoints: 500,
  animationMaxPoints: 200,
  enableDataSampling: true,
  enableWebWorkers: true,
  mouseMoveThrottle: 32,        // 30fps
  maxCacheEntries: 100
};
```

#### Mobile Optimized
```typescript
const mobileConfig = {
  svgMaxPoints: 300,
  animationMaxPoints: 100,
  mouseMoveThrottle: 50,        // 20fps
  resizeDebounce: 300,
  devicePixelRatio: 2
};
```

#### Real-time Data
```typescript
const realtimeConfig = {
  svgMaxPoints: 1000,
  enableMemoization: true,
  mouseMoveThrottle: 100,       // Reduce interaction overhead
  maxCacheEntries: 25           // Lower memory usage
};
```

## Data Formats

### Basic Data Structure

```typescript
const lineData = {
  id: 'unique-identifier',
  label: 'Display Name',
  color: '#3b82f6',
  data: [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 120 },
    // ...
  ]
};
```

### Supported Date Formats

The component automatically parses various date formats:

```typescript
// ISO Dates
{ date: '2024-01-01', value: 100 }
{ date: '2024-01-01T10:30:00Z', value: 100 }

// US Format
{ date: '01/01/2024', value: 100 }
{ date: '1/1/2024', value: 100 }

// European Format
{ date: '01-01-2024', value: 100 }
{ date: '1-1-2024', value: 100 }

// Custom Format (with inputDateFormat prop)
{ date: '01.01.24', value: 100 }  // Set inputDateFormat="dd.MM.yy"
```

### Custom Data Keys

```svelte
<MultiLineChart
  lines={data}
  xKey="timestamp"      <!-- Custom x-axis key -->
  yKey="measurement"    <!-- Custom y-axis key -->
/>
```

### Multiple Y-Value Support

```typescript
const multiValueData = {
  id: 'sensors',
  label: 'Sensor Data',
  color: '#ef4444',
  data: [
    { 
      timestamp: '2024-01-01T10:00:00Z',
      temperature: 23.5,
      humidity: 45.2,
      pressure: 1013.25
    }
  ]
};

// Use different yKey for each chart
<MultiLineChart lines={data} xKey="timestamp" yKey="temperature" />
<MultiLineChart lines={data} xKey="timestamp" yKey="humidity" />
```

### Handling Missing Data

```typescript
const dataWithGaps = {
  id: 'incomplete',
  label: 'Incomplete Dataset',
  color: '#8b5cf6',
  data: [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: null },    // Missing value
    { date: '2024-01-03', value: undefined }, // Missing value
    { date: '2024-01-04', value: 120 }
  ]
};
// Missing values are automatically skipped
```

## Styling & Theming

### Default Color Palette

The component uses an accessible color palette by default:

```typescript
const defaultColors = [
  '#000000',  // Black
  '#ef4444',  // Red
  '#3b82f6',  // Blue  
  '#10b981',  // Green
  '#f59e0b',  // Yellow
  '#8b5cf6'   // Purple
];
```

### Custom Colors

```typescript
const customData: LineData[] = [
  {
    id: 'series1',
    label: 'Series 1',
    color: '#ff6b6b',        // Custom color
    data: [/* ... */]
  },
  {
    id: 'series2', 
    label: 'Series 2',
    color: 'hsl(200, 70%, 50%)',  // HSL format
    data: [/* ... */]
  }
];
```

### CSS Custom Properties

Override default styles using CSS custom properties:

```css
.multi-line-chart-container {
  --chart-background: #ffffff;
  --chart-text-color: #374151;
  --chart-grid-color: #e5e7eb;
  --chart-border-color: #d1d5db;
  --chart-legend-background: #f9fafb;
  --chart-tooltip-background: rgba(0, 0, 0, 0.9);
}

/* Dark theme example */
[data-theme="dark"] .multi-line-chart-container {
  --chart-background: #1f2937;
  --chart-text-color: #f9fafb;
  --chart-grid-color: #374151;
  --chart-border-color: #4b5563;
  --chart-legend-background: #111827;
  --chart-tooltip-background: rgba(255, 255, 255, 0.9);
}
```

### Responsive Breakpoints

The component includes built-in responsive behavior:

```css
/* Desktop (default) */
.legend {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* Tablet */
@media (max-width: 1024px) {
  .legend {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .legend {
    grid-template-columns: 1fr;
  }
  
  .tooltip-content {
    font-size: 11px;
    min-width: 100px;
  }
}
```

### Custom CSS Classes

Target specific elements for styling:

```css
/* Chart container */
.multi-line-chart-container { }

/* SVG chart */
.multi-line-chart { }

/* Canvas chart */
.chart-canvas { }

/* Legend */
.legend { }
.legend-item { }
.legend-color { }
.legend-label { }

/* Tooltips */
.tooltip { }
.tooltip-content { }
.tooltip-header { }
.tooltip-values { }

/* Data table */
.data-table-container { }
.data-table { }

/* Performance notice */
.performance-notice { }
```

## Accessibility

### Screen Reader Support

The component provides comprehensive screen reader support:

```html
<!-- Automatic ARIA labels -->
<svg role="img" aria-label="Line chart: Sales Performance">
  <!-- Chart content -->
</svg>

<!-- Screen reader announcements -->
<div aria-live="polite" aria-atomic="true">
  Highlighting Revenue series
</div>

<!-- Chart description -->
<div id="chart-description" class="sr-only">
  Line chart with 3 data series and 30 data points, including negative values.
  Use Tab to navigate legend items, Enter or Space to highlight lines.
</div>
```

### Keyboard Navigation

#### Legend Navigation
- **Tab**: Navigate between legend items
- **Enter/Space**: Toggle line highlight
- **Escape**: Clear all highlights

#### Chart Navigation
- **Tab**: Focus on chart controls
- **Escape**: Clear highlights and focus

### Focus Management

```css
/* Visible focus indicators */
.legend-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.data-table-toggle:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* High contrast support */
@media (prefers-contrast: high) {
  .legend-item {
    border: 2px solid currentColor;
  }
}
```

### Color Accessibility

The component ensures WCAG AA compliance:

- **Contrast ratios** > 4.5:1 for text
- **Colorblind-friendly** default palette
- **Pattern support** for distinguishing lines
- **Focus indicators** for keyboard users

### Data Table Alternative

Always provides tabular data access:

```svelte
<!-- Automatically generated data table -->
<table class="data-table" aria-label="Chart data in table format">
  <caption>Sales Performance - Detailed data table</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Revenue</th>
      <th scope="col">Profit</th>
    </tr>
  </thead>
  <tbody>
    <!-- Data rows -->
  </tbody>
</table>
```

## Performance Optimization

### Monitoring Performance

#### Enable Debug Mode

```typescript
// Add to URL: ?debug=performance
// Or programmatically:
import { PerformanceMonitor } from '$lib/components/charts/utils/PerformanceMonitor.js';

const monitor = new PerformanceMonitor();
monitor.startAutoLogging(5000); // Log every 5 seconds
```

#### Performance Metrics

The component tracks:
- **Render times** (average, max, 95th percentile)
- **Cache hit rates** 
- **Memory usage**
- **FPS calculations**
- **Health status**

### Optimization Strategies

#### For Large Datasets (10k+ points)

```typescript
const largeDatasetConfig = {
  svgMaxPoints: 500,           // Force Canvas mode early
  enableDataSampling: true,    // Auto-sample data
  enableWebWorkers: true,      // Background processing
  mouseMoveThrottle: 50,       // Reduce interaction frequency
  maxCacheEntries: 25,         // Lower memory usage
  enablePathCache: false       // Disable path caching
};
```

#### For Real-time Updates

```typescript
const realtimeConfig = {
  enableMemoization: true,     // Cache calculations
  mouseMoveThrottle: 100,      // Reduce interaction overhead
  resizeDebounce: 500,         // Less frequent resize handling
  maxCacheEntries: 10          // Minimal cache for frequent updates
};
```

#### For Mobile Devices

```typescript
const mobileConfig = {
  svgMaxPoints: 200,           // Lower threshold
  mouseMoveThrottle: 100,      // Touch-friendly
  devicePixelRatio: window.devicePixelRatio || 2,
  enableDataSampling: true,
  canvasSmoothing: false       // Better performance
};
```

### Memory Management

#### Automatic Cleanup

```typescript
// Component automatically cleans up:
// - Event listeners
// - Timers and intervals
// - Cache entries
// - Web Workers

onDestroy(() => {
  dataManager.clearCache();
  PathGenerator.clearCache();
  performanceMonitor.reset();
});
```

#### Manual Cache Control

```typescript
import { ChartDataManager } from '$lib/components/charts/utils/ChartDataManager.js';

const dataManager = ChartDataManager.getInstance();

// Monitor cache
console.log(dataManager.getCacheStats());

// Manual cleanup
dataManager.clearCache();
dataManager.setMaxCacheSize(25);
```

### Web Worker Integration

For datasets > 10k points, enable Web Workers:

```typescript
const workerConfig = {
  enableWebWorkers: true,
  svgMaxPoints: 1000
};

// Web Worker handles:
// - Data processing
// - Path generation
// - Statistical calculations
// - Data sampling
```

## Advanced Usage

### Real-time Data Streaming

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';

  let streamingData = $state<LineData[]>([]);
  let websocket: WebSocket;

  onMount(() => {
    // WebSocket connection
    websocket = new WebSocket('ws://localhost:8080/data-stream');
    
    websocket.onmessage = (event) => {
      const newDataPoint = JSON.parse(event.data);
      
      // Update data reactively
      streamingData = streamingData.map(line => {
        if (line.id === newDataPoint.lineId) {
          return {
            ...line,
            data: [...line.data.slice(-100), newDataPoint] // Keep last 100 points
          };
        }
        return line;
      });
    };

    return () => {
      websocket?.close();
    };
  });

  // Optimized config for real-time
  const realtimeConfig = {
    enableMemoization: true,
    mouseMoveThrottle: 100,
    maxCacheEntries: 10
  };
</script>

<MultiLineChart
  lines={streamingData}
  title="Real-time Data Stream"
  performanceConfig={realtimeConfig}
  showCrosshair={true}
/>
```

### Dynamic Data Loading

```svelte
<script lang="ts">
  import { writable } from 'svelte/store';
  
  const chartData = writable<LineData[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadData(dateRange: { start: Date; end: Date }) {
    loading = true;
    error = null;
    
    try {
      const response = await fetch('/api/chart-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateRange)
      });
      
      if (!response.ok) throw new Error('Failed to load data');
      
      const data = await response.json();
      chartData.set(data);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  // Adaptive performance config based on data size (Svelte 5 syntax)
  const performanceConfig = $derived.by(() => {
    const totalPoints = chartData.reduce((sum, line) => sum + line.data.length, 0);
    const hasLargeDatasets = chartData.some(line => line.data.length > 1000);
    
    return {
      svgMaxPoints: totalPoints > 5000 ? 500 : 1000,
      enableDataSampling: hasLargeDatasets,
      enableWebWorkers: totalPoints > 10000
    };
  });
</script>

{#if loading}
  <div class="loading-spinner">Loading chart data...</div>
{:else if error}
  <div class="error-message">Error: {error}</div>
{:else}
  <MultiLineChart
    lines={$chartData}
    title="Dynamic Data Chart"
    {performanceConfig}
  />
{/if}
```

### Multiple Chart Synchronization

```svelte
<script lang="ts">
  import MultiLineChart from '$lib/components/charts/MultiLineChart.svelte';
  
  let hoveredTime = $state<string | null>(null);
  let charts = $state([
    { id: 'chart1', data: salesData, title: 'Sales' },
    { id: 'chart2', data: revenueData, title: 'Revenue' },
    { id: 'chart3', data: profitData, title: 'Profit' }
  ]);

  function handleCrosshairUpdate(chartId: string, timeValue: string | null) {
    hoveredTime = timeValue;
    // Sync all charts to the same time
  }
</script>

<div class="chart-grid">
  {#each charts as chart}
    <div class="chart-panel">
      <MultiLineChart
        lines={chart.data}
        title={chart.title}
        showCrosshair={true}
        syncTime={hoveredTime}
        onCrosshairUpdate={(time) => handleCrosshairUpdate(chart.id, time)}
      />
    </div>
  {/each}
</div>

<style>
  .chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1rem;
  }
</style>
```

### Custom Tooltip Content

```svelte
<script lang="ts">
  let customTooltipData = $state(null);

  function formatTooltipContent(data) {
    return {
      title: `${data.xLabel}`,
      values: data.values.map(v => ({
        ...v,
        formattedValue: `$${v.value.toLocaleString()}`,
        trend: calculateTrend(v.lineId, data.xLabel)
      }))
    };
  }
</script>

<MultiLineChart
  lines={data}
  hasTooltip={true}
  showCrosshair={true}
  on:tooltipUpdate={(event) => {
    customTooltipData = formatTooltipContent(event.detail);
  }}
>
  <!-- Custom tooltip slot -->
  {#if customTooltipData}
    <div class="custom-tooltip" slot="tooltip">
      <h4>{customTooltipData.title}</h4>
      {#each customTooltipData.values as value}
        <div class="tooltip-row">
          <span class="indicator" style="background: {value.color}"></span>
          <span class="label">{value.lineLabel}:</span>
          <span class="value">{value.formattedValue}</span>
          <span class="trend {value.trend.direction}">{value.trend.icon}</span>
        </div>
      {/each}
    </div>
  {/if}
</MultiLineChart>
```

## Examples

### Basic Line Chart

```svelte
<script>
  const basicData = [
    {
      id: 'temperature',
      label: 'Temperature (°C)',
      color: '#ef4444',
      data: [
        { date: '2024-01-01', value: 18.5 },
        { date: '2024-01-02', value: 19.2 },
        { date: '2024-01-03', value: 17.8 },
        { date: '2024-01-04', value: 20.1 }
      ]
    }
  ];
</script>

<MultiLineChart
  lines={basicData}
  title="Daily Temperature"
  hasTooltip={true}
/>
```

### Financial Data with Negative Values

```svelte
<script>
  const financialData = [
    {
      id: 'profit-loss',
      label: 'Profit/Loss',
      color: '#10b981',
      data: [
        { quarter: 'Q1 2023', value: -5000 },
        { quarter: 'Q2 2023', value: 2000 },
        { quarter: 'Q3 2023', value: 8000 },
        { quarter: 'Q4 2023', value: 12000 },
        { quarter: 'Q1 2024', value: 15000 }
      ]
    }
  ];
</script>

<MultiLineChart
  lines={financialData}
  xKey="quarter"
  yKey="value"
  title="Quarterly Profit/Loss"
  doubleTicks={true}
  showValues={true}
  height={300}
/>
```

### Smooth Curves with High Performance

```svelte
<script>
  import { generateLargeDataset } from './utils/dataGenerator.js';
  
  const largeDataset = generateLargeDataset(5000); // 5k points
  
  const performanceConfig = {
    svgMaxPoints: 1000,
    enableDataSampling: true,
    enableWebWorkers: true
  };
</script>

<MultiLineChart
  lines={largeDataset}
  title="High-Frequency Time Series"
  curveType="smooth"
  tension={0.4}
  showCrosshair={true}
  hasTooltip={true}
  {performanceConfig}
/>
```

### Mobile-Optimized Dashboard

```svelte
<script>
  import { onMount } from 'svelte';
  
  let isMobile = $state(false);
  
  onMount(() => {
    isMobile = window.innerWidth < 768;
  });
  
  const mobileConfig = $derived.by(() => ({
    svgMaxPoints: isMobile ? 200 : 1000,
    mouseMoveThrottle: isMobile ? 100 : 16,
    enableDataSampling: isMobile
  }));
</script>

<div class="dashboard">
  <MultiLineChart
    lines={dashboardData}
    title="Mobile Dashboard"
    height={isMobile ? 250 : 400}
    showLegend={!isMobile}
    hasTooltip={!isMobile}
    showCrosshair={!isMobile}
    performanceConfig={mobileConfig}
  />
</div>

<style>
  .dashboard {
    padding: 1rem;
  }
  
  @media (max-width: 768px) {
    .dashboard {
      padding: 0.5rem;
    }
  }
</style>
```

### Real-time Monitoring

```svelte
<script>
  import { onMount } from 'svelte';
  
  let monitoringData = $state([]);
  let isConnected = $state(false);
  
  onMount(() => {
    const eventSource = new EventSource('/api/monitoring-stream');
    
    eventSource.onopen = () => {
      isConnected = true;
    };
    
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      
      // Update with sliding window
      monitoringData = monitoringData.map(line => ({
        ...line,
        data: [...line.data.slice(-100), ...newData[line.id] || []]
      }));
    };
    
    eventSource.onerror = () => {
      isConnected = false;
    };
    
    return () => eventSource.close();
  });
</script>

<div class="monitoring-panel">
  <div class="status">
    <span class="indicator {isConnected ? 'connected' : 'disconnected'}"></span>
    {isConnected ? 'Live' : 'Disconnected'}
  </div>
  
  <MultiLineChart
    lines={monitoringData}
    title="System Monitoring"
    showCrosshair={true}
    hasTooltip={true}
    dateFormat="HH:mm:ss"
    performanceConfig={{
      enableMemoization: true,
      mouseMoveThrottle: 100,
      maxCacheEntries: 5
    }}
  />
</div>

<style>
  .monitoring-panel {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  .indicator.connected {
    background: #10b981;
    animation: pulse 2s infinite;
  }
  
  .indicator.disconnected {
    background: #ef4444;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
```

## Troubleshooting

### Common Issues & Solutions

#### Performance Issues

**Problem**: Chart renders slowly with large datasets
```typescript
// Solution: Enable Canvas mode and data sampling
const config = {
  svgMaxPoints: 500,           // Force Canvas earlier
  enableDataSampling: true,    // Auto-sample large datasets
  enableWebWorkers: true       // Background processing
};
```

**Problem**: Animations lag or stutter
```typescript
// Solution: Disable animations for large datasets
const config = {
  animationMaxPoints: 200,     // Disable animations above 200 points
  mouseMoveThrottle: 32        // Reduce event frequency
};
```

**Problem**: High memory usage
```typescript
// Solution: Reduce cache size and enable cleanup
const config = {
  maxCacheEntries: 10,         // Smaller cache
  enablePathCache: false,      // Disable path caching
  enableDataSampling: true     // Reduce data size
};

// Manual cleanup
import { ChartDataManager } from '$lib/components/charts/utils/ChartDataManager.js';
ChartDataManager.getInstance().clearCache();
```

#### Data Issues

**Problem**: Dates not parsing correctly
```svelte
<!-- Solution: Specify input format -->
<MultiLineChart
  lines={data}
  inputDateFormat="dd/MM/yyyy"
  dateFormat="MMM dd"
/>
```

**Problem**: Missing or irregular data points
```typescript
// Solution: Clean data before passing to chart
const cleanedData = rawData.map(line => ({
  ...line,
  data: line.data.filter(point => 
    point[xKey] != null && 
    point[yKey] != null && 
    !isNaN(Number(point[yKey]))
  )
}));
```

**Problem**: Very large or very small numbers
```typescript
// Solution: Pre-process data for better display
const processedData = rawData.map(line => ({
  ...line,
  data: line.data.map(point => ({
    ...point,
    value: point.value / 1000000 // Convert to millions
  }))
}));
```

#### Visual Issues

**Problem**: Chart too small on mobile
```svelte
<script>
  import { onMount } from 'svelte';
  
  let screenWidth = $state(0);
  
  onMount(() => {
    screenWidth = window.innerWidth;
    const handler = () => screenWidth = window.innerWidth;
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });
</script>

<MultiLineChart
  lines={data}
  height={screenWidth < 768 ? 300 : 500}
/>
```

**Problem**: Legend overlaps or wraps poorly
```css
/* Solution: Custom legend styling */
.legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .legend {
    grid-template-columns: 1fr;
  }
}
```

**Problem**: Colors not accessible
```typescript
// Solution: Use accessible color palette
import { generateAccessibleColors } from '$lib/components/charts/utils/helpers.js';

const accessibleColors = generateAccessibleColors(lines.length);
const accessibleData = lines.map((line, index) => ({
  ...line,
  color: accessibleColors[index]
}));
```

#### Browser Compatibility

**Problem**: Web Workers not supported
```typescript
// Solution: Graceful fallback
const config = {
  enableWebWorkers: typeof Worker !== 'undefined',
  enableDataSampling: true // Always enable as fallback
};
```

**Problem**: Canvas performance poor on older devices
```typescript
// Solution: Aggressive SVG limits
const legacyConfig = {
  svgMaxPoints: 200,
  animationMaxPoints: 50,
  canvasSmoothing: false,
  devicePixelRatio: 1
};
```

### Debug Tools

#### Performance Monitoring

```typescript
// Enable detailed performance logging
const debugConfig = {
  enableMemoization: true,
  enablePathCache: true
};

// Check console for:
// - Render times
// - Cache hit rates  
// - Memory usage
// - Performance recommendations
```

#### Data Validation

```typescript
function validateChartData(lines: LineData[]): string[] {
  const errors: string[] = [];
  
  lines.forEach((line, index) => {
    if (!line.id) errors.push(`Line ${index}: Missing id`);
    if (!line.label) errors.push(`Line ${index}: Missing label`);
    if (!Array.isArray(line.data)) errors.push(`Line ${index}: Data must be array`);
    
    line.data.forEach((point, pointIndex) => {
      if (typeof point !== 'object') {
        errors.push(`Line ${index}, Point ${pointIndex}: Must be object`);
      }
    });
  });
  
  return errors;
}

// Usage
const errors = validateChartData(myData);
if (errors.length > 0) {
  console.warn('Chart data validation errors:', errors);
}
```

### Error Boundaries

```svelte
<script>
  import { onErrorCaptured } from 'svelte';
  
  let chartError = $state(null);
  
  onErrorCaptured((error, errorInfo) => {
    console.error('Chart error:', error, errorInfo);
    chartError = error.message;
    return false; // Don't propagate
  });
</script>

{#if chartError}
  <div class="error-boundary">
    <h3>Chart Error</h3>
    <p>{chartError}</p>
    <button onclick={() => chartError = null}>Retry</button>
  </div>
{:else}
  <MultiLineChart lines={data} />
{/if}
```

## Migration Guide

### From Basic SVG Charts

```svelte
<!-- Before: Basic SVG implementation -->
<svg width="800" height="400">
  <!-- Manual SVG elements -->
</svg>

<!-- After: Optimized component -->
<MultiLineChart
  lines={data}
  width={800}
  height={400}
  title="Migrated Chart"
/>
```

### From Chart.js

```javascript
// Before: Chart.js
const ctx = document.getElementById('myChart');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: 'Sales',
      data: values,
      borderColor: 'blue'
    }]
  }
});
```

```svelte
<!-- After: Svelte component -->
<script>
  const chartData = [{
    id: 'sales',
    label: 'Sales', 
    color: 'blue',
    data: dates.map((date, i) => ({ date, value: values[i] }))
  }];
</script>

<MultiLineChart lines={chartData} />
```

### From D3.js

```javascript
// Before: D3.js implementation
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.value));

svg.append("path")
  .datum(data)
  .attr("d", line);
```

```svelte
<!-- After: Declarative Svelte -->
<MultiLineChart
  lines={[{
    id: 'line1',
    label: 'Data',
    color: '#steelblue',
    data: data
  }]}
  xKey="date"
  yKey="value"
/>
```

### Performance Migration

```typescript
// Identify current performance bottlenecks
const currentDataSize = lines.reduce((sum, line) => sum + line.data.length, 0);

// Apply appropriate performance config
const migrationConfig = {
  // Conservative settings for migration
  svgMaxPoints: Math.min(1000, currentDataSize * 0.8),
  enableDataSampling: currentDataSize > 500,
  enableMemoization: true,
  mouseMoveThrottle: 32 // Slower during migration
};
```

## Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd chart-component

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic formatting
- **Testing**: Vitest + Testing Library

### Adding Features

1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Add tests**: Ensure >90% coverage
3. **Update documentation**: Include API changes
4. **Performance test**: Verify no regressions
5. **Submit PR**: Include performance benchmarks

### Performance Testing

```typescript
// Add performance benchmarks
import { benchmark } from './test/performance.js';

describe('Chart Performance', () => {
  it('should render 1000 points in <50ms', async () => {
    const data = generateTestData(1000);
    const renderTime = await benchmark(() => {
      render(MultiLineChart, { lines: data });
    });
    
    expect(renderTime).toBeLessThan(50);
  });
});
```

### Bug Reports

Include the following information:

- **Browser**: Version and type
- **Dataset size**: Number of lines and points
- **Performance config**: Settings used
- **Console errors**: Any JavaScript errors
- **Reproduction steps**: Minimal example
- **Expected vs actual**: Behavior description

### Feature Requests

Consider the following:

- **Performance impact**: How will it affect large datasets?
- **Accessibility**: Screen reader and keyboard support
- **Mobile compatibility**: Touch device behavior
- **API consistency**: Follows existing patterns
- **Use cases**: Real-world scenarios

---

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- **date-fns**: Date manipulation library
- **Svelte**: Reactive framework
- **Accessibility guidelines**: WCAG 2.1 AA compliance
- **Performance optimization**: Inspired by React performance patterns

---

## Support

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Latest updates and examples
- **Community**: Discord/Slack channel for discussions
- **Enterprise**: Commercial support available

---

*Last updated: December 2024*
*Component version: 1.0.0*
*Svelte version: 5.x*