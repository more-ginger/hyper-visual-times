<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import World from '../../content/data/places/world.json';

	const { nodes, links, selectedOutlet, primaryCountryKey, dataDomain } = $props();
	const darkIvoryHex = '#82561b';
	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');
	let canvas: HTMLCanvasElement | null = $state(null);
	let context: CanvasRenderingContext2D | null = $state(null);
	let width = $state(0);
	let height = $state(0);
	let dpi = 1;

	let projection = $derived(d3.geoNaturalEarth1());
	let path = $derived(d3.geoPath(projection, context));
	let graticule = d3.geoGraticule10();
	let outline = { type: 'Sphere' };

	let primaryCountryNode = $derived(
		nodes.find((d: { country: string }) => d.country == primaryCountryKey)
	);

	$inspect(primaryCountryNode);

	const coverageDomain = $derived(d3.extent(nodes.map((node) => node[`count_${selectedOutlet}`])));
	const coverageScale = $derived(
		d3.scaleSequential().range([lightAccentHex, darkAccentHex]).domain(coverageDomain)
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
				weight: link.weight
			};
		})
	);

	const linkWeightDomain = $derived(d3.extent(sourceTargetCoordinates.map((link) => link.weight)));
	const linkWeightScale = $derived(d3.scaleLinear().domain(linkWeightDomain).range([1, 20]));

	$effect(() => {
		if (canvas) {
			context = canvas.getContext('2d');

			canvas.style.width = '100%';
			canvas.style.height = '100%';

			dpi = window.devicePixelRatio || 1;
			canvas.width = canvas.offsetWidth * dpi;
			canvas.height = canvas.offsetHeight * dpi;
			width = canvas.offsetWidth * dpi;
			height = canvas.offsetHeight * dpi;

			projection.fitExtent(
				[
					[10, 0],
					[width / 2 - 10, height / 2]
				],
				World
			);

			// projection.center([-3.6833306, 40.3999984]);
			// projection.scale(400);

			if (context) {
				context.scale(dpi, dpi);
				context.beginPath(),
					path(graticule),
					(context.strokeStyle = 'white'),
					(context.lineWidth = 1);
				context.stroke();

				context.beginPath(),
					path(World),
					(context.strokeStyle = darkIvoryHex),
					(context.fillStyle = 'white'),
					context.fill();

				World.features.map((feature) => {
					nodes.map((node: { iso: string; shared_articles: [] }) => {
						if (node.iso === feature.properties.adm0_iso && context) {
							context.beginPath(),
								path(feature.geometry),
								(context.fillStyle =
									primaryCountryNode.iso === feature.properties.adm0_iso ? 'red' : lightAccentHex),
								context.fill();
						}
					});
				});

				sourceTargetCoordinates.map((line) => {
					console.log(line.priority);
					context?.beginPath(),
						(context.lineCap = 'round'),
						(context.lineWidth = line.priority === 0 ? 0.00001 : linkWeightScale(line.weight)),
						(context.strokeStyle = darkAccentHex);
					path(line), context?.stroke();
				});

				context.beginPath(),
					path(World),
					(context.strokeStyle = darkAccentHex),
					(context.fillStyle = 'transparent'),
					(context.lineWidth = 0.5),
					context.fill(),
					context.stroke();

				context.beginPath(),
					path(outline),
					context.clip(),
					(context.strokeStyle = darkAccentHex),
					(context.lineWidth = 5),
					(context.fillStyle = 'transparent'),
					context.stroke();
			}
		}
	});
</script>

<div class="flex">
	<div class="mr-2 w-1/3 rounded-xl border bg-red-100">Titles card</div>
	<div class="h-150 w-2/3 rounded-xl" bind:clientWidth={width} bind:clientHeight={height}>
		<canvas bind:this={canvas} {width} {height}></canvas>
	</div>
</div>
