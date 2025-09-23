interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
}

interface DistanceMatrixResult {
  distance: number; // in meters
  duration: number; // in seconds
  status: string;
}

export class GoogleMapsService {
  private static apiKey = process.env.GOOGLE_MAPS_API_KEY;

  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        // Extract address components
        const addressComponents: any = {};
        result.address_components.forEach((component: any) => {
          if (component.types.includes('locality')) {
            addressComponents.city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            addressComponents.state = component.long_name;
          }
          if (component.types.includes('country')) {
            addressComponents.country = component.long_name;
          }
        });

        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          ...addressComponents
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  static async calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DistanceMatrixResult | null> {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance.value, // meters
          duration: element.duration.value, // seconds
          status: element.status
        };
      }

      return null;
    } catch (error) {
      console.error('Distance calculation error:', error);
      return null;
    }
  }

  // Validate if address is within delivery radius
  static async validateDeliveryAddress(
    deliveryLat: number,
    deliveryLng: number,
    maxDistance: number
  ): Promise<{ isValid: boolean; distance: number; message?: string }> {
    try {
      const { latitude: restaurantLat, longitude: restaurantLng } = await import('./config').then(m => m.restaurantConfig);
      
      const distanceResult = await this.calculateDistance(
        restaurantLat,
        restaurantLng,
        deliveryLat,
        deliveryLng
      );

      if (!distanceResult) {
        return { isValid: false, distance: 0, message: 'Could not calculate distance' };
      }

      const distanceInKm = distanceResult.distance / 1000;
      const isValid = distanceInKm <= maxDistance;

      return {
        isValid,
        distance: distanceInKm,
        message: isValid ? undefined : `Delivery address is outside our ${maxDistance}km delivery radius`
      };
    } catch (error) {
      console.error('Delivery validation error:', error);
      return { isValid: false, distance: 0, message: 'Error validating delivery address' };
    }
  }
}