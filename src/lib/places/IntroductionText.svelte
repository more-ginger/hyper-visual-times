<script lang="ts">
import { marked } from "marked";
import places_essay from "../../../static/text/places-essay.md?raw";
let shown = $state(true);


</script>

<div class="w-full md:w-3/7 m-auto">
    <div class="m-10 essay" class:optional-hidden={!shown}>
        {@html marked(places_essay)}
    </div>
</div>