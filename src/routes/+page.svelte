<script lang="ts">
	import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
	import { ArrowRight, ChartLine, Palette, Shield, Zap } from 'lucide-svelte';

	// Sample data for hero chart
	const heroData = [
		{
			id: 'performance',
			label: 'Performance',
			color: '#1447E6',
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
			color: '#ff6900',
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

<main>
	<!-- Hero Section -->
	<section class="hero">
		<div class="brand">
			<ChartLine size={120} />
			<h1>Svelte Charts</h1>
		</div>

		<div class="hero-content">
			<div class="hero-text">
				<h2>
					Precise Data<br />
					<span class="accent">Visualization</span>
				</h2>

				<p class="lead">
					Professional chart components built for Svelte 5. Clean, accessible, and performant data
					visualization following Swiss design principles.
				</p>

				<div class="cta-group">
					<a href="/charts" class="btn btn-primary">
						View Components
						<ArrowRight size={16} />
					</a>
					<a href="#features" class="btn btn-secondary"> Learn More </a>
				</div>
			</div>

			<div class="chart__w">
				<div class="chart-label">Q1 - Q4 statistics</div>
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
	<section id="features" class="features__c">
		<div class="section-header">
			<h2>Features<span class="accent">.</span></h2>
			<p class="lead">Built with precision and attention to detail</p>
		</div>

		<div class="features__w">
			<div class="feature">
				<div class="feature-icon">
					<Zap size={24} />
				</div>
				<h3>Performance</h3>
				<p>
					Optimized for speed with efficient rendering and minimal bundle size. No unnecessary
					dependencies.
				</p>
			</div>

			<div class="feature">
				<div class="feature-icon">
					<Shield size={24} />
				</div>
				<h3>Accessibility</h3>
				<p>
					WCAG 2.1 AA compliant with full keyboard navigation and screen reader support built-in.
				</p>
			</div>

			<div class="feature">
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
			<div class="section-text">
				<h2>Clean Design</h2>
				<p class="sub-heading">Built for clarity. Nothing extra</p>
				<p class="lead">
					<!-- Every element serves a purpose. No decoration without function. Clear typography and
					precise spacing create hierarchy and improve readability. -->
					Every element supports the data. No decoration without purpose. Clear structure, precise spacing,
					and accessible contrast improve comprehension
				</p>

				<ul class="feature-list lead">
					<li>Data clarity first</li>
					<li>Consistent layout</li>
					<li>Low cognitive load</li>
					<li>Accessible contrast</li>
				</ul>

				<a href="/charts" class="link-arrow">
					Explore Components
					<ArrowRight size={16} />
				</a>
			</div>

			<div class="chart__w">
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
	<section class="cta-footer-section">
		<div class="cta-content">
			<h2>Start Building</h2>
			<p>Add professional charts to your Svelte application today.</p>

			<div class="cta-buttons">
				<a href="/line" class="btn btn-primary">
					<ChartLine size={16} />
					View Documentation
				</a>
				<a href="https://github.com" class="btn btn-outline">
					<!-- <Github size={16} /> -->
					<img
						src="/github.svg"
						alt=""
						width="16"
						height="16"
						style="color: var(--color-red-600);"
					/>
					View on GitHub
				</a>
			</div>
		</div>
	</section>
</main>

<style>
	/* Swiss Design Variables */
	:root {
		/* --font-system:
			-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
		--font-mono: 'mono', Monaco, 'Cascadia Code', monospace; */

		--spacing-xs: 0.5rem;
		--spacing-sm: 1rem;
		--spacing-md: 2rem;
		--spacing-lg: 4rem;
		--spacing-xl: 6rem;

		--border-radius: 0; /* Swiss design uses sharp corners */
		--transition: all 0.2s ease;
	}



	/* Hero Section */
	.hero {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-slate-300);
		@media screen and (max-width: 768px) {
			padding: var(--spacing-lg) 0;
		}
	}

	.hero-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
		h2 {
			font-size: clamp(3rem, 0.8824rem + 5.5882vw, 4rem);
			letter-spacing: -0.02em;
			font-family: 'bold';
			line-height: 1;
			margin-bottom: var(--spacing-md);
		}
		@media screen and (max-width: 768px) {
			display: flex;
			flex-direction: column;
			width: 100%;

			h2,
			p,
			.cta-group {
				align-items: center;
				text-align: center;
			}

			.chart__w {
				order: -1; /* Move chart to the top on small screens */
				width: 100%;
			}
		}
		@media screen and (max-width: 480px) {
			h2 {
				/* font-size: clamp(2.5rem, 0.8824rem + 3.5882vw, 3.5rem); */
			}
			.cta-group {
				display: block;
				a {
					width: 100%;
					margin-bottom: var(--spacing-sm);
				}
				/* flex-direction: column;
				align-items: center; */
			}
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		justify-content: center;
		margin-bottom: var(--spacing-xl);
		width: fit-content; /* Add this to constrain width */
		margin-left: auto; /* Add this for centering */
		margin-right: auto; /* Add this for centering */

		& h1 {
			display: inline-block;
			line-height: 1;
			font-size: clamp(3rem, 0.8824rem + 10.5882vw, 12rem);
			white-space: nowrap; /* Prevent text wrapping */
			flex-shrink: 0; /* Prevent shrinking */
		}
	}

	

	





	/* Features Section */
	.features__c {
		display: flex;
		justify-content: space-between;
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-slate-300);
		.section-header {
			margin-bottom: var(--spacing-lg);
			h2 {
				font-size: clamp(3rem, 0.8824rem + 10.5882vw, 12rem);
				letter-spacing: -0.02em;
				font-family: 'bold';
				line-height: 1;
			}
			p {
				font-size: clamp(1.125rem, 0.2941rem + 2.3529vw, 1.8rem);
				line-height: 1;
			}
		}
		@media screen and (max-width: 768px) {
			width: 100%;
			flex-direction: column;
			padding: var(--spacing-lg);
		}
		@media screen and (max-width: 480px) {
			padding: var(--spacing-xs);
		}
	}

	.features__w {
		display: flex;
		/* width: 100%; */

		flex-direction: column;
		/* justify-content: flex-end; */
		/* align-items: end; */
		/* text-align: right; */
		/* grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); */
		gap: var(--spacing-lg);
		@media screen and (max-width: 768px) {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
			gap: var(--spacing-sm);
		}
		@media screen and (max-width: 480px) {
			display: block;
			gap: var(--spacing-sm);
		}
	}

	.feature {
		padding: var(--space-4);
		line-clamp: 3;

		& h3 {
			/* display: flex;
			align-items: center; */
			gap: var(--spacing-xs);
			font-size: 2rem;
			font-family: 'regular';
			/* color: var(--color-slate-900); */
			letter-spacing: 0.025em;
			margin-bottom: var(--space-4);
			border-bottom: 2px solid var(--color-slate-500);
		}
		& p {
			font-size: 1.125rem;
			color: var(--color-slate-500);
			margin-bottom: var(--space-4);
			max-width: 30ch;
			/* text-align: right; */
		}
		@media screen and (max-width: 768px) {
			display: block;
			padding: 0;
			& h3 {
				margin-bottom: var(--spacing-xs);
			}
			& p {
				margin-bottom: var(--spacing-md);
			}
		}
		@media screen and (max-width: 480px) {
			padding: 0;
		}
	}


	/* Showcase Section */
	.showcase {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-slate-300);
	}

	.showcase-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
		h2 {
			font-size: clamp(3rem, 0.8824rem + 5.5882vw, 4rem);
			letter-spacing: -0.02em;
			font-family: 'bold';
			line-height: 1;
			/* margin-bottom: var(--spacing-md); */
		}
		.sub-heading {
			font-size: 1.125rem;
			font-family: 'semibold';
			margin-bottom: var(--spacing-md);
			color: var(--color-slate-600);
		}
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: var(--spacing-md) 0;
		li {
			padding: var(--spacing-sm) 0;
			border-bottom: 1px solid var(--color-slate-300);
			letter-spacing: 0.025em;
		}
		li:last-child {
			border-bottom: none;
		}
	}



	/* Stats Section */
	.stats {
		padding: var(--spacing-xl) 0;
		border-bottom: 1px solid var(--color-slate-300);
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
		color: var(--color-rose-500);
		margin-bottom: var(--spacing-xs);
	}

	.stat-label {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-slate-400);
	}

	/* CTA Section */
	.cta-footer-section {
		padding: var(--spacing-xl) 0;
		text-align: center;
	}

	.cta-content h2 {
		margin-bottom: var(--space-4);
	}

	.cta-content p {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-md);
	}

	.cta-buttons {
		display: flex;
		justify-content: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-content,
		.showcase-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}
		.brand {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
		/* .hero-chart,
		.showcase-chart {
			order: -1;
		} */

		/* .features-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		} */

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
