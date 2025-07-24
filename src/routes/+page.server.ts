import { supabase } from "$lib/supabaseClient";

function shuffleArray(array:any[]) {
  return array.sort(() => 0.5 - Math.random())
}

export async function load() {
  // The only data we need on the main page is a random selection of articles
  // to create the floating tiles, here we select some articles from Supabase, slice the array and shuffle it. 
  const { data:nyt_all } = await supabase.from("nyt_articles").select();
  const { data:zeit_all } = await supabase.from("zeit_articles").select();

    let shuffledNYTArticles = shuffleArray(nyt_all || []);
    let randomNYTSelection = shuffledNYTArticles.slice(0, 4);


    let shuffledZeitArticles = shuffleArray(zeit_all || []);
    let randomZeitSelection = shuffledZeitArticles.slice(0, 4);
    
  return {
    randomNYTSelection: await randomNYTSelection,
    randomZeitSelection: await randomZeitSelection
  };
}