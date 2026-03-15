export interface TrailerResponse {
    id: string;
    type: 'STANDARD' | 'FRIGO' | 'TANKER' | 'FLATBED';
    maxWeight: number;
    maxVolume: number;
    status: 'AVAILABLE' | 'IN_USE' | 'IN_MAINTENANCE' | 'BROKEN';
}
