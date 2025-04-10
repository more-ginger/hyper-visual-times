import Papa from "papaparse";
import { supabase } from "$lib/supabaseClient";
import type { PageServerLoad } from './$types';
import type { countryDataType } from '../../types';

export const load: PageServerLoad = async () => {

    const { data } = await supabase.from("coverage_by_country").select();
    const { data:coverageByRegion } = await supabase.from("regions").select();

    return {
        data: data ? data.map((d:countryDataType) => {
            return {
                country: d.country,
                coords: [+d.Latitude, +d.Longitude],
                count_zeit: +d.count_of_articles_zeit,
                count_nyt: +d.count_of_articles_nyt,
                iso: d.iso_alpha3,
            }
        }) : [],
        coverageByRegion: coverageByRegion && coverageByRegion[0] ? JSON.parse(coverageByRegion[0].data) : null
    }
}