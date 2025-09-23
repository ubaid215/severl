interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  latitude?: number;
  longitude?: number;
  addressPlaceId?: string;
  lastUsed: number; // timestamp
}

const STORAGE_KEY = 'checkoutData';

export class CheckoutStorage {
  static saveCheckoutData(data: Omit<CheckoutData, 'lastUsed'>): void {
    if (typeof window === 'undefined') return;

    const checkoutData: CheckoutData = {
      ...data,
      lastUsed: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutData));
  }

  static getCheckoutData(): CheckoutData | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading checkout data from localStorage:', error);
      return null;
    }
  }

  static clearCheckoutData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Save only address data for quick reuse
  static saveAddressOnly(address: string, lat?: number, lng?: number, placeId?: string): void {
    const existingData = this.getCheckoutData();
    
    if (existingData) {
      this.saveCheckoutData({
        ...existingData,
        deliveryAddress: address,
        latitude: lat,
        longitude: lng,
        addressPlaceId: placeId
      });
    }
  }
}