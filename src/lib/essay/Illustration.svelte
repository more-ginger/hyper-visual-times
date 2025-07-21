<script lang="ts">
	import IllustrationDesktop from './IllustrationDesktop.svelte';
	import IllustrationMobile from './IllustrationMobile.svelte';
	let { step, bodyWidth } = $props();

	let viewBox = $state({ x: 0, y: 0, width: 2400, height: 3000 });
	let currentStep = $state(-1); // Track the current step to avoid unnecessary updates

	// SVG dimensions
	const svgWidth = $derived(bodyWidth > 820 ? 4051.08 : 2383.94);
	const svgHeight = $derived(bodyWidth > 820 ? 3036.82 : 2944.08);

	// Animation state
	let isAnimating = $state(false);
	let animationFrame: number;

	// Define zoom positions for each step
	const zoomPositions = [
		// Step 0: Default view (no zoom)
		{ x: 0, y: 10, width: svgWidth, height: svgHeight },
		// Step 1: Zoom to top-center, individual layer
		{ x: 0, y: svgHeight / 10, width: svgWidth, height: svgHeight * 0.2 },
		//Step 2: Citizen journalists
		{
			x: svgWidth * 0.28,
			y: svgHeight / 6,
			width: svgWidth * 0.5,
			height: svgHeight * 0.2
		},
		//Step 3: Bridge between layers
		{
			x: svgWidth * 0.6,
			y: 0,
			width: svgWidth * 0.5,
			height: svgHeight * 0.5
		},
		// Step 4: Zoom to bottom-center, societal layer
		{
			x: 0,
			y: svgHeight * 0.7,
			width: svgWidth,
			height: svgHeight * 0.5,
			zoom: 2
		},
		// Step 5: Zoom to bottom-center, societal layer – focus on platforms
		{
			x: 0,
			y: svgHeight * 0.6,
			width: svgWidth * 0.4,
			height: svgHeight * 0.5,
			zoom: 2
		},
		// Step 6: Bridge between societal and material
		{
			x: svgWidth * 0.2,
			y: svgHeight * 0.3,
			width: svgWidth * 0.8,
			height: svgHeight * 0.5,
			zoom: 2
		},
		// Step 7: Zoom to center, material layer
		{ x: 0, y: svgHeight * 0.5, width: svgWidth, height: svgHeight * 0.2, zoom: 2 },
		// Step 8: Zoom into article structure
		{
			x: svgWidth * 0.3,
			y: svgHeight * 0.5,
			width: svgWidth * 0.8,
			height: svgHeight * 0.25,
			zoom: 3
		},
		// Step 9: Zoom into rules label
		{
			x: svgWidth * 0.2,
			y: svgHeight * 0.4,
			width: svgWidth * 0.5,
			height: svgHeight * 0.1,
			zoom: 3
		},
		// Step 10: Zoom into SEO labels
		{
			x: svgWidth * 0.2,
			y: svgHeight * 0.52,
			width: svgWidth * 0.3,
			height: svgHeight * 0.1,
			zoom: 3
		},
		// Step 11: Zoom into article structure
		{
			x: svgWidth * 0.35,
			y: svgHeight * 0.5,
			width: svgWidth * 0.5,
			height: svgHeight * 0.1,
			zoom: 3
		},
		// Step 12: Zoom out
		{ x: 0, y: 10, width: svgWidth, height: svgHeight }
	];
	// Easing function for smooth animations
	function easeInOutCubic(t: number): number {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	// Animate viewBox transition
	function animateToPosition(
		startViewBox: typeof viewBox,
		targetPosition: (typeof zoomPositions)[0],
		duration: number = 800
	) {
		if (isAnimating && animationFrame) {
			cancelAnimationFrame(animationFrame);
		}

		isAnimating = true;
		const startTime = performance.now();

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeInOutCubic(progress);

			// Interpolate between start and target positions
			viewBox = {
				x: startViewBox.x + (targetPosition.x - startViewBox.x) * easedProgress,
				y: startViewBox.y + (targetPosition.y - startViewBox.y) * easedProgress,
				width: startViewBox.width + (targetPosition.width - startViewBox.width) * easedProgress,
				height: startViewBox.height + (targetPosition.height - startViewBox.height) * easedProgress
			};

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			} else {
				isAnimating = false;
			}
		}

		animationFrame = requestAnimationFrame(animate);
	}

	// Update viewBox based on current step with smooth transitions
	$effect(() => {
		// Only update if step actually changed
		if (step !== currentStep) {
			currentStep = step;
			let targetPosition = zoomPositions[step] || zoomPositions[0];
			const currentViewBox = { ...viewBox };

			// Animate to new position
			animateToPosition(currentViewBox, targetPosition);
		}
	});
	//width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
</script>

{#if bodyWidth > 820}
	<IllustrationDesktop {viewBox} />
{:else}
	<IllustrationMobile {viewBox} />
{/if}
