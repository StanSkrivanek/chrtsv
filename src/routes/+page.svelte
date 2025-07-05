<script lang="ts">
	import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
	import { ArrowRight, ChartLine, Github, Palette, Shield, Zap } from 'lucide-svelte';

	// Sample data for hero chart
	const heroData = [
		{
			id: 'performance',
			label: 'Performance',
			color: '#000000',
			data: [
				{ month: 'Q1', value: 85 },
				{ month: 'Q2', value: 92 },
				{ month: 'Q3', value: 88 },
				{ month: 'Q4', value: 96 }
			]
		},
		{
			id: 'efficiency',
			label: 'Efficiency',
			color: '#ff0000',
			data: [
				{ month: 'Q1', value: 78 },
				{ month: 'Q2', value: 84 },
				{ month: 'Q3', value: 91 },
				{ month: 'Q4', value: 94 }
			]
		}
	];

	// Feature showcase data
	const featureData = [
		{
			id: 'revenue',
			label: 'Revenue',
			color: '#000000',
			data: [
				{ period: 'Jan', value: 12000 },
				{ period: 'Feb', value: 15000 },
				{ period: 'Mar', value: 13500 },
				{ period: 'Apr', value: 18000 },
				{ period: 'May', value: 22000 },
				{ period: 'Jun', value: 19500 }
			]
		}
	];
</script>

<main class="container">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<div class="hero-text">
				<div class="brand">
					<ChartLine size={32} />
					<span>Svelte Charts</span>
				</div>

				<h1>
					Precise Data<br />
					<span class="accent">Visualization</span>
				</h1>

				<p class="lead">
					Professional chart components built for Svelte 5. Clean, accessible, and performant data
					visualization following Swiss design principles.
				</p>

				<div class="cta-group">
					<a href="/line" class="btn btn-primary">
						View Components
						<ArrowRight size={16} />
					</a>
					<a href="#features" class="btn btn-secondary"> Learn More </a>
				</div>
			</div>

			<div class="hero-chart">
				<MultiLineChart
					lines={heroData}
					xKey="month"
					yKey="value"
					title=""
					showLegend={false}
					height={280}
					yTickCount={4}
				/>
			</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section id="features" class="features">
		<div class="section-header">
			<h2>Features</h2>
			<p>Built with precision and attention to detail</p>
		</div>

		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">
					<Zap size={24} />
				</div>
				<h3>Performance</h3>
				<p>
					Optimized for speed with efficient rendering and minimal bundle size. No unnecessary
					dependencies.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">
					<Shield size={24} />
				</div>
				<h3>Accessibility</h3>
				<p>
					WCAG 2.1 AA compliant with full keyboard navigation and screen reader support built-in.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">
					<Palette size={24} />
				</div>
				<h3>Customizable</h3>
				<p>
					Flexible theming system with TypeScript support and comprehensive configuration options.
				</p>
			</div>
		</div>
	</section>

	<!-- Showcase Section -->
	<section class="showcase">
		<div class="showcase-content">
			<div class="showcase-info">
				<h2>Clean Design</h2>
				<p>
					Every element serves a purpose. No decoration without function. Clear typography and
					precise spacing create hierarchy and improve readability.
				</p>

				<ul class="feature-list">
					<li>Swiss-inspired design system</li>
					<li>Consistent spacing and typography</li>
					<li>Minimal cognitive load</li>
					<li>Focus on data clarity</li>
				</ul>

				<a href="/line" class="link-arrow">
					Explore Components
					<ArrowRight size={16} />
				</a>
			</div>

			<div class="showcase-chart">
				<div class="chart-label">Revenue Overview</div>
				<MultiLineChart
					lines={featureData}
					xKey="period"
					yKey="value"
					title=""
					showLegend={false}
					height={240}
					showValues={true}
				/>
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="stats">
		<div class="stats-grid">
			<div class="stat">
				<div class="stat-number">5+</div>
				<div class="stat-label">Chart Types</div>
			</div>
			<div class="stat">
				<div class="stat-number">100%</div>
				<div class="stat-label">TypeScript</div>
			</div>
			<div class="stat">
				<div class="stat-number">0</div>
				<div class="stat-label">Dependencies</div>
			</div>
			<div class="stat">
				<div class="stat-number">WCAG</div>
				<div class="stat-label">AA Compliant</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section">
		<div class="cta-content">
			<h2>Start Building</h2>
			<p>Add professional charts to your Svelte application today.</p>

			<div class="cta-buttons">
				<a href="/line" class="btn btn-primary">
					<ChartLine size={16} />
					View Documentation
				</a>
				<a href="https://github.com" class="btn btn-outline">
					<Github size={16} />
					View on GitHub
				</a>
			</div>
		</div>
	</section>
