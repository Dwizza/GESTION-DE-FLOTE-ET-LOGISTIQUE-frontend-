export interface TruckResponse {
    id: string;
    registrationNumber: string;
    brand: string;
    totalMileage: number;
    status: 'AVAILABLE' | 'IN_TRIP' | 'IN_MAINTENANCE' | 'BROKEN';
}
