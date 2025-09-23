// lib/config.ts
export const restaurantConfig = {
  // Restaurant Details
  name: "Your Restaurant Name",
  address: "Board Of education, Faisalabad, Punjab, Pakistan",
  phone: "+923010560023",
  email: "contact@yourrestaurant.com",
  
  // Restaurant Coordinates (UPDATE THESE WITH YOUR ACTUAL LOCATION)
  latitude: 31.39149,  // Replace with your restaurant's latitude
  longitude: 72.99180, // Replace with your restaurant's longitude
  
  // Delivery Settings
  deliveryRadius: 20, // Maximum delivery distance in km
  basePreparationTime: 25, // Base preparation time in minutes
  travelTimePerKm: 3, // Travel time per km in minutes
  
  // Business Hours
  businessHours: {
    opening: "09:00",
    closing: "23:00",
    timezone: "IST"
  },
  
  // Delivery Fees (in your local currency)
  deliveryFees: [
    { maxDistance: 4, fee: 0 },      // Free within 4km
    { maxDistance: 6, fee: 50 },     // 50 for 4-6km
    { maxDistance: 8, fee: 80 },     // 80 for 6-8km
    { maxDistance: 10, fee: 120 }    // 120 for 8-10km
  ]
};

// Helper functions
export function calculateDeliveryCharge(distance: number, subtotal: number = 0): number {
  // Free delivery for orders above certain amount
  if (subtotal >= 500) {
    return 0;
  }
  
  // Find appropriate fee based on distance
  for (const feeTier of restaurantConfig.deliveryFees) {
    if (distance <= feeTier.maxDistance) {
      return feeTier.fee;
    }
  }
  
  // If beyond maximum distance
  throw new Error('Delivery address is outside our service area');
}

export function calculateEstimatedTime(distance: number): number {
  return Math.round(restaurantConfig.basePreparationTime + (distance * restaurantConfig.travelTimePerKm));
}

export function isWithinDeliveryRadius(distance: number): boolean {
  return distance <= restaurantConfig.deliveryRadius;
}