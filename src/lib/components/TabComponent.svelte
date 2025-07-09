<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	interface Tab {
		id: string;
		label: string;
		icon?: any;
	}

	let {
		tabs = [],
		activeTab = '',
		onTabChange = () => {},
		documentation,
		usage,
		accessibility
	}: {
		tabs: Tab[];
		activeTab: string;
		onTabChange: (tabId: string) => void;
		documentation?: Snippet;
		usage?: Snippet;
		accessibility?: Snippet;
	} = $props();

	function handleTabClick(tabId: string) {
		if (activeTab !== tabId) {
			onTabChange(tabId);
		}
	}

	function handleKeydown(event: KeyboardEvent, tabId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleTabClick(tabId);
		}
	}
</script>

<div class="tabs-container">
	<div class="tabs-header" role="tablist">
		{#each tabs as tab}
			<button
				class="tab-button"
				class:active={activeTab === tab.id}
				role="tab"
				aria-selected={activeTab === tab.id}
				aria-controls={`panel-${tab.id}`}
				id={`tab-${tab.id}`}
				tabindex={activeTab === tab.id ? 0 : -1}
				onclick={() => handleTabClick(tab.id)}
				onkeydown={(e) => handleKeydown(e, tab.id)}
				transition:scale={{ duration: 200, easing: cubicInOut }}
			>
				{#if tab.icon}
					{@const IconComponent = tab.icon}
					<IconComponent size={16} />
				{/if}
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="tabs-content">
		{#each tabs as tab}
			<div
				id={`panel-${tab.id}`}
				class="tab-panel"
				class:active={activeTab === tab.id}
				role="tabpanel"
				aria-labelledby={`tab-${tab.id}`}
				tabindex="0"
			>
				{#if activeTab === tab.id}
					{#if tab.id === 'documentation' && documentation}
						{@render documentation()}
					{:else if tab.id === 'usage' && usage}
						{@render usage()}
					{:else if tab.id === 'accessibility' && accessibility}
						{@render accessibility()}
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.tabs-container {
		width: 100%;
		background: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.tabs-header {
		display: flex;
		border-bottom: 2px solid #e2e8f0;
		background: #f8fafc;
	}

	.tab-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 24px;
		border: none;
		background: transparent;
		color: #64748b;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		outline: none;
		position: relative;
	}

	.tab-button:hover {
		background: #e2e8f0;
		color: #475569;
	}

	.tab-button:focus {
		box-shadow: inset 0 0 0 2px #3b82f6;
	}

	.tab-button.active {
		background: #ffffff;
		color: #3b82f6;
		font-weight: 600;
	}

	.tab-button.active::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		right: 0;
		height: 2px;
		background: #3b82f6;
	}

	.tabs-content {
		background: #ffffff;
	}

	.tab-panel {
		padding: 24px;
		display: none;
		outline: none;
	}

	.tab-panel.active {
		display: block;
	}

	.tab-panel:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}

	@media (max-width: 768px) {
		.tab-button {
			padding: 12px 16px;
			font-size: 13px;
		}

		.tab-panel {
			padding: 16px;
		}
	}
</style>
