<script lang="ts">
    import TextRenderer from "$lib/essay/TextRenderer.svelte";
    import MainIllustration from "$lib/essay/MainIllustration.svelte";
    import rawIntroText from "@/content/main-essay.md?raw";

</script>
<main>
    <div class="base w-11/12 m-auto">
        <div id="essay-container" class="w-full flex my-4">
            <div class="md:w-6/9 sticky h-dvh top-50 md:top-0">
                <MainIllustration/>
            </div>
            <div class="md:w-3/9">
                <div>
                   <TextRenderer rawtext={rawIntroText}/>
                </div>
            </div>
        </div>
    </div>
</main>
