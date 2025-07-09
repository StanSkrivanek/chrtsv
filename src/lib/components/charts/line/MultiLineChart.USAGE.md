# MultiLineChart Component

A flexible multi-line chart component built with Svelte 5 that can display up to 5 lines simultaneously. Perfect for comparing multiple datasets over time, including support for negative values and profit/loss analysis.

## Features

- **Multiple Lines**: Display up to 5 lines at once
- **Negative Values Support**: Automatic handling of negative data with zero reference line
- **Auto-Doubled Ticks**: Automatically increases tick density for negative value datasets
- **Interactive Legend**: Click or hover legend items to highlight specific lines
- **Value Labels**: Optional display of values above each data point
- **Configurable Tooltips**: Enable/disable hover tooltips
- **Responsive Design**: Automatically adjusts to container size
- **Customizable Colors**: Each line can have its own color
- **Flexible Tick Count**: Configure Y-axis tick density
- **Date Parsing**: Built-in support for various date formats using date-fns
- **Smooth Animations**: Hover effects and line highlighting
- **Accessibility**: Keyboard navigation for legend items and basic ARIA support

## Usage

```html
<script>
	import { MultiLineChart } from '$lib';

	const lines = [
		{
			id: 'desktop',
			label: 'Desktop',
			color: '#3b82f6',
			data: [
				{ month: 'Jan', sales: 1000, revenue: 5000 },
				{ month: 'Feb', sales: 3200, revenue: 2000 }
				// ... more data
			]
		},
		{
			id: 'mobile',
			label: 'Mobile',
			color: '#ef4444',
			data: [
				{ month: 'Jan', sales: 800, revenue: 4000 },
				{ month: 'Feb', sales: 2500, revenue: 1800 }
				// ... more data
			]
		}
	];
</script>

<MultiLineChart
	{lines}
	xKey="month"
	yKey="sales"
	title="Product Performance"
	showLegend="{true}"
	height="{450}"
/>
```

## Props

| Prop              | Type                     | Default              | Description                                                                         |
| ----------------- | ------------------------ | -------------------- | ----------------------------------------------------------------------------------- |
| `lines`           | `LineData[]`             | `[]`                 | Array of line data objects (max 5 lines)                                            |
| `xKey`            | `string`                 | `'date'`             | Key to use for x-axis values                                                        |
| `yKey`            | `string`                 | `'value'`            | Key to use for y-axis values                                                        |
| `title`           | `string`                 | `'Multi Line Chart'` | Chart title                                                                         |
| `showLegend`      | `boolean`                | `true`               | Whether to show the legend                                                          |
| `height`          | `number`                 | `400`                | Chart height in pixels                                                              |
| `dateFormat`      | `string`                 | `'MMM dd'`           | Date format for display (using date-fns format)                                     |
| `inputDateFormat` | `string \| null`         | `null`               | Expected input date format for parsing                                              |
| `showValues`      | `boolean`                | `false`              | Show value labels above each data point                                             |
| `hasTooltip`      | `boolean`                | `true`               | Enable/disable tooltips on hover                                                    |
| `yTickCount`      | `number`                 | `5`                  | Number of ticks on Y-axis                                                           |
| `doubleTicks`     | `boolean`                | `true`               | Automatically double tick count when negative values detected                       |
| `tension`         | `number`                 | `0.3`                | Curve tension factor for smooth lines (0-1, optimal: 0.3-0.5)                       |
| `curveType`       | `'smooth' \| 'straight'` | `'straight'`           | Line curve type - 'smooth' uses Catmull-Rom spline, 'straight' uses linear segments |

## LineData Interface

```typescript
interface LineData {
	id: string; // Unique identifier for the line
	label: string; // Display name for the line
	color: string; // Hex color code for the line
	data: Array<Record<string, any>>; // Array of data points
}
```

## Advanced Features

### Negative Values Support

The component automatically handles negative values with enhanced features:

```html
<script>
	const profitLossData = [
		{
			id: 'product_a',
			label: 'Product A',
			color: '#3b82f6',
			data: [
				{ month: 'Jan', profit: -1200 },
				{ month: 'Feb', profit: -800 },
				{ month: 'Mar', profit: 200 },
				{ month: 'Apr', profit: 1500 }
			]
		},
		{
			id: 'product_b',
			label: 'Product B',
			color: '#ef4444',
			data: [
				{ month: 'Jan', profit: -2000 },
				{ month: 'Feb', profit: -1500 },
				{ month: 'Mar', profit: -500 },
				{ month: 'Apr', profit: 800 }
			]
		}
	];
</script>

<MultiLineChart
	lines="{profitLossData}"
	xKey="month"
	yKey="profit"
	title="Profit/Loss Analysis"
	yTickCount="{5}"
	doubleTicksForNegatives="{true}"
/>
```

**Features for negative values:**

- **Zero reference line**: Automatic horizontal line at y=0
- **Auto-doubled ticks**: Doubles tick count (5→10) for better granularity
- **Smart scaling**: Proper Y-axis scaling with negative padding
- **Bold zero tick**: Zero tick is highlighted in bold

