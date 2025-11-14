<script lang="ts">
	import { selectedOutlet} from '$lib/utils/state.images.svelte.ts';
</script>
<div class="flex justify-center p-2 lg:justify-end lg:p-0 bg-[var(--color-ivory-default)] w-max z-50">
	<div class="m-2 grow">
		<button
			class={ "flex gap-2 " + ($selectedOutlet == 'Zeit' ? `bg-zeit-light` : `bg-default`)}
			onclick={() => {
				selectedOutlet.set('Zeit');
			}}><img src="icons/ui-interact.svg" class="max-w-min"/>Zeit Online</button
		>
	</div>
	<img class="inline max-w-[20px]" src="icons/ui-switch.svg" alt="Switch with The New York Times" />
	<div class="m-2 grow">
		<button
			class={"flex gap-2 " + ($selectedOutlet == 'NYT' ? `bg-nyt-light` : `bg-default`)}
			onclick={() => {
				selectedOutlet.set('NYT');
			}}><img src="icons/ui-interact.svg" class="max-w-min"/>The New York Times</button
		>
	</div>
</div>
