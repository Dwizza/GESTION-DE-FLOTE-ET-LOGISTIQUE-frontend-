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

    trucksByStatus: Record<string, number>;
    tripsByStatus: Record<string, number>;
    trucksByBrand: Record<string, number>;
    trailersByType: Record<string, number>;
}
