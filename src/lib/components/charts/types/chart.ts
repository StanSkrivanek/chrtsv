// Categories
export enum ChartCategory {
	Comparison = 'Comparison',
	Correlation = 'Correlation',
	PartToWhole = 'PartToWhole',
	Temporal = 'Temporal',
	Distribution = 'Distribution',
	Geospatial = 'Geospatial',
	Network = 'Network'
}

// Base interface
interface ChartBase {
	id: string;
	title: string;
	description?: string;
	data: Record<string, unknown>;
	options?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

// Comparison
interface BarChart extends ChartBase {
	type: 'bar';
	category: ChartCategory.Comparison;
	orientation: 'horizontal' | 'vertical';
    xAxis: string;
    yAxis: string;
    xField: string;
    yField: string;
    colorField?: string;
    colorScale?: string;
    tooltipField?: string;
    groupBy?: string[];
    groupColors?: Record<string, string>;
    groupScale?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
    labelFormat?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}
interface StackedBarChart extends ChartBase {
	type: 'stackedBar';
	category: ChartCategory.PartToWhole;
    orientation: 'horizontal' | 'vertical';
    xAxis: string;
    yAxis: string;
    xField: string;
    yField: string;
    colorField?: string;
    colorScale?: string;
    tooltipField?: string;
    groupBy?: string[];
    groupColors?: Record<string, string>;
    groupScale?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
    labelFormat?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
    stackingOrder?: 'normal' | 'reverse' | 'percent';
}
interface GroupedBarChart extends ChartBase {
	type: 'groupedBar';
	category: ChartCategory.Comparison;
	groups: string[];
    orientation: 'horizontal' | 'vertical';
    xAxis: string;
    yAxis: string;
    xField: string;
    yField: string;
    colorField?: string;
    colorScale?: string;
    tooltipField?: string;
    groupBy?: string[];
    groupColors?: Record<string, string>;
    groupScale?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
    labelFormat?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
    barWidth?: number;
    barPadding?: number;
    barRadius?: number;
}

interface BulletChart extends ChartBase {
	type: 'bullet';
	category: ChartCategory.Comparison;
	target: number;
	ranges: number[];
    background?: string;
    foreground?: string;
    marker?: string;
    markerPosition?: number;
    markerColor?: string;
    showLabels?: boolean;
    labelFormat?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
    showGrid?: boolean;
    gridColor?: string;
    gridWidth?: number;
    showTooltip?: boolean;
    tooltipField?: string;
}

// Correlation

interface Heatmap extends ChartBase {
    type: 'heatmap';
    category: ChartCategory.Correlation;
}

interface BubbleChart extends ChartBase {
    type: 'bubble';
    category: ChartCategory.Correlation;

}

interface ScatterPlot extends ChartBase {
	type: 'scatter';
	category: ChartCategory.Correlation;
}

interface ConnectedScatter extends ChartBase {
    type: 'connectedScatter';
    category: ChartCategory.Correlation;
}

interface HexagonicalBinning extends ChartBase {
    type: 'hexbin';
    category: ChartCategory.Correlation;
    bins: number;       
}

interface ConturPlot extends ChartBase {
    type: 'contour';
    category: ChartCategory.Correlation;
    levels: number[];
}


// Part-to-Whole
interface PieChart extends ChartBase {
	type: 'pie';
	category: ChartCategory.PartToWhole;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    padAngle?: number;
    cornerRadius?: number;
    colorField?: string;
    colorScale?: string;
    tooltipField?: string;
    showLabels?: boolean;
    labelFormat?: string;
    labelPosition?: 'inside' | 'outside';
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    legendOrientation?: 'horizontal' | 'vertical';
    legendTitle?: string;
}
interface DonutChart extends ChartBase {
	type: 'donut';
	category: ChartCategory.PartToWhole;
}
interface TreemapChart extends ChartBase {
	type: 'treemap';
	category: ChartCategory.PartToWhole;
}
interface WaffleChart extends ChartBase {
	type: 'waffle';
	category: ChartCategory.PartToWhole;
}
interface SankeyChart extends ChartBase {
	type: 'sankey';
	category: ChartCategory.Network;
}

// Temporal
interface LineChart extends ChartBase {
	type: 'line';
	category: ChartCategory.Temporal;
}
interface AreaChart extends ChartBase {
	type: 'area';
	category: ChartCategory.Temporal;
}
interface CandlestickChart extends ChartBase {
	type: 'candlestick';
	category: ChartCategory.Temporal;
}

// Distribution
interface HistogramChart extends ChartBase {
	type: 'histogram';
	category: ChartCategory.Distribution;
	bins: number;
}
interface BoxPlotChart extends ChartBase {
	type: 'boxPlot';
	category: ChartCategory.Distribution;
}
interface ViolinChart extends ChartBase {
	type: 'violin';
	category: ChartCategory.Distribution;
}

// Geospatial
interface ChoroplethMap extends ChartBase {
	type: 'choropleth';
	category: ChartCategory.Geospatial;
	geoJson: unknown;
    features: string[];
    colorScale: string;
    valueField: string;
    tooltipField?: string;
}
interface GeographicHeatmap extends ChartBase {
	type: 'geoHeatmap';
	category: ChartCategory.Geospatial;
}

// Union of all chart configs
export type ChartConfig =
	| BarChart
	| StackedBarChart
	| GroupedBarChart
	| BulletChart
	| ScatterPlot
	| BubbleChart
	| PieChart
	| DonutChart
	| TreemapChart
	| WaffleChart
	| SankeyChart
	| LineChart
	| AreaChart
	| CandlestickChart
	| HistogramChart
	| BoxPlotChart
	| ViolinChart
    | Heatmap
	| ChoroplethMap
	| GeographicHeatmap
    | ConnectedScatter
    | HexagonicalBinning
    | ConturPlot;

// All chart types
export type ChartType = ChartConfig['type'];

export type ChartRenderer = (config: ChartConfig) => unknown;

export interface ChartPlugin {
	type: string;
	category: ChartCategory;
	label: string;
	icon?: string;
	configSchema: Record<string, unknown>;
	render: ChartRenderer;
}