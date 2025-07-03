<script lang="ts">
    let { article } = $props()
    console.log(article)
</script>
<div class="m-2 w-1/6">
    <img class="rounded-sm border my-2" src={article.multimedia} alt="Pulled dynamically from the source outlet"/>
    <h4 class="mb-2">{article.headline}</h4>
    <p class="text-xs mb-2">{article.snippet}</p>
</div>
