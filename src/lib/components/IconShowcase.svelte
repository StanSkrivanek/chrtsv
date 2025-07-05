<script lang="ts">
	import {
		Activity,
		AlertCircle,
		ArrowDown,
		ArrowUp,
		Calendar,
		CheckCircle,
		DollarSign,
		Eye,
		Info,
		Laptop,
		Layers,
		LineChart,
		Minus,
		Monitor,
		MousePointer,
		PieChart,
		Plus,
		Settings,
		ShoppingCart,
		Smartphone,
		Tablet,
		Target,
		TrendingDown,
		TrendingUp,
		Users,
		Watch,
		XCircle,
		Zap
	} from 'lucide-svelte';

	const chartIcons = [
		{ name: 'BarChart3', component: BarChart3, description: 'Multi-bar chart' },
		{ name: 'BarChart2', component: BarChart2, description: 'Simple bar chart' },
		{ name: 'LineChart', component: LineChart, description: 'Line chart' },
		{ name: 'PieChart', component: PieChart, description: 'Pie chart' },
		{ name: 'TrendingUp', component: TrendingUp, description: 'Positive trend' },
		{ name: 'TrendingDown', component: TrendingDown, description: 'Negative trend' },
		{ name: 'Activity', component: Activity, description: 'Activity/pulse' }
	];

	const businessIcons = [
		{ name: 'DollarSign', component: DollarSign, description: 'Currency/money' },
		{ name: 'Users', component: Users, description: 'Users/people' },
		{ name: 'ShoppingCart', component: ShoppingCart, description: 'Shopping/sales' },
		{ name: 'Target', component: Target, description: 'Goals/targets' },
		{ name: 'Zap', component: Zap, description: 'Performance/energy' }
	];

	const deviceIcons = [
		{ name: 'Monitor', component: Monitor, description: 'Desktop' },
		{ name: 'Smartphone', component: Smartphone, description: 'Mobile' },
		{ name: 'Tablet', component: Tablet, description: 'Tablet' },
		{ name: 'Laptop', component: Laptop, description: 'Laptop' },
		{ name: 'Watch', component: Watch, description: 'Smartwatch' }
	];

	const interfaceIcons = [
		{ name: 'Settings', component: Settings, description: 'Settings/config' },
		{ name: 'Eye', component: Eye, description: 'Visibility/view' },
		{ name: 'MousePointer', component: MousePointer, description: 'Interaction' },
		{ name: 'Layers', component: Layers, description: 'Layers/depth' },
		{ name: 'Calendar', component: Calendar, description: 'Date/time' },
		{ name: 'Info', component: Info, description: 'Information' },
		{ name: 'CheckCircle', component: CheckCircle, description: 'Success' },
		{ name: 'AlertCircle', component: AlertCircle, description: 'Warning' },
		{ name: 'XCircle', component: XCircle, description: 'Error' }
	];

	const mathIcons = [
		{ name: 'Plus', component: Plus, description: 'Addition' },
		{ name: 'Minus', component: Minus, description: 'Subtraction' },
		{ name: 'ArrowUp', component: ArrowUp, description: 'Increase' },
		{ name: 'ArrowDown', component: ArrowDown, description: 'Decrease' }
	];

	const iconCategories = [
		{ name: 'Charts & Analytics', icons: chartIcons },
		{ name: 'Business & Finance', icons: businessIcons },
		{ name: 'Devices', icons: deviceIcons },
		{ name: 'Interface', icons: interfaceIcons },
		{ name: 'Math & Arrows', icons: mathIcons }
	];
</script>

<div class="icon-showcase">
	<h1>Available Lucide Icons</h1>
	<p class="subtitle">Icons from the Lucide icon library, ready to use in your charts</p>

	{#each iconCategories as category}
		<div class="category">
			<h2>{category.name}</h2>
			<div class="icon-grid">
				{#each category.icons as icon}
					<div class="icon-card">
						<div class="icon-display">
							<svelte:component this={icon.component} size={24} />
						</div>
						<div class="icon-info">
							<div class="icon-name">{icon.name}</div>
							<div class="icon-description">{icon.description}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<div class="usage-example">
		<h2>Usage Example</h2>
		<div class="code-block">
			<pre><code
					>{`import { LineChart, TrendingUp } from 'lucide-svelte';

<h1>
  <LineChart size={24} />
  My Chart Title
</h1>

<div class="feature">
  <TrendingUp size={16} class="feature-icon" />
  Positive trend indicator
</div>`}</code
				></pre>
		</div>
	</div>
</div>

<style>
	.icon-showcase {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		text-align: center;
		color: #1e293b;
		margin-bottom: 0.5rem;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.subtitle {
		text-align: center;
		color: #64748b;
		margin-bottom: 3rem;
		font-size: 1.2rem;
	}

	.category {
		margin-bottom: 3rem;
	}

	.category h2 {
		color: #374151;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		font-weight: 600;
		border-bottom: 2px solid #e2e8f0;
		padding-bottom: 0.5rem;
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.icon-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.icon-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.icon-display {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: white;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		flex-shrink: 0;
	}

	.icon-display :global(svg) {
		color: #3b82f6;
		stroke-width: 2;
	}

	.icon-info {
		flex: 1;
	}

	.icon-name {
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 0.25rem;
	}

	.icon-description {
		color: #64748b;
		font-size: 0.875rem;
	}

	.usage-example {
		margin-top: 3rem;
		padding: 2rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
	}

	.usage-example h2 {
		color: #374151;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.code-block {
		background: #1e293b;
		color: #e2e8f0;
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.code-block pre {
		margin: 0;
	}

	.code-block code {
		color: inherit;
		background: none;
		padding: 0;
		border-radius: 0;
		font-size: inherit;
		font-family: inherit;
	}

	@media (max-width: 768px) {
		.icon-showcase {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.icon-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
