
import { supabase } from "$lib/supabaseClient";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    console.log('Request Articles a Comparison')
    const source = url.searchParams.get("source");
    const person1 = url.searchParams.get('person1')
    const person2 = url.searchParams.get('person2')

    if (source && person1 && person2) {
        let query = supabase.from(`${source}_top15_images`).select("_id, person_name")
                .in('person_name', [person1, person2])
        
        const { data, error } = await query;
        if (error) {
            return new Response(error.message, { status: 500 })
        }
        let filtered = Array.from(new Set(data.filter((v1, i1, a) => a.some((v2, i2) => v1._id === v2._id && i1 !== i2 && v1.person_name != v2.person_name)).map(d => d._id)))
        query = supabase.from(`${source}_articles`).select("_id, headline, web_url, snippet, pub_date, byline")
                .in('_id', filtered)
        const { data: data2, error: error2 } = await query;
        if (error2) {
            return new Response(error2.message, { status: 500 })
        }
        return new Response(JSON.stringify(data2), {
            headers: { "Content-Type": "application/json" }
        })
    } else {
        return new Response('No data', { status: 500 })
    }
}