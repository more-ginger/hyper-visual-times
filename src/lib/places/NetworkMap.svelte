<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import World from '../../content/data/places/world.json';

	const { nodes, links, selectedOutlet, primaryCountryKey } = $props();
	const darkIvoryHex = '#82561b';
	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');
	let canvas: HTMLCanvasElement | null = $state(null);
	let blankCanvas: HTMLCanvasElement | null = $state(null);

	let context: CanvasRenderingContext2D | null = $state(null);
	let w = $state(0);
	let h = $state(0);
	let dpi = 1;

	let scaleRatio = $derived((130 * w + 10000) / 4);

	let projection = $derived(
		d3
			.geoNaturalEarth1()
			.fitSize([w, h], World)
			.scale(scaleRatio)
			.translate([w / 3.5, h / 4])
	);

	let path = $derived(d3.geoPath(projection, context));

	let primaryCountryNode = $derived(
		nodes.find((d: { country: string }) => d.country == primaryCountryKey)
	);

	let primaryCountryFeature = $derived(
		World.features.find((feature) => feature.properties.adm0_iso === primaryCountryNode.iso)
	);

	const sourceTargetCoordinates = $derived(
		links.map((link: { source_iso: string; target_iso: string }) => {
			const sourceFeature = World.features.find(
				(feature) => feature.properties.adm0_iso === link.source_iso
			);

			const targetFeature = World.features.find(
				(feature) => feature.properties.adm0_iso === link.target_iso
			);

			const sourceCentroidCoords = [
				sourceFeature?.properties.label_x,
				sourceFeature?.properties.label_y
			];
			const targetCentroidCoords = [
				targetFeature?.properties.label_x,
				targetFeature?.properties.label_y
			];

			return {
				type: 'LineString',
				coordinates: [sourceCentroidCoords, targetCentroidCoords],
				priority: link.priority,
				weight: link.weight,
				targetCoords: targetCentroidCoords
			};
		})
	);

	const linkWeightDomain = $derived(d3.extent(sourceTargetCoordinates.map((link) => link.weight)));
	const linkWeightScale = $derived(d3.scaleLinear().domain(linkWeightDomain).range([0.4, 5]));

	function renderCanvasContent() {
		if (context) {
			context.beginPath(), context.arc(5, 5, 10, 0, 2 * Math.PI), context.fill();

			console.log(path(World));

			context.beginPath(),
				path(World),
				(context.strokeStyle = darkIvoryHex),
				(context.fillStyle = 'white'),
				context.fill();

			// World.features.map((feature) => {
			// 	nodes.map((node: { iso: string; shared_articles: [] }) => {
			// 		if (node.iso === feature.properties.adm0_iso && context) {
			// 			context.beginPath(),
			// 				path(feature.geometry),
			// 				(context.strokeStyle =
			// 					primaryCountryNode.iso === feature.properties.adm0_iso ? 'white' : 'transparent'),
			// 				(context.fillStyle =
			// 					primaryCountryNode.iso === feature.properties.adm0_iso
			// 						? darkAccentHex
			// 						: lightAccentHex),
			// 				context.fill(),
			// 				context?.stroke();
			// 		}
			// 	});
			// });

			// context.beginPath(),
			// 	path(World),
			// 	(context.strokeStyle = darkIvoryHex),
			// 	(context.fillStyle = 'transparent'),
			// 	(context.lineWidth = 0.5),
			// 	context.fill(),
			// 	context.stroke();

			// context.beginPath(),
			// 	path(outline),
			// 	context.clip(),
			// 	(context.strokeStyle = '#d9b28b'),
			// 	(context.lineWidth = 3),
			// 	(context.fillStyle = 'transparent'),
			// 	context.stroke();

			// sourceTargetCoordinates.map((line) => {
			// 	if (context) {
			// 		context?.beginPath(),
			// 			(context.lineCap = 'round'),
			// 			(context.lineWidth = line.priority === 0 ? 0.00001 : linkWeightScale(line.weight)),
			// 			(context.strokeStyle = darkAccentHex);
			// 		path(line), context?.stroke();

			// 		const targetCoords = projection(line.targetCoords);
			// 		context?.beginPath(),
			// 			context?.arc(targetCoords[0], targetCoords[1], 1.5, 0, 2 * Math.PI),
			// 			(context.fillStyle = darkAccentHex);
			// 		context?.fill();
			// 	}
			// });

			// const primaryCountryCentroid = projection([
			// 	primaryCountryFeature?.properties.label_x,
			// 	primaryCountryFeature?.properties.label_y
			// ]);

			// context?.beginPath(),
			// 	context.arc(primaryCountryCentroid[0], primaryCountryCentroid[1], 3, 0, 2 * Math.PI),
			// 	(context.fillStyle = darkAccentHex),
			// 	context.fill(),
			// 	(context.strokeStyle = 'white'),
			// 	(context.lineWidth = 2),
			// 	context.stroke();
		}
	}

	// function zoomed(transform) {
	// 	if (canvas && context) {
	// 		context.clearRect(0, 0, width, height);
	// 		context.save();

	// 		if (transform) {
	// 			projection.scale(transform.k / (2 * Math.PI));
	// 			renderCanvasContent();
	// 		}

	// 		context.restore();
	// 	}
	// }

	$effect(() => {
		if (canvas && w && h) {
			context = canvas.getContext('2d');
			console.log(scaleRatio);
			// canvas.style.width = '100%';
			// canvas.style.height = '100%';

			// dpi = window.devicePixelRatio || 1;
			// canvas.width = canvas.offsetWidth * dpi;
			// canvas.height = canvas.offsetHeight * dpi;
			// w = canvas.offsetWidth * dpi;
			// h = canvas.offsetHeight * dpi;

			// projection.fitExtent(
			// 	[
			// 		[10, 10],
			// 		[canvas.offsetWidth - 10, canvas.offsetHeight]
			// 	],
			// 	World
			// );

			// Store the base scale after fitting the extent

			// Set initial translation
			//projection.translate([width / 3.5, height / 4]);

			// const zoom = d3
			// 	.zoom()
			// 	.scaleExtent([1000, 100000])
			// 	.extent([
			// 		[0, 0],
			// 		[width, height]
			// 	])
			// 	.on('zoom', ({ transform }) => zoomed(transform));

			if (context) {
				//context.scale(dpi, dpi);
				renderCanvasContent();
				console.log('is main canvas empty?', blankCanvas?.toDataURL() == canvas.toDataURL());

				// d3.select(canvas)
				// 	.call(zoom)
				// 	.call(
				// 		zoom.transform,
				// 		d3.zoomIdentity
				// 			.translate(width / 2, height / 2)
				// 			.scale(-initialScale)
				// 			.translate(...projection(initialCenter))
				// 			.scale(-1)
				// 	);
			}
		}
	});
</script>

<div class="relative">
	<div class="h-200 w-full rounded-xl" bind:clientWidth={w} bind:clientHeight={h}>
		<canvas class="bg-red-100" bind:this={canvas} width={w} height={h}></canvas>
		<canvas class="bg-yellow-100" bind:this={blankCanvas} width={w} height={h} style="display:none"
		></canvas>
	</div>

	<div class="bg-ivory-default border-ivory-dark absolute bottom-0 h-100 w-80 rounded-xl border">
		<div class="h-full">
			<div class="h-14 border-b">
				<p class="m-2">
					Countries sharing coverage with {primaryCountryKey} in {selectedOutlet}
				</p>
			</div>
			<div class="h-83 overflow-scroll p-2">
				{#each nodes as node}
					{#if node.country !== primaryCountryKey}
						<div>{node.country}</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
