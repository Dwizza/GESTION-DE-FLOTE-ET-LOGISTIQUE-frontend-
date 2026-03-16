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
