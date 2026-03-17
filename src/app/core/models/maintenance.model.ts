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
