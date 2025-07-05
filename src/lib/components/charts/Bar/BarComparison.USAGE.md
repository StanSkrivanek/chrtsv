# BarComparison Component - Responsive Usage Guide

## Overview

The `BarComparison` component is a universal, responsive Svelte chart component that supports up to 5 items per month. It can handle various data structures and responsive dimensions including CSS units like `%`, `vw`, `vh`, etc.

## Props

### Dimensions (Responsive)

- `width`: `number | string` - Chart width (default: 900)
- `height`: `number | string` - Chart height (default: 360)

**Supported units:**

- Numbers: `900` (treated as pixels)
- Pixels: `"900px"`
- Percentages: `"100%"` (relative to parent container)
- Viewport units: `"50vw"`, `"25vh"`
- Any valid CSS unit

### Data & Configuration

- `apiData`: `ApiDataPoint[]` - Array of data points
- `metric`: `'sales' | 'revenue' | 'units_sold'` - Which metric to display
- `productColors`: `{ [key: string]: string }` - Color mapping for products

### Visual Options

- `padding`: `number` - Chart padding (default: 60)
- `showTooltip`: `boolean` - Show tooltips on hover (default: true)
- `animate`: `boolean` - Enable bar animations (default: true)
- `showLegend`: `boolean` - Show legend (default: true)
- `showValues`: `boolean` - Show values on bars (default: true)
- `legendGap`: `number` - Space between chart and legend (default: -24)
- `groupSpacing`: `number` - Space between month groups (default: 24)
- `barSpacing`: `number` - Space between bars in a group (default: 2)

## Usage Examples

### 1. Fixed Dimensions

```svelte
<BarComparison apiData={data} productColors={colors} width={900} height={360} />
```

### 2. Viewport Units (Responsive to Browser)

```svelte
<BarComparison apiData={data} productColors={colors} width="50vw" height="25vh" />
```

### 3. Percentage (Responsive to Container)

```svelte
<div class="chart-container" style="width: 800px; height: 400px;">
	<BarComparison apiData={data} productColors={colors} width="100%" height="100%" />
</div>
```

### 4. Mixed Units

```svelte
<BarComparison apiData={data} productColors={colors} width="80vw" height="300px" />
```

### 5. Full Viewport

```svelte
<BarComparison apiData={data} productColors={colors} width="100vw" height="50vh" />
```

## Data Structure

The component expects an array of `ApiDataPoint` objects:

```typescript
type ApiDataPoint = {
	month: string; // e.g., "Jan", "Feb", "Mar"
	product_id: string; // e.g., "prod_001"
	product_name: string; // e.g., "iPhone 15"
	sales: number; // Sales value
	revenue: number; // Revenue value
	units_sold: number; // Units sold value
};
```

### Example Data

```javascript
const apiData = [
	{
		month: 'Jan',
		product_id: 'prod_001',
		product_name: 'iPhone 15',
		sales: 186000,
		revenue: 186000,
		units_sold: 186
	},
	{
		month: 'Jan',
		product_id: 'prod_002',
		product_name: 'Samsung Galaxy S24',
		sales: 305000,
		revenue: 305000,
		units_sold: 305
	}
	// ... more data points
];
```

## Color Configuration

Define colors for each product:

```javascript
const productColors = {
	prod_001: '#93C5FD', // Blue
	prod_002: '#6a4c93', // Purple
	prod_003: '#8ac926', // Green
	prod_004: '#1982c4', // Dark Blue
	prod_005: '#ff595e' // Red
};
```

## Responsive Behavior

### Container-Based Sizing

When using percentage units, the chart will size relative to its parent container:

```svelte
<div class="dashboard-section" style="width: 600px; height: 400px;">
	<BarComparison width="100%" height="100%" apiData={data} productColors={colors} />
</div>
```

### Viewport-Based Sizing

When using viewport units, the chart will size relative to the browser window:

```svelte
<BarComparison
  width="50vw"   <!-- 50% of viewport width -->
  height="25vh"  <!-- 25% of viewport height -->
  apiData={data}
  productColors={colors}
/>
```

### Adaptive Features

- **Small screens**: Consider disabling value labels: `showValues={false}`
- **Mobile**: Use smaller padding: `padding={30}`
- **Tight spaces**: Reduce legend gap: `legendGap={-10}`

## Performance Considerations

- The component uses Svelte's reactivity system for efficient updates
- Animations are handled via Svelte's Spring for smooth performance
- SSR (Server-Side Rendering) is supported with graceful fallbacks

## Browser Compatibility

- Modern browsers supporting CSS Grid and Flexbox
- Viewport units (vw, vh) support
- SVG support required

## Troubleshooting

### Chart Not Resizing

- Ensure parent container has defined dimensions when using percentages
- Check that CSS units are properly formatted (e.g., "50vw" not "50 vw")

### Performance Issues

- Reduce animation complexity: `animate={false}`
- Limit data points (max 5 products recommended)
- Consider debouncing resize events for viewport units

### Layout Issues

- Adjust padding for different screen sizes
- Use `legendGap` to control spacing between chart and legend
- Consider `showValues={false}` for small charts

## Advanced Usage

### Dynamic Resizing

```svelte
<script>
	import { onMount } from 'svelte';

	let chartWidth = '50vw';
	let chartHeight = '25vh';

	onMount(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				chartWidth = '95vw';
				chartHeight = '30vh';
			} else {
				chartWidth = '50vw';
				chartHeight = '25vh';
			}
		};

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<BarComparison width={chartWidth} height={chartHeight} apiData={data} productColors={colors} />
```

### Container Queries (Future)

The component is designed to work with container queries when they become widely supported:

```css
.chart-wrapper {
	container-type: inline-size;
}

@container (max-width: 400px) {
	.chart-wrapper {
		--chart-padding: 20px;
	}
}
```

## Best Practices

1. **Always test responsive behavior** across different screen sizes
2. **Use appropriate units** for your use case:
   - Fixed layouts: pixels
   - Responsive layouts: percentages
   - Full-screen layouts: viewport units
3. **Consider performance** when using viewport units with frequent resize events
4. **Provide fallbacks** for SSR environments
5. **Test data edge cases** (empty data, single product, etc.)
