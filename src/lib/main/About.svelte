<script lang="ts">
	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';
	import aboutText from '@/content/about.md?raw';
	import { LinkHandler } from '$lib/utils/linkhandler.svelte';
</script>

<div class="m-auto flex w-4/5 pb-20">
	<div class="w-3/5">
		<div>
			<h2 class="font-serif text-2xl">About the project</h2>
			<div class="essay">
				<BlocksRenderer rawtext={aboutText} />
			</div>
		</div>
		<div class="mt-10">
			<h2 class="font-serif text-2xl">Team</h2>
			<div class="mt-8 grid grid-cols-3">
				<div class="m-2 ml-0">
					<div><p class="text-sm">Principal Investigator</p></div>
					<div class="relative max-h-[400px] overflow-hidden rounded-xl border bg-white">
						<img
							class="h-[400px] w-96 object-cover"
							src={LinkHandler("/img/team/fm_team.jpg")}
							alt="Portrait of Francesca Morini"
						/>
						<div class="absolute bottom-0 z-50 min-h-24 w-full border-t bg-white p-2">
							<p>Francesca Morini</p>
							<p class="text-xs">
								Film University Babelsberg KONRAD WOLF, Metalab Berlin + Harvard
							</p>
						</div>
					</div>
				</div>
				<div class="m-2 ml-0">
					<div><p class="text-sm">Research Associate</p></div>
					<div class="relative h-[400px] overflow-hidden rounded-xl border bg-white">
						<img
							class="h-[350px] w-96 object-cover"
							src={LinkHandler("/img/team/pp_team.webp")}
							alt="Portrait of Philipp Proff"
						/>
						<div class="absolute bottom-0 z-50 min-h-24 w-full border-t bg-white p-2">
							<p>Philipp Proff</p>
							<p class="text-xs">Film University Babelsberg KONRAD WOLF</p>
						</div>
					</div>
				</div>
				<div class="m-2 ml-0">
					<div><p class="text-sm">Project Management</p></div>
					<div class="relative h-[400px] overflow-hidden rounded-xl border bg-white">
						<img
							class="h-[400px] w-96 object-cover"
							src={LinkHandler("/img/team/ab_team.jpeg")}
							alt="Portrait of Angela Brennecke"
						/>
						<div class="absolute bottom-0 z-50 min-h-24 w-full border-t bg-white p-2">
							<p>Angela Brennecke</p>
							<p class="text-xs">Film University Babelsberg KONRAD WOLF</p>
						</div>
					</div>
				</div>
				<div class="m-2 ml-0">
					<div><p class="text-sm">Data Analysis, Student Assistant</p></div>
					<div class="relative h-[400px] overflow-hidden rounded-xl border bg-white">
						<img
							class="h-[400px] w-96 object-cover"
							src={LinkHandler("/img/team/js_team.jpeg")}
							alt="Portrait of Jocelyn Shek"
						/>
						<div class="absolute bottom-0 z-50 min-h-24 w-full border-t bg-white p-2">
							<p>Jocelyn Shek</p>
							<p class="text-xs">Harvard University</p>
						</div>
					</div>
				</div>
				<div class="m-2 ml-0">
					<div><p class="text-sm">Data Analysis, Student Assistant</p></div>
					<div class="relative h-[400px] overflow-hidden rounded-xl border bg-white">
						<img
							class="h-[400px] w-96 object-cover"
							src={LinkHandler("/img/placeholder-nyt.png")}
							alt="Portrait of >Nemuël Link"
						/>
						<div class="absolute bottom-0 z-50 min-h-24 w-full border-t bg-white p-2">
							<p>Nemuël Link</p>
							<p class="text-xs">Lucerne University of Applied Sciences and Arts</p>
						</div>
					</div>
				</div>
				<div class="m-2 ml-0">
					<div><p class="text-sm">Research Supervision</p></div>
					<div class="relative h-[400px] overflow-hidden rounded-xl border bg-white">
						<img
							class="h-[400px] w-96 object-cover object-right"
							src={LinkHandler("/img/team/ka_team.jpg")}
							alt="Portrait of Kim Albrecht"
						/>
						<div class="absolute bottom-0 z-50 min-h-24 w-full border-t bg-white p-2">
							<p>Kim Albrecht</p>
							<p class="text-xs">Folkwang University of the Arts</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="w-2/5 pl-12">
		<div class="sticky top-20">
			<div>
				<h2 class="font-serif text-2xl">Fundings & Partners</h2>
				<div class="mt-8">
					<div><img class="w-[250px]" src={LinkHandler("/img/partners/BMFTR.jpg")} alt="BMFTR Logo" /></div>
					<div>
						<img class="w-[200px]" src={LinkHandler("/img/partners/Filmuni.png")} alt="Film University Logo" />
					</div>
					<div><img class="w-[150px]" src={LinkHandler("/img/partners/difgl_logo.jpeg")} alt="DIFGL Logo" /></div>
				</div>
			</div>
			<div class="mt-10">
				<h2 class="font-serif text-2xl">Related links</h2>
				<div class="mt-8">
					<ul>
						<li class="pb-4">
							<button class="flex items-center px-2 py-[2px]">
								<a href="https://github.com/ctechfilmuniversity/splee_data_viz" target="_blank"
									>Documentation</a
								>
								<span class="ml-2"><img src={LinkHandler("/icons/ui-forward.svg")} alt="Forward arrow icon" /></span
								>
							</button>
						</li>
						<li class="pb-4">
							<button class="flex items-center px-2 py-[2px]">
								<a href="https://github.com/more-ginger/hyper-visual-times" target="_blank"
									>Github repository</a
								>
								<span class="ml-2"><img src={LinkHandler("/icons/ui-forward.svg")} alt="Forward arrow icon" /></span
								>
							</button>
						</li>
						<li class="pb-4">
							<button class="pointer-events-none flex items-center px-2 py-[2px]">
								<a href="https://www.filmuniversitaet.de/footer/kontakt/impressum" target="_blank"
									>Impressum</a
								>
								<span class="ml-2"><img src={LinkHandler("/icons/ui-forward.svg")} alt="Forward arrow icon" /></span
								>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
