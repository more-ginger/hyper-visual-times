import Papa from "papaparse";
import type { PageServerLoad } from './$types';
import type { countryDataType } from '../../types';

export const load: PageServerLoad = async () => {
    const coverage_by_country_url = "https://raw.githubusercontent.com/more-ginger/pn-analysis/refs/heads/place-analysis/data/places/coverage_by_country.csv"
    
    const response = await fetch(coverage_by_country_url);
    
    if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`)
    }

    const csvText = await response.text();
    const parsedCsv = Papa.parse(csvText, {header:true}).data as countryDataType[];

    const coverage_by_region_url = "https://raw.githubusercontent.com/more-ginger/pn-analysis/refs/heads/main/data/places/coverage_by_region.json"
    
    const coverage_by_region_response = await fetch(coverage_by_region_url);
    
    if (!coverage_by_region_response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`)
    }

    const jsonData = await coverage_by_region_response.json();
    console.log(jsonData)

    return {
        data: parsedCsv.map((d:countryDataType) => {
            return {
                country: d.country,
                coords: [+d.Latitude, +d.Longitude],
                count_zeit: +d.count_of_articles_zeit,
                count_nyt: +d.count_of_articles_nyt,
                iso: d.iso_alpha3,
            }
        }),
        coverageByRegion: jsonData
    }
}