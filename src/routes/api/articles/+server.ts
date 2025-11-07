
import { supabase } from "$lib/supabaseClient";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    console.log('Request Articles')
    const source = url.searchParams.get("source");
    const ids = url.searchParams.getAll("id");

    if (!source || (source !== "nyt" && source !== "zeit")) {
        return new Response("Invalid source", { status: 400 });
    }
        let query = supabase.from(`${source}_articles_tweaked`).select("_id,headline, web_url, snippet, pub_date, byline,news_desk").in("_id", ids);
        const { data, error } = await query;
        if (error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        })
}