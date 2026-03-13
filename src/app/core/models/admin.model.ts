export interface ManagerResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    active: boolean;
    department?: string;
}

export interface DriverResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    active: boolean;
    licenseNumber: string;
    phoneNumber: string;
    available: boolean;
}

export interface TruckResponse {
    id: string;
    registrationNumber: string;
    brand: string;
    totalMileage: number;
    status: 'AVAILABLE' | 'IN_TRIP' | 'IN_MAINTENANCE' | 'BROKEN';
}

export interface TrailerResponse {
    id: string;
    type: 'STANDARD' | 'FRIGO' | 'TANKER' | 'FLATBED';
    maxWeight: number;
    maxVolume: number;
    status: 'AVAILABLE' | 'IN_USE' | 'IN_MAINTENANCE' | 'BROKEN';
}

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

export interface DeliveryResponse {
    id: string;
    reference: string;
    clientId: string;
    description: string;
    weight: number;
    volume: number;
    prix: number;
    pickupAddress: string;
    deliveryAddress: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    status: 'CREATED' | 'PLANNED' | 'IN_PROGRESS' | 'DELIVERED';
    tripId?: string;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;

    // Aggregated Info (from backend SimpleClientResponse / SimpleTripResponse)
    client?: {
        id: string;
        companyName: string;
    };
    trip?: {
        id: string;
        reference: string;
    };
}

export interface DeliveryRequest {
    reference: string;
    weight: number;
    volume: number;
    prix: number;
    pickupAddress: string;
    deliveryAddress: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    status: string;
    tripId: string;
    categoryId?: string;
}

export interface MaintenanceResponse {
    id: string;
    truckId?: string;
    trailerId?: string;
    description: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
    dateMaintenance: string;
    cout: number;
    performedBy: string;
    reference: string;

    // Derived entity info
    truck?: {
        id: string;
        registrationNumber: string;
        brand: string;
    };
    trailer?: {
        id: string;
        type: string;
    };
}

export interface CarburantTransactionResponse {
    id: string;
    reference: string;
    truckId: string;
    dateHeure: string;
    quantite: number;
    cout: number;
    stationName: string;
    receiptNumber?: string;

    truck?: {
        id: string;
        registrationNumber: string;
        brand: string;
    };
}

export interface ClientResponse {
    id: string;
    companyName: string;
    address: string;
    phone: string;
    email: string;
    role: string;
}

export interface AnalyticsResponse {
    totalTrucks: number;
    totalTrailers: number;
    totalDrivers: number;
    availableDrivers: number;
    activeTrips: number;
    totalRevenue: number;
    totalFuelCost: number;
    totalMaintenanceCost: number;
    totalProfit: number;

    // Chart data
    trucksByStatus: Record<string, number>;
    tripsByStatus: Record<string, number>;
    trucksByBrand: Record<string, number>;
    trailersByType: Record<string, number>;
}
