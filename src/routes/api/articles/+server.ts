
import { supabase } from "$lib/supabaseClient";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const source = url.searchParams.get("source");
    const ids = url.searchParams.getAll("id");
    //must be refractored to REST
    const person = url.searchParams.get('person')
    const week = url.searchParams.get('date')

    if (!source || (source !== "nyt" && source !== "zeit")) {
        return new Response("Invalid source", { status: 400 });
    }
    if (!person) {
        let query = supabase.from(`${source}_articles`).select("headline, web_url, snippet, pub_date, byline").in("_id", ids);
        const { data, error } = await query;
        if (error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        })
    } else {
        console.log('source, person, week',source, person, week)
        // First query: get image IDs
        let { data: imageData, error: imageError } = await supabase
            .from(`${source}_top15_images`)
            .select('_id')
            .gte('pub_date', new Date(week).toISOString().split('T')[0])
            .lt('pub_date', new Date(new Date(week).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .in('person_name', [person])

        if (imageError) {
            console.error('Error fetching image data:', imageError);
            return new Response(imageError.message, { status: 500 })
        }

        // Extract IDs
        let imageIds = imageData?.map(d => d._id) ?? [];
        console.log(imageIds.length,person,new Date(week).toISOString().split('T')[0])

        // Second query: get articles matching those IDs
        let { data: articleData, error: articleError } = await supabase
            .from(`${source}_articles`)
            .select(' _id, headline, web_url, snippet, pub_date, byline')
            .in('_id', imageIds)
            .order('pub_date', { ascending: false })

        if (articleError) {
            console.error('Error fetching article data:', articleError);
            return new Response(articleError.message, { status: 500 })
        }

        return new Response(JSON.stringify(articleData), {
            headers: { "Content-Type": "application/json" }
        })
    }


}