# LineChart Component - Usage Guide

## Overview

The `LineChart` component is a responsive Svelte line chart that displays trends over time. It supports multiple product lines, smooth curves, animations, and responsive dimensions including CSS units.

## Props

### Dimensions (Responsive)

- `width`: `number | string` - Chart width (default: 800)
- `height`: `number | string` - Chart height (default: 400)

**Supported units:**

- Numbers: `800` (treated as pixels)
- Pixels: `"800px"`
- Percentages: `"100%"` (relative to parent container)
- Viewport units: `"50vw"`, `"25vh"`

### Data & Configuration

- `apiData`: `ApiDataPoint[]` - Array of data points (same structure as BarComparison)
- `metric`: `'sales' | 'revenue' | 'units_sold'` - Which metric to display
- `productColors`: `{ [key: string]: string }` - Color mapping for products

### Visual Options

- `padding`: `number` - Chart padding (default: 60)
- `showTooltip`: `boolean` - Show tooltips on hover (default: true)
- `animate`: `boolean` - Enable animations (default: true)
- `showLegend`: `boolean` - Show legend (default: true)
- `showPoints`: `boolean` - Show data points (default: true)
- `showValues`: `boolean` - Show values on points (default: false)
- `strokeWidth`: `number` - Line thickness (default: 2)
- `pointRadius`: `number` - Point size (default: 4)
- `legendGap`: `number` - Space between chart and legend (default: -24)
- `curveType`: `'smooth' | 'straight'` - Line curve type (default: 'smooth')
- `tension`: `number` - Curve smoothness (0.1 = tight, 0.6 = loose) (default: 0.3)

## Curve Algorithm

The LineChart uses a **Catmull-Rom spline** algorithm for smooth curves that:

- ✅ **No overshoot**: Curves stay within natural bounds of data
- ✅ **Natural flow**: Follows the actual progression of data points
- ✅ **Adjustable tension**: Control curve smoothness with `tension` prop
- ✅ **Simple & reliable**: Replaced complex monotone cubic spline

**Tension values:**

- `0.1` - Tight curves, close to data points
- `0.3` - Default, balanced smoothness
- `0.6` - Loose curves, very smooth transitions

## Usage Examples

### 1. Single Line Chart (Like Example Image)

```svelte
<script>
	const data = [
		{ month: 'Jan', product_id: 'desktop', product_name: 'Desktop', units_sold: 100 },
		{ month: 'Feb', product_id: 'desktop', product_name: 'Desktop', units_sold: 320 },
		{ month: 'Mar', product_id: 'desktop', product_name: 'Desktop', units_sold: 280 },
		{ month: 'Apr', product_id: 'desktop', product_name: 'Desktop', units_sold: 237 },
		{ month: 'May', product_id: 'desktop', product_name: 'Desktop', units_sold: 350 },
		{ month: 'Jun', product_id: 'desktop', product_name: 'Desktop', units_sold: 320 }
	];

	const colors = {
		desktop: '#60a5fa'
	};
</script>

<LineChart
	apiData={data}
	productColors={colors}
	width={600}
	height={300}
	showLegend={false}
	curveType="smooth"
	tension={0.3}
/>
```

### 2. Multiple Lines Chart

```svelte
<LineChart
	apiData={multiProductData}
	productColors={colors}
	width={700}
	height={350}
	metric="units_sold"
	showPoints={true}
	curveType="smooth"
	tension={0.3}
/>
```

### 3. Responsive Chart

```svelte
<LineChart apiData={data} productColors={colors} width="50vw" height="25vh" metric="units_sold" />
```

### 4. Container-Based Sizing

```svelte
<div style="width: 500px; height: 250px;">
	<LineChart apiData={data} productColors={colors} width="100%" height="100%" />
</div>
```

### 5. Straight Lines (No Curves)

```svelte
<LineChart apiData={data} productColors={colors} curveType="straight" strokeWidth={3} />
```

### 6. With Value Labels

```svelte
<LineChart apiData={data} productColors={colors} showValues={true} showPoints={true} />
```

## Data Structure

Uses the same data structure as BarComparison:

```typescript
type ApiDataPoint = {
	month: string; // e.g., "Jan", "Feb", "Mar"
	product_id: string; // e.g., "desktop", "mobile"
	product_name: string; // e.g., "Desktop", "Mobile"
	sales: number; // Sales value
	revenue: number; // Revenue value
	units_sold: number; // Units sold value
};
```

## Styling Options

### Line Styles

- **Smooth curves**: `curveType="smooth"` - Uses quadratic bezier curves
- **Straight lines**: `curveType="straight"` - Angular connections between points
- **Stroke width**: `strokeWidth={2}` - Line thickness

### Point Styles

- **Point size**: `pointRadius={4}` - Size of data points
- **Show/hide points**: `showPoints={true/false}`
- **Point colors**: Match line colors with white stroke

### Animation

- **Line animation**: Lines fade in with staggered timing
- **Point hover**: Points grow on hover
- **Line hover**: Lines get thicker on hover

## Responsive Behavior

The LineChart component is fully responsive and supports:

- **Viewport units**: `width="50vw"` or `height="25vh"`
- **Percentages**: `width="100%"` fills parent container
- **Fixed dimensions**: `width={600}` for exact pixel sizing
- **Mixed units**: `width="80vw"` with `height="300px"`

## Best Practices

1. **Use smooth curves** for trend visualization
2. **Show points** for precise data point reference
3. **Limit to 5 lines** for readability
4. **Use contrasting colors** for multiple lines
5. **Consider responsive sizing** for different screen sizes
6. **Hide legend** for single-line charts
7. **Show values** only when chart is large enough

## Comparison with BarComparison

| Feature             | LineChart          | BarComparison                  |
| ------------------- | ------------------ | ------------------------------ |
| **Best for**        | Trends over time   | Comparisons between categories |
| **Data points**     | Connected by lines | Individual bars                |
| **Animation**       | Line drawing       | Bar height growth              |
| **Hover**           | Point enlargement  | Bar highlighting               |
| **Multiple series** | Multiple lines     | Grouped bars                   |

## Performance

- Efficient SVG rendering
- Smooth animations using Svelte Springs
- ResizeObserver for responsive updates
- Minimal DOM manipulation

## Browser Support

- Modern browsers with SVG support
- ResizeObserver (with polyfill for older browsers)
- CSS custom properties support

## Files Created

1. **LineChart.svelte** - Main component
2. **LineChart.example.svelte** - Multiple usage examples
3. **LineChart.simple.svelte** - Simple single-line example
4. **LineChart.USAGE.md** - This documentation file

The LineChart component provides a powerful and flexible way to visualize time-series data with smooth animations and responsive design.
