# MultiLineChart Component

A flexible multi-line chart component built with Svelte 5 that can display up to 5 lines simultaneously. Perfect for comparing multiple datasets over time.

## Features

- **Multiple Lines**: Display up to 5 lines at once
- **Interactive Legend**: Click or hover legend items to highlight specific lines
- **Responsive Design**: Automatically adjusts to container size
- **Customizable Colors**: Each line can have its own color
- **Tooltip Support**: Hover over data points to see detailed information
- **Smooth Animations**: Hover effects and line highlighting
- **Accessibility**: Full keyboard navigation and ARIA support

## Usage

```svelte
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
	showLegend={true}
	height={450}
/>
```

## Props

| Prop              | Type             | Default              | Description                                     |
| ----------------- | ---------------- | -------------------- | ----------------------------------------------- |
| `lines`           | `LineData[]`     | `[]`                 | Array of line data objects (max 5 lines)        |
| `xKey`            | `string`         | `'date'`             | Key to use for x-axis values                    |
| `yKey`            | `string`         | `'value'`            | Key to use for y-axis values                    |
| `title`           | `string`         | `'Multi Line Chart'` | Chart title                                     |
| `showLegend`      | `boolean`        | `true`               | Whether to show the legend                      |
| `height`          | `number`         | `400`                | Chart height in pixels                          |
| `dateFormat`      | `string`         | `'MMM dd'`           | Date format for display (using date-fns format) |
| `inputDateFormat` | `string \| null` | `null`               | Expected input date format for parsing          |

## LineData Interface

```typescript
interface LineData {
	id: string; // Unique identifier for the line
	label: string; // Display name for the line
	color: string; // Hex color code for the line
	data: Array<Record<string, any>>; // Array of data points
}
```

## Example with Different Metrics

```svelte
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

<select bind:value={selectedMetric}>
	<option value="sales">Sales ($)</option>
	<option value="revenue">Revenue ($)</option>
	<option value="units_sold">Units Sold</option>
</select>

<MultiLineChart
	lines={multiLineData}
	xKey="month"
	yKey={selectedMetric}
	title="Product Performance - {selectedMetric}"
	showLegend={true}
	height={450}
/>
```

## Date Formatting Examples

### Using Server Dates with Custom Format

```svelte
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
	lines={serverData}
	xKey="date"
	yKey="value"
	title="Server Data with ISO Dates"
	dateFormat="MMM dd, yyyy"
	height={400}
/>
```

### Using Custom Input Date Format

```svelte
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
	lines={customFormatData}
	xKey="date"
	yKey="value"
	title="Custom Date Format"
	inputDateFormat="dd/MM/yyyy"
	dateFormat="MMM dd"
	height={400}
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

- Full keyboard navigation support
- ARIA roles and labels
- Screen reader friendly
- High contrast tooltips
- Focus indicators

## Best Practices

1. **Limit Lines**: Keep to 5 lines maximum for readability
2. **Color Contrast**: Use high contrast colors for better visibility
3. **Data Consistency**: Ensure all lines have similar x-axis values
4. **Responsive Design**: Set appropriate height for your container
5. **Legend**: Use descriptive labels for legend items

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
