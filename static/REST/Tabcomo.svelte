<script lang="ts">
	import { scale } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	interface Tab {
		id: string;
		label: string;
		icon?: any;
	}

	let {
		tabs = [],
		activeTab = '',
		onTabChange = () => {}
	} = $props<{
		tabs: Tab[];
		activeTab: string;
		onTabChange: (tabId: string) => void;
	}>();

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
					<svelte:component this={tab.icon} size={16} />
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
					{#if tab.id === 'documentation'}
						<slot name="documentation" />
					{:else if tab.id === 'usage'}
						<slot name="usage" />
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
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.tabs-header {
		display: flex;
		border-bottom: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	.tab-button {
		flex: 1;
		padding: 12px 16px;
		border: none;
		background: transparent;
		color: #64748b;
		font-weight: 500;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 8px;
		justify-content: center;
		border-bottom: 2px solid transparent;
		outline: none;
	}

	.tab-button:hover {
		background: #f1f5f9;
		color: #475569;
	}

	.tab-button:focus {
		box-shadow: 0 0 0 2px #3b82f6;
		z-index: 1;
	}

	.tab-button.active {
		background: #ffffff;
		color: #3b82f6;
		border-bottom-color: #3b82f6;
		font-weight: 600;
	}

	.tabs-content {
		min-height: 400px;
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
			padding: 10px 12px;
			font-size: 13px;
		}

		.tab-panel {
			padding: 16px;
		}
	}
</style>
