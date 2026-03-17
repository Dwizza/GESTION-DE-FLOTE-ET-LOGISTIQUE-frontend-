export interface TrackingPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  truckId: string;
  truck?: {
    registrationNumber: string;
    brand: string;
  };
}
