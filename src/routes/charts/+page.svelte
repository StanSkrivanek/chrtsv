<script lang="ts">

	import {
		Activity,
		ArrowRight,
		ChartBar,
		ChartLine,
		ChartPie,
		ChartScatter,
		Target,
		TrendingUp,
		Zap
	} from 'lucide-svelte';
	// Chart categories data
	const chartCategories = [
		{
			id: 'line',
			title: 'Line Charts',
			icon: ChartLine,
			description:
				'Display trends and changes over time with multiple data series support and negative value handling.',
			features: ['Multi-line support', 'Date parsing', 'Negative values'],
			href: 'charts/line',
			status: 'Available'
		},
		{
			id: 'bar',
			title: 'Bar Charts',
			icon: ChartBar,
			description: 'Compare categorical data with horizontal and vertical bar configurations.',
			features: ['Grouped bars', 'Stacked options', 'Custom colors'],
			href: '/bar',
			status: 'Coming Soon'
		},
		{
			id: 'area',
			title: 'Area Charts',
			icon: TrendingUp,
			description:
				'Visualize cumulative data and filled regions between lines for better comparison.',
			features: ['Stacked areas', 'Smooth curves', 'Gradient fills'],
			href: '/area',
			status: 'Coming Soon'
		},
		{
			id: 'pie',
			title: 'Pie Charts',
			icon: ChartPie,
			description: 'Show proportional data with interactive segments and customizable styling.',
			features: ['Donut mode', 'Data labels', 'Animation'],
			href: '/pie',
			status: 'Coming Soon'
		},
		{
			id: 'scatter',
			title: 'Scatter Plots',
			icon: ChartScatter,
			description: 'Explore correlations between variables with bubble charts and trend lines.',
			features: ['Bubble sizing', 'Trend lines', 'Clustering'],
			href: '/scatter',
			status: 'Coming Soon'
		},
		{
			id: 'mixed',
			title: 'Mixed Charts',
			icon: Activity,
			description: 'Combine different chart types in a single visualization for complex data.',
			features: ['Multiple axes', 'Chart combinations', 'Synchronized data'],
			href: '/mixed',
			status: 'Planned'
		}
	];

	// Stats for hero section
	const stats = [
		{ value: '6', label: 'Chart Types' },
		{ value: '100%', label: 'TypeScript' },
		{ value: '0', label: 'Dependencies' }
	];
</script>

