<script lang="ts">
	// @ts-expect-error
	import * as d3 from 'd3';
	import World from '../../content/data/places/world.json';

	const { nodes, links, selectedOutlet, primaryCountryKey } = $props();
	const darkIvoryHex = '#82561b';
	const darkAccentHex = $derived(selectedOutlet === 'zeit' ? '#0036AC' : '#ECA547');
	const lightAccentHex = $derived(selectedOutlet === 'zeit' ? '#D9E5FF' : '#FFE8BA');
	let canvas: HTMLCanvasElement | null = $state(null);
	let context: CanvasRenderingContext2D | null = $state(null);
	let width = $state(0);
	let height = $state(0);
	let dpi = 1;

	let projection = $state(d3.geoNaturalEarth1());
	let path = $derived(d3.geoPath(projection, context));
	let graticule = d3.geoGraticule10();
	let outline = { type: 'Sphere' };
	let baseScale = $state(projection.scale());

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
	const linkWeightScale = $derived(d3.scaleLinear().domain(linkWeightDomain).range([0.45, 5]));

	function renderCanvasContent() {
		if (context) {
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
							(context.strokeStyle =
								primaryCountryNode.iso === feature.properties.adm0_iso ? 'white' : 'transparent'),
							(context.fillStyle =
								primaryCountryNode.iso === feature.properties.adm0_iso
									? darkAccentHex
									: lightAccentHex),
							context.fill(),
							context?.stroke();
					}
				});
			});

			context.beginPath(),
				path(World),
				(context.strokeStyle = darkIvoryHex),
				(context.fillStyle = 'transparent'),
				(context.lineWidth = 0.5),
				context.fill(),
				context.stroke();

			context.beginPath(),
				path(outline),
				context.clip(),
				(context.strokeStyle = '#d9b28b'),
				(context.lineWidth = 3),
				(context.fillStyle = 'transparent'),
				context.stroke();

			sourceTargetCoordinates.map((line) => {
				if (context) {
					context?.beginPath(),
						(context.lineCap = 'round'),
						(context.lineWidth = line.priority === 0 ? 0.00001 : linkWeightScale(line.weight)),
						(context.strokeStyle = darkAccentHex);
					path(line), context?.stroke();

					const targetCoords = projection(line.targetCoords);
					context?.beginPath(),
						context?.arc(targetCoords[0], targetCoords[1], 1.5, 0, 2 * Math.PI),
						(context.fillStyle = darkAccentHex);
					context?.fill();
				}
			});

			const primaryCountryCentroid = projection([
				primaryCountryFeature?.properties.label_x,
				primaryCountryFeature?.properties.label_y
			]);

			context?.beginPath(),
				context.arc(primaryCountryCentroid[0], primaryCountryCentroid[1], 3, 0, 2 * Math.PI),
				(context.fillStyle = darkAccentHex),
				context.fill(),
				(context.strokeStyle = 'white'),
				(context.lineWidth = 2),
				context.stroke();
		}
	}

	function zoomed(transform) {
		if (canvas && context) {
			context.clearRect(0, 0, width, height);
			context.save();

			if (transform) {
				// context.translate(transform.x, transform.y);
				// context.scale(transform.k, transform.k);

				// Update projection with smooth transform
				projection
					.scale(baseScale * transform.k)
					.translate([transform.x + width / 4, transform.y + height / 4]);

				renderCanvasContent();
			}

			context.restore();
		}
	}

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

			// Store the base scale after fitting the extent
			baseScale = projection.scale();
			console.log(baseScale);

			// Set initial translation
			projection.translate([width / 4, height / 4]);

			const zoom = d3
				.zoom()
				.scaleExtent([0.5, baseScale])
				.translateExtent([
					[0, 0],
					[width, height]
				])
				.on('zoom', ({ transform }) => zoomed(transform));

			if (context) {
				context.scale(dpi, dpi);
				renderCanvasContent();
				d3.select(canvas).call(zoom).call(zoom.transform, d3.zoomIdentity);
			}
		}
	});
</script>

<div class="flex">
	<div class="h-150 w-full rounded-xl" bind:clientWidth={width} bind:clientHeight={height}>
		<canvas bind:this={canvas} {width} {height}></canvas>
	</div>
</div>
