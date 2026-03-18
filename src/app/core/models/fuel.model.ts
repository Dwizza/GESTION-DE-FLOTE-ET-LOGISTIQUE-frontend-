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
