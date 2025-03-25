export interface countryDataType {
    Latitude: number,
    Longitude: number,
    count_of_articles_nyt: number, 
    count_of_articles_zeit: number,
    country: string,
    ids_of_articles_nyt: string[],
    ids_of_articles_zeit: string[],
    iso_alpha3: string,
    keywords_nyt: { [index: string]: number },
    keywords_zeit: { [index: string]: number },
    middle_point: number,
    perc_of_coverage_nyt: number,
    perc_of_coverage_zeit: number
}