export interface TripResponse {
    id: string;
    reference: string;
    startDate: string;
    endDate?: string;
    totalDistance: number;
    status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REFUSED_BY_DRIVER';
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;

    driver: {
        id: string;
        licenseNumber: string;
        firstName: string;
        lastName: string;
    };
    client: {
        id: string;
        companyName: string;
    };
    trucks: {
        id: string;
        registrationNumber: string;
        brand: string;
    }[];
    trailers: {
        id: string;
        type: string;
    }[];
}
