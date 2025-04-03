<script lang="ts">
    import markedFootnote from "marked-footnote";
    import { marked } from "marked";
    import { setFootnotes } from "$lib/utils/actions.svelte";

    let { rawtext } = $props();
    let shown = $state(true);

    marked.use({async: true, breaks:true}, markedFootnote())
    const essayContent = marked.parse(rawtext)
</script>

<div>
    {#await essayContent}
    <div>Loading essay content</div>
    {:then essayContent} 
    <div use:setFootnotes>
        <div class="mx-5 my-5 essay " class:optional-hidden={!shown}>
            {@html essayContent}
        </div>
        </div>
    {/await}
</div>