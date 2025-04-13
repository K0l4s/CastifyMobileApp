export interface provinces {
    id: string;
    name: string;
    type: string;
    typeText: string;
    slug: string;
}

export interface district {
    id: string;
    name: string;
    provinceId:string;
    type: string;
    typeText: string;
}

export interface ward {
    id: string;
    name: string;
    districtId:string;
    type: string;
    typeText: string;
}