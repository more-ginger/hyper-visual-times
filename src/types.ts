export interface countryDataType {
    Latitude: number,
    Longitude: number,
    count_of_articles_nyt: number, 
    count_of_articles_zeit: number,
    country: string,
    ids_of_articles_nyt: string,
    ids_of_articles_zeit: string,
    iso_alpha3: string,
    keywords_nyt: string,
    keywords_zeit: string,
    middle_point: number,
    perc_of_coverage_nyt: number,
    perc_of_coverage_zeit: number
}

export interface countryDataForComparison {
    country: string,
    count_zeit: number,
    count_nyt: number,
    ids_of_articles_nyt: string[],
    ids_of_articles_zeit: string[]
}

export interface solution {
    [setid: string]: {
        x: number, 
        y: number, 
        radius: number
    }
}
