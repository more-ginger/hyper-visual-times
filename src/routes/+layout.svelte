<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav>
	<a href="/network">Network vis</a>
	<a href="/flows">Flow vis</a>
</nav>

{@render children()}
