<script lang="ts">
	import { Check, Copy } from 'lucide-svelte';
	import CodeBlock from './CodeBlock.svelte';

	let {
		title = 'Usage Example',
		description = 'Basic implementation example'
	} = $props<{
		title?: string;
		description?: string;
	}>();

	let copied = $state(false);

	// Concise, practical usage example
	const usageExample = `<script>
	import MultiLineChart from '$lib/components/charts/line/MultiLineChart.svelte';
	
	const chartData = [
		{
			id: 'sales',
			label: 'Sales',
			color: '#3b82f6',
			data: [
				{ date: '2024-01', value: 1000 },
				{ date: '2024-02', value: 1200 },
				{ date: '2024-03', value: 1500 },
				{ date: '2024-04', value: 1300 },
				{ date: '2024-05', value: 1800 }
			]
		},
		{
			id: 'revenue',
			label: 'Revenue',
			color: '#ef4444',
			data: [
				{ date: '2024-01', value: 5000 },
				{ date: '2024-02', value: 6000 },
				{ date: '2024-03', value: 7500 },
				{ date: '2024-04', value: 6500 },
				{ date: '2024-05', value: 9000 }
			]
		}
	];
<\/script>

<MultiLineChart
	lines={chartData}
	title="Monthly Performance"
	xKey="date"
	yKey="value"
	dateFormat="MMM yyyy"
	height={400}
	showLegend={true}
	hasTooltip={true}
/>`;

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(usageExample);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy code:', err);
		}
	}
</script>

<div class="usage-example">
	<div class="example-header">
		<div class="example-info">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
		<button 
			class="copy-button"
			class:copied
			onclick={copyToClipboard}
			aria-label="Copy usage example to clipboard"
		>
			{#if copied}
				<Check size={16} />
				Copied!
			{:else}
				<Copy size={16} />
				Copy
			{/if}
		</button>
	</div>

	<div class="example-code">
		<CodeBlock code={usageExample} language="svelte" />
	</div>

	<div class="example-notes">
		<h4>Key Features:</h4>
		<ul>
			<li><strong>Multi-line support:</strong> Display multiple data series on a single chart</li>
			<li><strong>Date formatting:</strong> Automatic date parsing and custom format options</li>
			<li><strong>Interactive tooltips:</strong> Hover to see detailed data points</li>
			<li><strong>Responsive design:</strong> Automatically adapts to container size</li>
			<li><strong>Accessibility:</strong> Full keyboard navigation and screen reader support</li>
		</ul>
	</div>
</div>

<style>
	.usage-example {
		width: 100%;
	}

	.example-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
		gap: 16px;
	}

	.example-info h3 {
		margin: 0 0 8px 0;
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
	}

	.example-info p {
		margin: 0;
		color: #64748b;
		font-size: 14px;
	}

	.copy-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		background: #ffffff;
		color: #475569;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		outline: none;
		white-space: nowrap;
	}

	.copy-button:hover {
		background: #f8fafc;
		border-color: #cbd5e1;
	}

	.copy-button:focus {
		box-shadow: 0 0 0 2px #3b82f6;
	}

	.copy-button.copied {
		background: #dcfce7;
		border-color: #16a34a;
		color: #16a34a;
	}

	.example-code {
		margin-bottom: 24px;
	}

	.example-notes {
		padding: 16px;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.example-notes h4 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
	}

	.example-notes ul {
		margin: 0;
		padding-left: 20px;
	}

	.example-notes li {
		margin-bottom: 8px;
		color: #475569;
		font-size: 14px;
		line-height: 1.5;
	}

	.example-notes li:last-child {
		margin-bottom: 0;
	}

	.example-notes strong {
		color: #1e293b;
	}

	@media (max-width: 768px) {
		.example-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.copy-button {
			align-self: flex-start;
		}
	}
</style>