### Smooth Line Curves

The component features an enhanced Catmull-Rom spline implementation for natural-looking curves:

```html
<!-- Smooth curves with default tension -->
<MultiLineChart lines="{salesData}" xKey="month" yKey="sales" curveType="smooth" />

<!-- Custom tension (0-1, optimal: 0.3-0.5) -->
<MultiLineChart lines="{salesData}" xKey="month" yKey="sales" curveType="smooth" tension="{0.4}" />

<!-- Straight line segments -->
<MultiLineChart lines="{salesData}" xKey="month" yKey="sales" curveType="straight" />
```

**Curve Features:**

- **Optimized algorithm**: Uses tension \* 0.5 for more natural curves
- **Better 2-point handling**: Creates proper cubic Bezier curves for minimal data
- **Reduced overshoot**: Prevents unnatural bulges and maintains visual integrity
- **Configurable tension**: Values from 0-1, with 0.3-0.5 being optimal

### Value Labels

Show values directly on the chart:

```html
<MultiLineChart
	lines="{salesData}"
	xKey="month"
	yKey="sales"
	title="Sales with Value Labels"
	showValues="{true}"
	showLegend="{true}"
/>
```

### Tooltip Configuration

Control tooltip behavior:

```html
<!-- Enable tooltips (default) -->
<MultiLineChart lines="{data}" hasTooltip="{true}" />

<!-- Disable tooltips -->
<MultiLineChart lines="{data}" hasTooltip="{false}" />
```

### Custom Tick Configuration

Control Y-axis tick density:

```html
<!-- Sparse ticks for simple data -->
<MultiLineChart lines="{data}" yTickCount="{3}" />

<!-- Dense ticks for detailed analysis -->
<MultiLineChart lines="{data}" yTickCount="{8}" />

<!-- Disable auto-doubling for negative values -->
<MultiLineChart lines="{profitData}" yTickCount="{5}" doubleTicksForNegatives="{false}" />
```

## Example with Different Metrics

```html
<script>
	let selectedMetric = 'revenue';

	const multiLineData = [
		{
			id: 'desktop',
			label: 'Desktop',
			color: '#3b82f6',
			data: [
				{ month: 'Jan', sales: 1000, revenue: 5000, units_sold: 100 },
				{ month: 'Feb', sales: 3200, revenue: 2000, units_sold: 120 }
				// ... more data
			]
		}
		// ... more lines
	];
</script>

<select bind:value="{selectedMetric}">
	<option value="sales">Sales ($)</option>
	<option value="revenue">Revenue ($)</option>
	<option value="units_sold">Units Sold</option>
</select>

<MultiLineChart
	lines="{multiLineData}"
	xKey="month"
	yKey="{selectedMetric}"
	title="Product Performance - {selectedMetric}"
	showLegend="{true}"
	height="{450}"
/>
```

## Date Formatting Examples

### Using Server Dates with Custom Format

```html
<script>
	import { MultiLineChart } from '$lib';

	// Server returns dates in format "2024-01-15T10:30:00Z"
	const serverData = [
		{
			id: 'sales',
			label: 'Sales Data',
			color: '#3b82f6',
			data: [
				{ date: '2024-01-15T10:30:00Z', value: 1000 },
				{ date: '2024-02-15T10:30:00Z', value: 1500 },
				{ date: '2024-03-15T10:30:00Z', value: 1200 }
			]
		}
	];
</script>

<MultiLineChart
	lines="{serverData}"
	xKey="date"
	yKey="value"
	title="Server Data with ISO Dates"
	dateFormat="MMM dd, yyyy"
	height="{400}"
/>
```

### Using Custom Input Date Format

```html
<script>
	// Server returns dates in format "15/01/2024"
	const customFormatData = [
		{
			id: 'revenue',
			label: 'Revenue',
			color: '#ef4444',
			data: [
				{ date: '15/01/2024', value: 5000 },
				{ date: '15/02/2024', value: 6000 },
				{ date: '15/03/2024', value: 5500 }
			]
		}
	];
</script>

<MultiLineChart
	lines="{customFormatData}"
	xKey="date"
	yKey="value"
	title="Custom Date Format"
	inputDateFormat="dd/MM/yyyy"
	dateFormat="MMM dd"
	height="{400}"
/>
```

### Available Date Formats

You can use any format supported by date-fns:

- `'MMM dd'` → "Jan 15"
- `'MMM dd, yyyy'` → "Jan 15, 2024"
- `'MM/dd/yyyy'` → "01/15/2024"
- `'dd/MM/yyyy'` → "15/01/2024"
- `'yyyy-MM-dd'` → "2024-01-15"
- `'EEE, MMM dd'` → "Mon, Jan 15"
- `'MMMM yyyy'` → "January 2024"

## Complete Example

Here's a comprehensive example showcasing all major features:

