export declare function batchEncode(coords: {
    lat: number;
    lng: number;
}[]): string[];
export declare function batchDecode(pins: string[]): {
    latitude: number;
    longitude: number;
}[];
