
import { supabase } from "$lib/supabaseClient";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    console.log('Request Articles for Date')
    const source = url.searchParams.get("source");
    const week = url.searchParams.get('date')
    const person = url.searchParams.get('person')

    if (week && source) {
        let query;
        if (!person) {
            query = supabase.from(`${source}_articles`).select("_id")
                .gte('pub_date', new Date(week).toISOString().split('T')[0])
                .lt('pub_date', new Date(new Date(week).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        } else {
            let { data: imageData, error: imageError } = await supabase
                .from(`${source}_top15_images`)
                .select('_id')
                .gte('pub_date', new Date(week).toISOString().split('T')[0])
                .lt('pub_date', new Date(new Date(week).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .in('person_name', [person])
            // Extract IDs
            let imageIds = imageData?.map(d => d._id) ?? [];
            console.log(imageIds.length, person, new Date(week).toISOString().split('T')[0])

            // Second query: get articles matching those IDs
            query = supabase
                .from(`${source}_articles`)
                .select(' _id, headline, web_url, snippet, pub_date, byline')
                .in('_id', imageIds)
                .order('pub_date', { ascending: false })
        }
        const { data, error } = await query;
        if (error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        })
    } else {
        return new Response('No data', { status: 500 })
    }
}