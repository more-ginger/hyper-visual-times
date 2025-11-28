<script>
	import { LinkHandler } from '$lib/utils/linkhandler.svelte';
</script>

<div class="w-full md:my-20">
	<div class="mx-2 lg:w-3/7">
		<h1 class="my-2 font-serif text-2xl md:text-2xl">The Hyper-visual Times</h1>
		<p class="text-sm">
			After building a partial blueprint of the material layer of news, the chapters included in
			this interactive essay will dive into one particular dimension of digital news-making. The
			goal is to reverse the transient and ephemeral nature of digital news through the creation of
			distinct pictures and snapshots of news coverage. These snapshots compose a wider horizon for
			digital news consumption with editorial and platform-related strategies coming to the
			foreground in showing and comparing the rhetorical and contextual rules of selected news
			outlets.
		</p>
	</div>
	<div class="w-full lg:grid lg:h-2/3 lg:grid-cols-3 lg:grid-cols-7 lg:gap-2 lg:self-center">
		<a
			href={LinkHandler('/places')}
			class="m-4 transition-all hover:-translate-y-[2px] lg:col-span-2 lg:col-start-2 lg:m-0 lg:mt-4 lg:self-start"
		>
			<span>1.</span>
			<div class="bg-ivory-default rounded-xl border shadow-lg">
				<div class="p-5">
					<div class="flex justify-between">
						<div>
							<img
								src={LinkHandler('/img/places_header.svg')}
								alt="Preview of the visualizations: yellow and blue triangles horizontally aligned"
							/>
						</div>
						<div class="ml-2 flex items-center">
							<div class="">
								<div class="mr-[5px] h-[25px] w-[25px] animate-pulse rounded-xl bg-green-500"></div>
							</div>
							<div class="rounded-2xl border px-4 py-2">
								<img src={LinkHandler('/icons/ui-forward.svg')} alt="right arrow" />
							</div>
						</div>
					</div>
					<h2 class="my-2 font-serif text-lg">The Geo-politics of News</h2>
					<p>
						This chapter focuses on how geographic keywords are used across the online coverage of
						two newspapers: The New York Times and Zeit Online. First, keywords that are related to
						geographic locations are extracted and preprocessed to reach a common standard for both
						publications. Then, other keywords related to these countries are extracted to
						investigate the overlaps and differences shown by the two newspapers in covering
						geo-political issues.
					</p>
				</div>
			</div>
		</a>
		<a
			href={LinkHandler('/topics')}
			class="m-4 transition-all hover:-translate-y-[2px] lg:col-span-2 lg:m-0 lg:mt-20 lg:self-start"
		>
			<span>2.</span>
			<div class="bg-ivory-default rounded-xl border shadow-lg">
				<div class="p-5">
					<div class="flex justify-between">
						<div>
							<img
								src={LinkHandler('/img/texts_header.svg')}
								alt="Preview of the visualizations: 11 yellow and orange circles of different sizes"
							/>
						</div>
						<div class="ml-2 flex items-center">
							<div class="">
								<div class="mr-[5px] h-[25px] w-[25px] animate-pulse rounded-xl bg-green-500"></div>
							</div>
							<div class="rounded-2xl border px-4 py-2">
								<img src={LinkHandler('/icons/ui-forward.svg')} alt="forward" />
							</div>
						</div>
					</div>
					<h2 class="my-2 font-serif text-lg">Discoursive Interrelations</h2>
					<p>
						Using machine learning and topic modeling techniques, key terms have been extracted from
						one year worth of articles from The New York Times archives. As a result, we generated
						clusters of similar words showing how often certain topics are discussed throughout the
						newspaper coverage. In this chapter, these clusters have been visualized to allow for
						analyzing the relationships between different themes.
					</p>
				</div>
			</div>
		</a>
		<a
			href={LinkHandler('/images')}
			class="m-4 transition-all hover:-translate-y-[2px] lg:col-span-2 lg:m-0 lg:self-start"
		>
			<span>3.</span>
			<div class="bg-ivory-default rounded-xl border shadow-lg">
				<div class="p-5">
					<div class="flex justify-between">
						<div>
							<img
								src={LinkHandler('/img/images_header.svg')}
								alt="Preview of the visualizations: 
								5 silhouttes of faces colored in light blue, 
								pink, orange, yellow and light blue"
							/>
						</div>
						<div class="ml-2 flex items-center">
							<div class="">
								<div class="mr-[5px] h-[25px] w-[25px] animate-pulse rounded-xl bg-green-500"></div>
							</div>
							<div class="rounded-2xl border px-4 py-2">
								<img src={LinkHandler('/icons/ui-forward.svg')} alt="forward" />
							</div>
						</div>
					</div>
					<h2 class="my-2 font-serif text-lg">Person of Interest</h2>
					<p>
						This chapter focuses on images of people as cultural artefacts built using
						long-established conventions of visual depictions. By extracting facial features from
						one year Zeit Online and The New York Times coverage, only images depicting famous
						people (politicians, actors, etc.) have been retained. The visualizations show how
						frequently certain subjects are shown and what rhetorical devices are applied in
						depicting them.
					</p>
				</div>
			</div>
		</a>
	</div>
</div>