<main class="container">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<div class="hero-text">
				<h1>
					Chart <span class="accent">Components</span>
				</h1>

				<p class="lead">
					Professional data visualization components built for Svelte 5. Each chart type is designed
					with precision, accessibility, and performance in mind.
				</p>

				<div class="hero-stats">
					{#each stats as stat}
						<div class="stat">
							<div class="stat-value">{stat.value}</div>
							<div class="stat-label">{stat.label}</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="hero-visual">
				<div class="visual-grid">
					<div class="visual-item">
						<ChartLine size={32} />
						<span>Line</span>
					</div>
					<div class="visual-item">
						<ChartBar size={32} />
						<span>Bar</span>
					</div>
					<div class="visual-item">
						<TrendingUp size={32} />
						<span>Area</span>
					</div>
					<div class="visual-item">
						<ChartPie size={32} />
						<span>Pie</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Chart Categories Grid -->
	<section class="categories">
		<div class="section-header">
			<h2>Available Components</h2>
			<p>Choose from our collection of precision-engineered chart components</p>
		</div>

		<div class="categories-grid">
			{#each chartCategories as category}
				<article class="category-card" class:available={category.status === 'Available'}>
					<div class="card-header">
						<div class="card-icon">
							<svelte:component this={category.icon} size={24} />
						</div>
						<div class="card-status" class:available={category.status === 'Available'}>
							{category.status}
						</div>
					</div>

					<div class="card-content">
						<h3>{category.title}</h3>
						<p>{category.description}</p>

						<ul class="features-list">
							{#each category.features as feature}
								<li>{feature}</li>
							{/each}
						</ul>
					</div>

					<div class="card-footer">
						{#if category.status === 'Available'}
							<a href={category.href} class="btn btn-primary">
								View Component
								<ArrowRight size={16} />
							</a>
						{:else}
							<button class="btn btn-disabled" disabled>
								{category.status}
							</button>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- Features Section -->
	<section class="features">
		<div class="features-content">
			<div class="features-text">
				<h2>Built for Production</h2>
				<p>
					Every component is crafted with attention to detail, following Swiss design principles of
					clarity and function.
				</p>

				<ul class="feature-points">
					<li>
						<Target size={16} />
						<span>Precise data representation</span>
					</li>
					<li>
						<Zap size={16} />
						<span>Optimized performance</span>
					</li>
					<li>
						<Activity size={16} />
						<span>Accessibility compliant</span>
					</li>
				</ul>
			</div>

			<div class="features-visual">
				<div class="code-preview">
					<div class="code-header">Component Usage</div>
					<div class="code-content">
						<code>
							<span class="ltgt">&lt;</span><span class="">MultiLineChart</span><br />
							&nbsp;&nbsp;<span class="prop">lines</span>=<span class="code-tag"
								>&#123;data&#125;</span
							><br />
							&nbsp;&nbsp;<span class="prop">xKey</span>=<span class="value">"month"</span><br />
							&nbsp;&nbsp;<span class="prop">yKey</span>=<span class="value">"value"</span><br />
							&nbsp;&nbsp;<span class="prop">showLegend</span>=<span class="code-tag"
								>&#123;true&#125;</span
							><br />
							<span class="ltgt">/&gt;</span>
						</code>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	/* Inherit Swiss Design variables and base styles from main page */
	:root {
		--color-black: #000000;
		--color-brand: oklch(65.805% 0.22836 27.671);
		--color-white: #ffffff;
		--color-gray-light: #f5f5f5;
		--color-gray-medium: #cccccc;
		--color-gray-dark: #666666;
		--color-gray-text: #999999;
		--color-yellow: oklch(91.507% 0.16649 101.73);
		--color-salmon: oklch(0.704 0.191 22.216);
		--color-violet: oklch(79.002% 0.12088 296.501);
		--color-green: oklch(0.871 0.15 154.449);
		--font-system:
			-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
		--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

		--spacing-xs: 0.5rem;
		--spacing-sm: 1rem;
		--spacing-md: 2rem;
		--spacing-lg: 4rem;
		--spacing-xl: 6rem;

		--transition: all 0.2s ease;
	}
	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-sm);
		font-family: var(--font-system);
		line-height: 1.5;
		color: var(--color-black);
	}

	/* Typography */
	h1,
	h2,
	h3 {
		font-weight: 400;
		letter-spacing: -0.02em;
		margin: 0;
	}

	h1 {
		font-size: clamp(2.5rem, 5vw, 3.5rem);
		line-height: 1.1;
		margin-bottom: var(--spacing-sm);
	}

	h2 {
		font-size: 2rem;
		margin-bottom: var(--spacing-sm);
	}

	h3 {
		font-size: 1.25rem;
		margin-bottom: var(--spacing-xs);
	}

	p {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-gray-dark);
	}

	.accent {
		color: var(--color-brand);
	}

	/* Hero Section */
	.hero {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.hero-content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
	}

	.lead {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-md);
		max-width: 500px;
	}

	.hero-stats {
		display: flex;
		gap: var(--spacing-lg);
	}

	.stat {
		text-align: left;
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: 300;
		color: var(--color-brand);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-gray-dark);
	}

	.hero-visual {
		background: var(--color-gray-light);
		padding: var(--spacing-md);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.visual-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.visual-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm);
		border: 1px solid var(--color-gray-medium);
		background: var(--color-white);
	}

	.visual-item :global(svg) {
		color: var(--color-brand);
	}

	.visual-item span {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-gray-dark);
	}

	/* Categories Section */
	.categories {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.section-header {
		text-align: center;
		margin-bottom: var(--spacing-lg);
	}

	.section-header p {
		font-size: 1.125rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--spacing-md);
	}

	.category-card {
		border: 2px solid var(--color-gray-medium);
		background: var(--color-white);
		padding: var(--spacing-md);
		transition: var(--transition);
		display: flex;
		flex-direction: column;
		min-height: 320px; /* Increased min-height */
		gap: var(--spacing-sm); /* Added gap between sections */
	}

	.category-card.available {
		border-color: var(--color-black);
	}

	.category-card:hover.available {
		border-color: var(--color-brand);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-sm);
	}

	.card-icon {
		width: 48px;
		height: 48px;
		border: 2px solid var(--color-black);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-icon :global(svg) {
		color: var(--color-brand);
	}

	.card-status {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-gray-text);
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-gray-medium);
	}

	.card-status.available {
		color: var(--color-brand);
		border-color: var(--color-brand);
	}

	.card-content {
		flex: 1;
		margin-bottom: var(--spacing-sm); /* Reduced margin */
	}

	.features-list {
		list-style: none;
		padding: 0;
		margin: var(--spacing-sm) 0 0 0;
	}

	.features-list li {
		font-size: 0.875rem;
		color: var(--color-gray-dark);
		padding: 0.25rem 0;
		border-bottom: 1px solid var(--color-gray-light);
	}

	.features-list li:last-child {
		border-bottom: none;
	}

	.card-footer {
		margin-top: auto;
		padding-top: var(--spacing-sm); /* Added padding top */
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		text-decoration: none;
		font-weight: 500;
		border: 2px solid var(--color-black);
		transition: var(--transition);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.95rem;
		width: 100%;
		justify-content: center;
		/* Ensure padding is included in width */
	}

	.btn-primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary:hover {
		background: var(--color-brand);
		border-color: var(--color-brand);
	}

	.btn-disabled {
		background: var(--color-gray-light);
		color: var(--color-gray-text);
		border-color: var(--color-gray-medium);
		cursor: not-allowed;
	}

	/* Features Section */
	.features {
		padding: var(--spacing-xl) 0;
	}

	.features-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
	}

	.feature-points {
		list-style: none;
		padding: 0;
		margin: var(--spacing-md) 0 0 0;
	}

	.feature-points li {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.feature-points li:last-child {
		border-bottom: none;
	}

	.feature-points :global(svg) {
		color: var(--color-brand);
		flex-shrink: 0;
	}

	.code-preview {
		background: var(--color-black);
		color: var(--color-white);
		font-family: var(--font-mono);
	}

	.code-header {
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--color-gray-dark);
		font-size: 0.875rem;
		color: var(--color-gray-medium);
	}

	.code-content {
		padding: var(--spacing-md);
	}

	.code-content code {
		font-size: 0.875rem;
		line-height: 1.6;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-content,
		.features-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.hero-visual {
			order: -1;
		}

		.hero-stats {
			justify-content: space-between;
		}

		.visual-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: var(--spacing-sm);
		}

		.categories-grid {
			grid-template-columns: 1fr;
		}

		.category-card {
			min-height: auto;
		}
	}

	.code-tag {
		color: var(--color-yellow);
		font-weight: bold;
	}
	.ltgt {
		color: var(--color-salmon);
	}
	.prop {
		color: var(--color-violet);
	}
	.value {
		color: var(--color-green);
	}
</style>
