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

<div class="z-20 flex h-[75vh] items-center">
	<div class="sticky top-10 w-full">
		{#key index}
			<div class="relative">
				<img
					class="absolute"
					src={logos[index]}
					alt="The Hyper-Visual Times logo"
					transition:fade={{ duration: 100 }}
				/>
			</div>
		{/key}
	</div>
</div>
