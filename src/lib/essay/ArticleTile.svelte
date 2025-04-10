<script lang="ts">
 let {article} = $props();
 console.log(article)
</script>
<div class="border">
    <img src={article.multimedia}/>
    <h4>{article.headline}</h4>
    <p class="text-xs">{article.snippet}</p>
</div>