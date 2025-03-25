import Papa from "papaparse";
import type { PageServerLoad } from './$types';
import type { countryDataType } from '../../types';

export const load: PageServerLoad = async () => {
    const github_url = "https://raw.githubusercontent.com/more-ginger/pn-analysis/refs/heads/place-analysis/data/places/coverage_by_country.csv"
    const response = await fetch(github_url);
    if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`)
    }

    const csvText = await response.text();
    const parsedCsv = Papa.parse(csvText, {header:true}).data as countryDataType[];

    return {
        data:parsedCsv.map((d:countryDataType) => {
            return {
                country: d.country,
                coords: [+d.Latitude, +d.Longitude],
                count_zeit: +d.count_of_articles_zeit,
                count_nyt: +d.count_of_articles_nyt,
                iso: d.iso_alpha3,
            }
        })
    }
}