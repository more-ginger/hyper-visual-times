<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	const logos = ['img/logo1.svg', 'img/logo2.svg'];

	let index = 0;
	let interval;

	onMount(() => {
		interval = setInterval(() => {
			index = (index + 1) % logos.length;
		}, 5000);
	});
</script>

<div class="z-20 flex h-full items-center">
	{#key index}
		<img
			class="sticky top-20 m-2 w-full"
			src={logos[index]}
			alt="The Hyper-Visual Times logo"
			transition:fade={{ duration: 300 }}
		/>
	{/key}
</div>
