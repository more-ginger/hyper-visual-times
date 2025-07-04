<script lang="ts">
	import '../app.css';
	let { children } = $props();
	let isDropdownOpen = $state(false);

	const handleDropdownClick = () => {
    isDropdownOpen = !isDropdownOpen // togle state on click
  }

  const handleDropdownFocusLoss = (event: FocusEvent) => {
	const { relatedTarget, currentTarget } = event;
    // use "focusout" event to ensure that we can close the dropdown when clicking outside or when we leave the dropdown with the "Tab" button
	if (relatedTarget instanceof HTMLElement 
		&& currentTarget instanceof HTMLElement 
		&& currentTarget.contains(relatedTarget)) return
    
	isDropdownOpen = false
  }
</script>

<div class="w-full max-w-7xl border-x m-auto">
	<div class="sticky top-0 z-50">
		<nav class="bg-ivory-default w-full px-4 pb-2 border-b 2xl:border-l absolute">
			<div class="m-auto pt-2 flex justify-between">
				<div class="w-1/2">
					<a href="/">
						<div class="flex w-full">
							<img class="w-1/12 max-h-full object-fit" src="img/pn-logo.png" alt="Panopticum News half circle logo"/>
							<span class="w-11/12 ml-2 self-center">Panopticum News</span>
						</div>
					</a>
				</div>
				<div>
					<div onfocusout={handleDropdownFocusLoss} class="relative inline-block text-left">
						<div>
						<button onclick={handleDropdownClick} type="button" class="inline-flex w-full justify-center border-none gap-x-1.5 px-3 text-sm cursor-pointer" id="menu-button" aria-expanded="true" aria-haspopup="true">
							<span>Chapters</span>
							<svg width="46" height="21" viewBox="0 0 46 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-slot="icon">
								<circle cx="35" cy="10.5" r="10" fill="black" stroke="#fcf4e9" stroke-width="2"/>
								<circle cx="23" cy="10.5" r="10" fill="black" stroke="#fcf4e9"/>
								<circle cx="11" cy="10.5" r="10" fill="black" stroke="#fcf4e9"/>
							</svg>					
						</button>
						</div>
						<div style:visibility={isDropdownOpen ? 'visible' : 'hidden'} class="absolute top-10 right-0 mt-2 z-10 mt-2 w-56  border bg-ivory-default rounded-md ring-1 ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
						<div class="py-1" role="none">
							<!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->
							<a href="/places" class="block px-4 py-2 hover:underline" role="menuitem" tabindex="-1" id="menu-item-0">Chapter 1: Places</a>
							<a href="/" class="block px-4 py-2" role="menuitem" tabindex="-1" id="menu-item-1">Chapter 2: Images</a>
							<a href="/" class="block px-4 py-2" role="menuitem" tabindex="-1" id="menu-item-2">Chapter 3: Text</a>
						</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
	</div>
	<div class="-z-10">
	{@render children()}
	</div>
	<footer class="sticky bottom-0 bg-ivory-default w-full px-4 pb-2 border-t 2xl:border-l z-40 mt-10">
		<button class="mt-2">
			<span>Scroll back to top</span>
			<img class="rotate-180 inline ml-2" src="icons/ui-scroll.svg" alt="Arrow pointing upwards"/>
		</button>
	</footer>
</div>
