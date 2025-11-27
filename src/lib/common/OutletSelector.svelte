<script lang="ts">
	import { LinkHandler } from '$lib/utils/pathhelper.svelte';
	import { selectedOutlet } from '$lib/utils/state.images.svelte.ts';
</script>

<div
	class="z-1 flex w-max justify-center bg-[var(--color-ivory-default)] p-2 lg:justify-end lg:p-0"
>
	<div class="m-2 grow">
		<button
			class={'flex gap-2 ' + ($selectedOutlet == 'Zeit' ? `bg-zeit-light` : `bg-default`)}
			onclick={() => {
				selectedOutlet.set('Zeit');
			}}
			><img src={LinkHandler("/icons/ui-interact.svg")} class="max-w-min" alt="Switch to Zeit Online" />Zeit Online</button
		>
	</div>
	<img class="inline max-w-[20px]" src={LinkHandler("/icons/ui-switch.svg")} alt="Switch with The New York Times" />
	<div class="m-2 grow">
		<button
			class={'flex gap-2 ' + ($selectedOutlet == 'NYT' ? `bg-nyt-light` : `bg-default`)}
			onclick={() => {
				selectedOutlet.set('NYT');
			}}
			><img src={LinkHandler("/icons/ui-interact.svg")} class="max-w-min" alt="Switch to The New York Times" />The
			New York Times</button
		>
	</div>
</div>
