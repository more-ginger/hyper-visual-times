import { supabase } from "$lib/supabaseClient";

export async function load() {
  const { data:nyt_all } = await supabase.from("nyt_articles").select();
  const { data:zeit_all } = await supabase.from("zeit_articles").select();

  return {
    nyt_all: nyt_all ?? [],
    zeit_all: zeit_all ?? []
  };
}