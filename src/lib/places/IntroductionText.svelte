<script lang="ts">
import markedFootnote from "marked-footnote";
import { marked } from "marked";
import places_essay from "../../../static/text/places-essay.md?raw";
let shown = $state(true);

marked.use({async: true, breaks:true}, markedFootnote())
const essayContent = marked.parse(places_essay)
</script>

<div class="w-full md:w-3/7 m-auto">
    {#await essayContent}
    <div>loading</div>
    {:then essayContent} 
        <div class="m-10 essay" class:optional-hidden={!shown}>
            {@html essayContent}
        </div>
    {/await}

</div>