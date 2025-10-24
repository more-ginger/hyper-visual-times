<script lang="ts">
    let { currentOutlet = $bindable('Zeit') } = $props();
	function switchPrimaryCountry() {
		if (currentOutlet === 'NYT') {
			currentOutlet = 'Zeit';
		} else {
			currentOutlet = 'NYT';
		}
	}
</script>

{#if currentOutlet == 'Zeit'}
	<button onclick={switchPrimaryCountry}>
		<span class="text-zeit-dark">Zeit Online</span>
		<img class="inline" src="icons/ui-switch.svg" alt="Switch with The New York Times" />
	</button>
{:else}
	<button onclick={switchPrimaryCountry}>
		<span class="text-nyt-dark">The New York Times</span>
		<img class="inline" src="icons/ui-switch.svg" alt="Switch with Zeit" />
	</button>
{/if}
