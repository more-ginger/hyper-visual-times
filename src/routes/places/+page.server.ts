import { supabase } from "$lib/supabaseClient";
import type { PageServerLoad } from './$types';
import type { countryDataType } from '../../types';
export const prerender = 'auto';

export const load: PageServerLoad = async () => {

    const { data } = await supabase.from("coverage_by_country").select();
    const { data:coverageByRegion } = await supabase.from("regions").select();
    return {
        data: data ? await data.map((d:countryDataType) => {
            return {
                country: d.country,
                coords: [+d.Latitude, +d.Longitude],
                count_zeit: +d.count_of_articles_zeit,
                count_nyt: +d.count_of_articles_nyt,
                iso: d.iso_alpha3,
                ids_of_articles_zeit: d.ids_of_articles_zeit,
                ids_of_articles_nyt: d.ids_of_articles_nyt,
                keywords_zeit: JSON.parse(d.keywords_zeit),
                keywords_nyt: JSON.parse(d.keywords_nyt)
            }
        }) : [],
        coverageByRegion: coverageByRegion 
            && coverageByRegion[0] 
            ? await JSON.parse(coverageByRegion[0].data) 
            : null
    }
}