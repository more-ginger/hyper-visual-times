<script lang="ts">
	import BubbleChart from '$lib/topics/BubbleChart.svelte';
</script>

<div class="base m-auto flex pt-20 md:w-full">
	<div class="flex h-[90vh] px-2 pb-2 md:w-full">
		<div class="w-4/12">
			<div>
				<h1>Some title</h1>
			</div>
		</div>
		<div class="w-8/12">
			<BubbleChart />
		</div>
	</div>
</div>
