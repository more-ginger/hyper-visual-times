<script lang="ts">
	import { onMount, onDestroy, setContext } from 'svelte';
	let { w, h, contextName = 'canvas', children } = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let pendingInvalidation: boolean = false;
	let frameId: number | undefined;

	const drawFunctions: Array<(ctx: CanvasRenderingContext2D | null) => void> = [];

	function scaleCanvas(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number
	) {
		const devicePixelRatio = window.devicePixelRatio || 1;

		canvas.width = width * devicePixelRatio;
		canvas.height = height * devicePixelRatio;
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';

		ctx.scale(devicePixelRatio, devicePixelRatio);
	}

	function update() {
		if (!ctx) return;

		ctx.clearRect(0, 0, w, h);

		drawFunctions.forEach((fn) => {
			ctx?.save();
			fn(ctx);
			ctx?.restore();
		});
		pendingInvalidation = false;
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
	});

	onDestroy(() => {
		if (frameId) {
			cancelAnimationFrame(frameId);
		}
	});

	setContext(contextName, {
		register(fn: (ctx: CanvasRenderingContext2D | null) => void) {
			drawFunctions.push(fn);
		},
		deregister(fn: (ctx: CanvasRenderingContext2D | null) => void) {
			drawFunctions.splice(drawFunctions.indexOf(fn), 1);
		},
		invalidate() {
			if (pendingInvalidation) return;
			pendingInvalidation = true;
			frameId = requestAnimationFrame(update);
		}
	});

	$effect(() => {
		if (canvas && ctx) {
			scaleCanvas(canvas, ctx, w, h);
		}
	});
</script>

<canvas bind:this={canvas}>
	{@render children?.()}
</canvas>
