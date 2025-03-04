<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div>
<nav class="p-4">
	<div class="border border-black inline-block px-2"><a href="/">Back</a></div>
	<div class="border border-black inline-block px-2"><a href="/network">Network vis</a></div>
	<div class="border border-black inline-block px-2"><a href="/flows">Flow vis</a></div>
</nav>

{@render children()}
</div>
