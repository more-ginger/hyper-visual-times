import { PUBLIC_SUPABASE_ARTICLES_EDGE_URL,PUBLIC_SUPABASE_COVERAGE_REGION_EDGE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
export async function getArticles(source, ids){
    const response = await fetch(`${PUBLIC_SUPABASE_ARTICLES_EDGE_URL}?source=${source}&id=${ids.join('&id=')}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
        }
    });
    let json = await response.json();
    return json;
}
export async function getCoveragePerCountry(){
        const response = await fetch(`${PUBLIC_SUPABASE_COVERAGE_REGION_EDGE_URL}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
        }
    });
    let json = await response.json();
    return json;
}