</main>

<style>
	/* Swiss Design Variables */
	:root {
		--color-black: #000000;
		--color-red: #ff0000;
		--color-white: #ffffff;
		--color-gray-light: #f5f5f5;
		--color-gray-medium: #cccccc;
		--color-gray-dark: #666666;

		--font-system:
			-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
		--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

		--spacing-xs: 0.5rem;
		--spacing-sm: 1rem;
		--spacing-md: 2rem;
		--spacing-lg: 4rem;
		--spacing-xl: 6rem;

		--border-radius: 0; /* Swiss design uses sharp corners */
		--transition: all 0.2s ease;
	}

	* {
		box-sizing: border-box;
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
		font-size: clamp(2.5rem, 5vw, 4rem);
		line-height: 1.1;
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

	/* Hero Section */
	.hero {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.hero-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 1.25rem;
		font-weight: 500;
		margin-bottom: var(--spacing-md);
	}

	.brand :global(svg) {
		color: var(--color-red);
	}

	.accent {
		color: var(--color-red);
	}

	.lead {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-md);
		max-width: 400px;
	}

	.cta-group {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	.hero-chart {
		background: var(--color-gray-light);
		padding: var(--spacing-md);
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
	}

	.btn-primary {
		background: var(--color-black);
		color: var(--color-white);
	}

	.btn-primary:hover {
		background: var(--color-red);
		border-color: var(--color-red);
	}

	.btn-secondary {
		background: var(--color-white);
		color: var(--color-black);
	}

	.btn-secondary:hover {
		background: var(--color-gray-light);
	}

	.btn-outline {
		background: transparent;
		color: var(--color-black);
	}

	.btn-outline:hover {
		background: var(--color-black);
		color: var(--color-white);
	}

	/* Features Section */
	.features {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.section-header {
		text-align: center;
		margin-bottom: var(--spacing-lg);
	}

	.section-header p {
		font-size: 1.125rem;
		max-width: 500px;
		margin: 0 auto;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-lg);
	}

	.feature-card {
		text-align: center;
		padding: var(--spacing-md);
	}

	.feature-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto var(--spacing-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-black);
	}

	.feature-icon :global(svg) {
		color: var(--color-red);
	}

	/* Showcase Section */
	.showcase {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.showcase-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: var(--spacing-md) 0;
	}

	.feature-list li {
		padding: var(--spacing-xs) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.feature-list li:last-child {
		border-bottom: none;
	}

	.link-arrow {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-red);
		text-decoration: none;
		font-weight: 500;
		transition: var(--transition);
	}

	.link-arrow:hover {
		color: var(--color-black);
	}

	.showcase-chart {
		background: var(--color-gray-light);
		padding: var(--spacing-md);
	}

	.chart-label {
		font-size: 0.875rem;
		color: var(--color-gray-dark);
		margin-bottom: var(--spacing-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Stats Section */
	.stats {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-gray-medium);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
	}

	.stat {
		text-align: center;
		padding: var(--spacing-md);
	}

	.stat-number {
		font-size: 3rem;
		font-weight: 300;
		color: var(--color-red);
		margin-bottom: var(--spacing-xs);
	}

	.stat-label {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-gray-dark);
	}

	/* CTA Section */
	.cta-section {
		padding: var(--spacing-xl) 0;
		text-align: center;
	}

	.cta-content h2 {
		margin-bottom: var(--spacing-sm);
	}

	.cta-content p {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-md);
	}

	.cta-buttons {
		display: flex;
		justify-content: center;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-content,
		.showcase-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.hero-chart,
		.showcase-chart {
			order: -1;
		}

		.features-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}

		.btn {
			min-width: 200px;
			justify-content: center;
		}
	}
</style>
