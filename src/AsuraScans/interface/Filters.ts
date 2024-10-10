export interface Months {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
}

export interface StatusTypes {
    ONGOING: string;
    HIATUS: string;
    COMPLETED: string;
    DROPPED: string;
    SEASONEND: string;
    COMINGSOON: string;
}

export interface Filters {
    types: any[];
    genres: [{
        id: number;
        name: string;
    }];
    statuses: any[];
    order: any[];
}