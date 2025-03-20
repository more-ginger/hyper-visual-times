<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="w-full px-4 bg-green-100">
<nav class="w-full px-4 mt-4 border-b flex justify-between">
	<div class="w-1/2 bg-red-100">
		<a href="/">
			<p>Panopticum News</p>
		</a>
	</div>
	<div>
		<div>
			<button id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar" data-dropdown-placement="right-start" type="button">Menu placeholder</button>
			<div id="dropdownNavbar" class="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600">
				<ul>
					<li>
						<a href="/places">Chapter 1: Places</a>
					</li>
					<li>
						<a href="/">Chapter 2: People</a>
					</li>
					<li>
						<a href="/">Chapter 3: Discourse</a>
					</li>
				</ul>
			</div>
		</div>
	</div>

</nav>

{@render children()}
</div>
