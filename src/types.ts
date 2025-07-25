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
    [key: `ids_of_articles_${string}`]: string[]
}

export interface solution {
    [setid: string]: {
        x: number, 
        y: number, 
        radius: number
    }
}

export interface link {
    source: {
        x:number,
        y:number,
        country: string,
        iso: string
    },
    target: {
        x:number,
        y:number,
        country: string,
        iso: string
    },
    priority: number
    weight: number
}

type Outlet = "nyt" | "zeit"
type ArticleIds = {
    [Property in `ids_of_articles_${Outlet}`]: string[]
}

export interface node extends ArticleIds {
    x: number,
    y: number,
    priority: number,
    country: string,
    iso: string
}