<script lang="ts">
    let { data } = $props();
    
    let shuffledZeitArticles = $derived(data.zeit_all.sort(() => 0.5 - Math.random()))
    let randomZeitSelection = $derived(shuffledZeitArticles.slice(0, 4));
    
    let shuffledNYTArticles = $derived(data.nyt_all.sort(() => 0.5 - Math.random()))
    let randomNYTSelection = $derived(shuffledNYTArticles.slice(0, 4));

    
</script>
<div class="w-full h-full">
    <img src="/img/placeholder-main-illustration.png"/>
</div>