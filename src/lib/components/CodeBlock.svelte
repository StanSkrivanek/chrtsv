<script lang="ts">
	import { highlightCode } from '$lib/utils/highlighter.js';
	import { onMount } from 'svelte';
	import type { BundledLanguage, BundledTheme } from 'shiki';

	let {
		code = '',
		language = 'javascript' as BundledLanguage,
		theme = 'catppuccin-mocha' as BundledTheme,
		caption = '',
		tabSize = 4
	}: {
		code?: string;
		language?: BundledLanguage;
		theme?: BundledTheme;
		caption?: string;
		tabSize?: number;
	} = $props();

	let highlighted = $state('');
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Function to trim leading whitespace from code strings
	function trimCode(code: string) {
		const lines = code.split('\n');

		// Remove empty lines at the beginning and end
		while (lines.length > 0 && lines[0].trim() === '') {
			lines.shift();
		}
		while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
			lines.pop();
		}

		if (lines.length === 0) return '';

		// Find the minimum indentation (excluding empty lines)
		const minIndent = lines
			.filter((line) => line.trim() !== '')
			.reduce((min, line) => {
				const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
				return Math.min(min, indent);
			}, Infinity);

		// Remove the minimum indentation from all lines
		return lines.map((line) => line.slice(minIndent)).join('\n');
	}

	onMount(async () => {
		try {
			// Automatically trim the code before highlighting
			const trimmedCode = trimCode(code);
			highlighted = await highlightCode(trimmedCode, language, theme);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			isLoading = false;
		}
	});
</script>

<div class="codeblock prose prose-invert max-w-none" style="--tab-size: {tabSize}">
	{#if isLoading}
		<pre><code>Loading code snippet…</code></pre>
	{:else if error}
		<pre class="error"><code>Error: {error}</code></pre>
	{:else}
		<div class="code-container">
			{@html highlighted}
		</div>
		{#if caption}
			<div class="caption">{caption}</div>
		{/if}
	{/if}
</div>

<style>
	/* .codeblock {
		margin: 1.5rem 0;
	} */

	/* .codeblock pre {
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		background: #0d1117;
		color: #c9d1d9;
		tab-size: var(--tab-size, 2);
		-moz-tab-size: var(--tab-size, 2);
		-o-tab-size: var(--tab-size, 2);
	} */

	/* .codeblock code {
		font-family: 'Fira Code', monospace;
		font-size: 0.95rem;
		tab-size: var(--tab-size, 2);
		-moz-tab-size: var(--tab-size, 2);
		-o-tab-size: var(--tab-size, 2);
	} */

	/* .code-container {
		position: relative;
	} */

	.error {
		background: #2c1315;
		color: #f87171;
	}

	/* .caption {
		font-size: 0.875rem;
		text-align: center;
		margin-top: 0.5rem;
		opacity: 0.8;
	} */

	/* Make Shiki's generated HTML work nicely with your CSS */
	:global(.codeblock .shiki) {
		padding: 1rem;
	
		overflow-x: auto;
		background: #0d1117;
		tab-size: var(--tab-size, 2);
		-moz-tab-size: var(--tab-size, 2);
		-o-tab-size: var(--tab-size, 2);
	}

	:global(.codeblock .shiki code) {
		font-family: 'Fira Code', monospace;
		/* font-size: 1rem; */
		display: block;
		tab-size: var(--tab-size, 2);
		-moz-tab-size: var(--tab-size, 2);
		-o-tab-size: var(--tab-size, 2);
	}

	:global(.codeblock .shiki pre) {
		tab-size: var(--tab-size, 2);
		-moz-tab-size: var(--tab-size, 2);
		-o-tab-size: var(--tab-size, 2);
	}
</style>
