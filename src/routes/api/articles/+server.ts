
import { supabase} from "$lib/supabaseClient";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({url}) => {
    const source = url.searchParams.get("source");
    const id = url.searchParams.get("id");

    if (!source || (source !== "nyt" && source !== "zeit")) {
        return new Response("Invalid source", { status: 400 });
    }

    let query = supabase.from(`${source}_articles`).select("*").eq("_id", id).single();
    const { data, error} = await query;

    if (error) {
        return new Response(error.message, { status: 500 })
    }

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    })
}