```html
<script>
	import { MultiLineChart } from '$lib';

	// Profit/Loss data with negative values
	const profitLossData = [
		{
			id: 'product_a',
			label: 'Product A',
			color: '#3b82f6',
			data: [
				{ month: 'Jan', profit: -1200, margin: -15.2 },
				{ month: 'Feb', profit: -800, margin: -8.5 },
				{ month: 'Mar', profit: 200, margin: 2.1 },
				{ month: 'Apr', profit: 1500, margin: 12.3 },
				{ month: 'May', profit: 2800, margin: 18.7 },
				{ month: 'Jun', profit: 2200, margin: 16.4 }
			]
		},
		{
			id: 'product_b',
			label: 'Product B',
			color: '#ef4444',
			data: [
				{ month: 'Jan', profit: -2000, margin: -22.8 },
				{ month: 'Feb', profit: -1500, margin: -18.2 },
				{ month: 'Mar', profit: -500, margin: -5.4 },
				{ month: 'Apr', profit: 800, margin: 8.9 },
				{ month: 'May', profit: 1800, margin: 15.6 },
				{ month: 'Jun', profit: 2500, margin: 21.3 }
			]
		}
	];

	let selectedMetric = 'profit';
	let showLabels = true;
	let enableTooltips = true;
	let tickCount = 5;
</script>

<!-- Controls -->
<div class="controls">
	<label>
		Metric:
		<select bind:value={selectedMetric}>
			<option value="profit">Profit ($)</option>
			<option value="margin">Margin (%)</option>
		</select>
	</label>

	<label>
		<input type="checkbox" bind:checked={showLabels} />
		Show Value Labels
	</label>

	<label>
		<input type="checkbox" bind:checked={enableTooltips} />
		Enable Tooltips
	</label>

	<label>
		Tick Count:
		<input type="range" min="3" max="10" bind:value={tickCount} />
		{tickCount}
	</label>
</div>

<!-- Chart -->
<MultiLineChart
	lines={profitLossData}
	xKey="month"
	yKey={selectedMetric}
	title={`Product Performance - ${selectedMetric === 'profit' ? 'Profit ($)' : 'Margin (%)'}`}
	showLegend={true}
	showValues={showLabels}
	hasTooltip={enableTooltips}
	yTickCount={tickCount}
	doubleTicksForNegatives={true}
	height={450}
/>
```

## Styling

The component includes built-in styling but can be customized using CSS custom properties:

```css
:global(.multi-line-chart-container) {
	/* Custom styling */
}

:global(.legend) {
	/* Customize legend appearance */
}

:global(.tooltip) {
	/* Customize tooltip appearance */
}
```

## Accessibility

- **Full keyboard navigation**: Chart focus with Tab, legend navigation with Tab/Shift+Tab
- **Screen reader support**: ARIA labels, live regions, and comprehensive descriptions
- **Data table alternative**: Optional accessible data table representation
- **Focus management**: Clear focus indicators and logical tab order
- **Announcements**: Live region announcements for state changes
- **High contrast**: High contrast tooltips and UI elements

**Keyboard shortcuts:**

- `Tab`: Navigate to legend items
- `Enter/Space`: Toggle line highlighting
- `Escape`: Clear all highlights and return to normal view

**Screen reader features:**

- Chart description with data summary
- Live announcements for interactions
- Alternative data table with proper headers
- ARIA labels for all interactive elements

## Best Practices

### General Guidelines

1. **Limit Lines**: Keep to 5 lines maximum for readability
2. **Color Contrast**: Use high contrast colors for better visibility
3. **Data Consistency**: Ensure all lines have similar x-axis values
4. **Responsive Design**: Set appropriate height for your container
5. **Legend**: Use descriptive labels for legend items

### Negative Values

1. **Use Auto-Doubled Ticks**: Keep `doubleTicksForNegatives={true}` for better granularity
2. **Clear Zero Line**: The automatic zero reference line helps users distinguish positive/negative
3. **Contextual Colors**: Consider using red for losses and green for profits

### Performance

1. **Value Labels**: Use `showValues={true}` sparingly with dense data
2. **Tooltip Management**: Disable tooltips (`hasTooltip={false}`) for better performance with many points
3. **Tick Count**: Higher tick counts (`yTickCount`) provide more detail but can clutter the axis

### Data Visualization

1. **Meaningful Ranges**: Choose tick counts that create meaningful intervals
2. **Consistent Metrics**: When switching metrics, ensure they're contextually related
3. **Date Formatting**: Use appropriate date formats for your data frequency

### Accessibility

1. **Full Keyboard Support**: All interactive elements are keyboard accessible
2. **Screen Reader Friendly**: Comprehensive ARIA labels and descriptions
3. **Data Table Alternative**: Toggle accessible data table view
4. **High Contrast**: Sufficient color contrast for all visual elements
5. **Focus Management**: Clear focus indicators and logical navigation
6. **Live Announcements**: Screen reader announcements for state changes
7. **Alternative Access**: Multiple ways to access chart data

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
