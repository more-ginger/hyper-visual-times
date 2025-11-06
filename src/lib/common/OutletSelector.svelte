<script lang="ts">
	import { selectedOutlet} from '$lib/utils/state.images.svelte.ts';
</script>
<div class="flex justify-center p-2 lg:justify-end lg:p-0 bg-[var(--color-ivory-default)] w-max z-50 rounded-xl border border-black px-2 py-1">
	<div class="m-2">
		<button
			class={$selectedOutlet == 'Zeit' ? `bg-zeit-light` : `bg-default`}
			onclick={() => {
				selectedOutlet.set('Zeit');
			}}>Zeit</button
		>
	</div>
	<img class="inline" src="icons/ui-switch.svg" alt="Switch with The New York Times" />
	<div class="m-2">
		<button
			class={$selectedOutlet == 'NYT' ? `bg-nyt-light` : `bg-default`}
			onclick={() => {
				selectedOutlet.set('NYT');
			}}>The New York Times</button
		>
	</div>
</div>
