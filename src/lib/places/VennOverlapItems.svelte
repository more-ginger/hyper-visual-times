<script lang="ts">
    let {data, comparisonCountry} = $props()
    let source = "nyt"
    const currentDataSelection = $derived(comparisonCountry? data.filter((d:{country:string}) => {return d.country == comparisonCountry.key}) : null)
    const currentVennSelection = $derived(currentDataSelection ? currentDataSelection[0].articleSetsNYT : null)
    let articles = $state<any[]>([])

   
    $effect(() => {
        articles = []
        if (currentVennSelection)
        currentVennSelection.forEach((set: {sets: [], shared:[]}) => {
            if (set.sets.length > 1) {
                set.shared.forEach((id) => {
                    fetch(`/api/articles?source=${source}&id=${encodeURIComponent(id)}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log(data)
                        articles.push(data)
                    })
                })
            }
        })
    })

 $inspect(articles.length)

</script>
{#await articles}
    <p>Loading...</p>
{:catch error}
    <p>{error.message}</p>
{:then articles} 
    {#each articles as article}
        <p class="border mt-2">{article.headline}</p>
    {/each}
{/await}