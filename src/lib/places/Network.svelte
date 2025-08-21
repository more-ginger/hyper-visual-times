<script lang="ts">
	import type { link, node } from '../../types';
	// @ts-expect-error
	import * as d3 from 'd3';
	import NetworkCard from './NetworkCard.svelte';
	import { distance } from '../utils/actions.svelte';

	let { nodes, links, outlet, dataDomain, primaryCountryKey } = $props();

	const NodesForVis = $derived(nodes.map((d: node) => ({ ...d })));
	const LinksForVis = $derived(links.map((d: link) => ({ ...d })));
	let circles: Circle[] = [];
	let canvasLinks: Link[] = [];

	let canvas: HTMLCanvasElement | null = $state(null);
	let context: CanvasRenderingContext2D;
	let simulation;
	let dpi = 1;
	let width = $state(0);
	let height = $state(0);
	const networkRadius = 260;

	const radiuScale = $derived(d3.scaleLinear().domain(dataDomain).range([2, 50]));
	const distanceScale = $derived(
		d3
			.scaleLinear()
			.domain(d3.extent(LinksForVis.map((d: link) => d.weight)))
			.range([300, 0])
	);
	const strengthScale = $derived(
		d3
			.scaleLinear()
			.domain(d3.extent(LinksForVis.map((d: link) => d.weight)))
			.range([1, 20])
	);
	let selectedNode = $state(primaryCountryKey);

	function redrawCanvasElement(elements: Circle[] | Link[]) {
		elements.forEach((element) => {
			element.draw(context);
		});
	}

	$effect(() => {
		selectedNode = primaryCountryKey;
		const ctx = canvas?.getContext('2d');
		if (ctx) {
			context = ctx;
		}

		context.imageSmoothingQuality = 'high';

		if (canvas) {
			dpi = window.devicePixelRatio || 1;
			// Make it visually fill the positioned parent
			canvas.style.width = '100%';
			canvas.style.height = '100%';
			// ...then set the internal size to match
			canvas.width = canvas.offsetWidth * dpi;
			canvas.height = canvas.offsetHeight * dpi;
			width = canvas.offsetWidth * dpi;
			height = canvas.offsetHeight * dpi;
			context.scale(dpi, dpi);
			// change factor to position the network at the center of the scaled canvas
			const positioningFactor = dpi > 1 ? 4 : 2;

			simulation = d3
				.forceSimulation(NodesForVis)
				.force(
					'collide',
					d3.forceCollide(
						(d: node & { [key: string]: any }) =>
							radiuScale((d[`ids_of_articles_${outlet}`] as any[]).length) + 5
					)
				)
				.force(
					'link',
					d3
						.forceLink(LinksForVis)
						.id((d: node) => d.country)
						.distance((d: link) => distanceScale(d.weight))
				)
				.force('center', d3.forceCenter(width / positioningFactor, height / positioningFactor))
				.force('bounding', () => {
					NodesForVis.forEach((node: node) => {
						const xCenter = width / positioningFactor - 30;
						const yCenter = height / positioningFactor - 30;
						if (distance(node.x, node.y, xCenter, yCenter) > networkRadius) {
							const theta = Math.atan((node.y - yCenter) / (node.x - xCenter));
							node.x = xCenter + networkRadius * Math.cos(theta) * (node.x < xCenter ? -1 : 1);
							node.y = yCenter + networkRadius * Math.sin(theta) * (node.x < xCenter ? -1 : 1);
						}
					});
				})
				.on('tick', simulationUpdate)
				.tick(2);
		}
	});

	class Circle {
		xpoint: number;
		ypoint: number;
		radius: number;
		fillColor: string;
		strokeColor: string;
		nameLabel: string;
		priority: number;

		constructor(
			xpoint: number,
			ypoint: number,
			radius: number,
			fillColor: string,
			strokeColor: string,
			nameLabel: string,
			priority: number
		) {
			this.xpoint = xpoint;
			this.ypoint = ypoint;
			this.radius = radius;
			this.fillColor = fillColor;
			this.strokeColor = strokeColor;
			this.nameLabel = nameLabel;
			this.priority = priority;
		}

		draw(context: CanvasRenderingContext2D) {
			context.globalAlpha = 1;
			context.beginPath();
			context.arc(this.xpoint, this.ypoint, this.radius, 0, Math.PI * 2, false);
			context.fillStyle = selectedNode == this.nameLabel ? this.fillColor : 'white';
			context.fill();
			context.strokeStyle = outlet == 'nyt' ? '#CE8900' : '#0036AC';
			context.lineWidth = 1;
			context.stroke();
			context.closePath();

			context.textAlign = 'center';
			context.fillStyle = this.strokeColor;
			context.strokeStyle = 'white';
			context.strokeText(this.nameLabel, this.xpoint, this.ypoint - this.radius - 5);
			context.fillText(this.nameLabel, this.xpoint, this.ypoint - this.radius - 5);
		}

		isPointInside(x: number, y: number) {
			return distance(x, y, this.xpoint, this.ypoint) <= this.radius;
		}
	}

	class Link {
		countrySource: string;
		countryTarget: string;
		sourceX: number;
		sourceY: number;
		targetX: number;
		targetY: number;
		priority: number;
		lineWidth: number;
		strokeColor!: string;

		constructor(
			countrySource: string,
			countryTarget: string,
			sourceX: number,
			sourceY: number,
			targetX: number,
			targetY: number,
			priority: number,
			lineWidth: number,
			strokeColor: string
		) {
			this.countrySource = countrySource;
			this.countryTarget = countryTarget;
			this.sourceX = sourceX;
			this.sourceY = sourceY;
			this.targetX = targetX;
			this.targetY = targetY;
			this.priority = priority;
			this.lineWidth = lineWidth;
			this.strokeColor = strokeColor;
		}

		draw(context: CanvasRenderingContext2D) {
			context.beginPath();
			context.moveTo(this.sourceX, this.sourceY);
			context.lineTo(this.targetX, this.targetY);
			context.strokeStyle = this.strokeColor;
			context.lineWidth = this.lineWidth;
			context.globalAlpha =
				selectedNode == this.countrySource || selectedNode == this.countryTarget ? 1 : 0.1;
			context.lineCap = 'round';
			context.stroke();
		}
	}

	function simulationUpdate() {
		context.save();
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		canvasLinks = LinksForVis.map((d: link) => {
			const sourceCountry =
				d.source.iso == 'No code' || d.source.country === primaryCountryKey
					? d.source.country
					: d.source.iso;

			const targetCountry =
				d.target.iso == 'No code' || d.target.country === primaryCountryKey
					? d.target.country
					: d.target.iso;

			let link = new Link(
				sourceCountry,
				targetCountry,
				d.source.x,
				d.source.y,
				d.target.x,
				d.target.y,
				d.priority > 0 ? 1 : 0.1,
				strengthScale(d.weight),
				outlet == 'nyt' ? '#FFDB93' : '#7EA7FF'
			);

			link.draw(context);
			return link;
		});

		circles = NodesForVis.map((d: node & { [key: string]: any }) => {
			const nameLabel = d.iso == 'No code' || d.country === primaryCountryKey ? d.country : d.iso;

			let circle = new Circle(
				d.x,
				d.y,
				radiuScale((d[`ids_of_articles_${outlet}`] as any[]).length),
				outlet == 'nyt' ? '#FFDB93' : '#0036AC',
				outlet == 'nyt' ? '#6a4907' : '#0036AC',
				nameLabel,
				d.priority
			);

			circle.draw(context);
			return circle;
		});

		context.restore();
	}

	function selectNode(e: MouseEvent) {
		const rect = canvas?.getBoundingClientRect();
		if (!rect) return;
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		circles.forEach((circle) => {
			if (circle.isPointInside(x, y)) {
				// console.log("Circle clicked:", circle.nameLabel);
				selectedNode = circle.nameLabel;
			}
		});
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		redrawCanvasElement(canvasLinks);
		redrawCanvasElement(circles);
	}

	function resetNode() {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		selectedNode = primaryCountryKey;
		redrawCanvasElement(canvasLinks);
		redrawCanvasElement(circles);
	}
</script>

<div>
	{#await nodes && links}
		<div>Loading</div>
	{:then}
		<div class={`m-2`}>
			<div
				bind:clientWidth={width}
				bind:clientHeight={height}
				class={`h-150 rounded-md border border-gray-200 p-2`}
			>
				<div>
					<div>
						<div>
							{#if outlet === 'nyt'}
								<p class="text-nyt-dark pb-0">The New York Times</p>
							{:else}
								<p class="text-zeit-dark pb-0">Zeit Online</p>
							{/if}
						</div>
						<div class={`text-${outlet}-default text-xs`}>
							{#if nodes.length <= 1}
								<span>{primaryCountryKey}</span> shares no coverage with other countries.
							{:else}
								<span>{primaryCountryKey}</span> shares coverage with {nodes.length} other countries.
							{/if}
						</div>
					</div>
				</div>
				<canvas
					bind:this={canvas}
					{width}
					{height}
					onmousemove={selectNode}
					onmouseleave={resetNode}
				></canvas>
			</div>
		</div>
		<div>
			<NetworkCard {outlet} {nodes} {primaryCountryKey} />
		</div>
	{/await}
</div>
