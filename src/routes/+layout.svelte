<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/state';
	import Load from '$lib/common/Load.svelte';
	let { children } = $props();
	let isDropdownOpen = $state(false);

	const handleDropdownClick = () => {
		isDropdownOpen = !isDropdownOpen; // toggle state on click
	};

	const handleDropdownFocusLoss = (event: FocusEvent) => {
		const { relatedTarget, currentTarget } = event;
		// use "focusout" event to ensure that we can close the dropdown when clicking
		// outside or when we leave the dropdown with the "Tab" button
		if (
			relatedTarget instanceof HTMLElement &&
			currentTarget instanceof HTMLElement &&
			currentTarget.contains(relatedTarget)
		)
			return;

		isDropdownOpen = false;
	};
</script>

<div class="m-auto w-full max-w-7xl lg:border-x">
	<div class="sticky top-0 z-50 mx-2">
		<nav class="bg-ivory-default absolute w-full border-b p-4">
			<div class="m-auto flex items-center justify-between">
				<div class="w-2/3">
					<a href="/" data-sveltekit-preload-data="hover">
						<div class="flex w-full">
							<img
								class="max-h-full w-1/12 min-w-[50px] object-scale-down"
								src="img/pn-logo.png"
								alt="Panopticum News half circle logo"
							/>
							<span class="ml-2 w-11/12 self-center text-lg focus:italic">Panopticum News</span>
						</div>
					</a>
				</div>
				<div class="flex w-1/3 items-center justify-end">
					<div onfocusout={handleDropdownFocusLoss} class="relative inline-block text-left">
						<div>
							<button
								onclick={handleDropdownClick}
								type="button"
								class="flex w-full cursor-pointer items-center justify-center gap-x-1.5 border-none pr-0 pl-3 text-sm"
								id="menu-button"
								aria-expanded="true"
								aria-haspopup="true"
							>
								<span class="hidden text-lg md:block">Chapters</span>
								<span class="max-w-16">
									<svg
										width="100%"
										height="30px"
										viewBox="0 0 46 21"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
										data-slot="icon"
									>
										<circle
											cx="35"
											cy="10.5"
											r="10"
											fill="black"
											stroke="#fcf4e9"
											stroke-width="2"
										/>
										<text x="32" y="14" fill="#fcf4e9" font-size="10">3</text>
										<circle cx="23" cy="10.5" r="10" fill="black" stroke="#fcf4e9" />
										<text x="20" y="14" fill="#fcf4e9" font-size="10">2</text>
										<circle cx="11" cy="10.5" r="10" fill="black" stroke="#fcf4e9" />
										<text x="9" y="14" fill="#fcf4e9" font-size="10">1</text>
									</svg>
								</span>
							</button>
						</div>
						<div
							style:visibility={isDropdownOpen ? 'visible' : 'hidden'}
							class="bg-ivory-default absolute top-8 right-0 z-10 mt-2 mt-2 w-80 rounded-md border shadow-lg ring-1 ring-black/5 focus:outline-hidden"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="menu-button"
							tabindex="-1"
						>
							<div class="py-1" role="none">
								<!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->
								<a
									href="/places"
									data-sveltekit-preload-code="eager"
									data-sveltekit-preload-data="hover"
									class="block border-b p-4 hover:underline focus:italic"
									role="menuitem"
									tabindex="-1"
									id="menu-item-0">Chapter 1: The Geo-politics of news</a
								>
								<a
									href="/"
									class="pointer-events-none block cursor-not-allowed border-b p-4"
									role="menuitem"
									tabindex="-1"
									id="menu-item-1">Chapter 2: Discoursive interrelations</a
								>
								<a
									href="/"
									class="cursor-not-allowedborder-b pointer-events-none block p-4"
									role="menuitem"
									tabindex="-1"
									id="menu-item-2">Chapter 3: The language of images</a
								>
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
	</div>
	{#if navigating.to}
		<Load />
	{/if}

	<div class="-z-10">
		{@render children()}
	</div>
</div>
