export const TIERS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  BUSINESS: 'business',
};

export const TIER_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    maxBookingsPerMonth: 50,
    maxServices: 3,
    maxSlots: 20,
    features: {
      emailNotifications: false,
      analytics: false,
      ratings: false,
      repeatBookings: false,
      waitingList: false,
      aiRecommendations: false,
      customDomain: false,
      multiSalon: false,
      export: false,
      lastMinute: true,
      marketplace: true,
    },
  },
  starter: {
    name: 'Starter',
    price: 4.90,
    maxBookingsPerMonth: 300,
    maxServices: 10,
    maxSlots: 100,
    features: {
      emailNotifications: true,
      analytics: false,
      ratings: true,
      repeatBookings: false,
      waitingList: false,
      aiRecommendations: false,
      customDomain: false,
      multiSalon: false,
      export: true,
      lastMinute: true,
      marketplace: true,
    },
  },
  pro: {
    name: 'Pro',
    price: 9.90,
    maxBookingsPerMonth: null,
    maxServices: null,
    maxSlots: null,
    features: {
      emailNotifications: true,
      analytics: true,
      ratings: true,
      repeatBookings: true,
      waitingList: true,
      aiRecommendations: true,
      customDomain: false,
      multiSalon: false,
      export: true,
      lastMinute: true,
      marketplace: true,
    },
  },
  business: {
    name: 'Business',
    price: 19.90,
    maxBookingsPerMonth: null,
    maxServices: null,
    maxSlots: null,
    features: {
      emailNotifications: true,
      analytics: true,
      ratings: true,
      repeatBookings: true,
      waitingList: true,
      aiRecommendations: true,
      customDomain: true,
      multiSalon: true,
      export: true,
      lastMinute: true,
      marketplace: true,
    },
  },
};

export const getTierConfig = (tier) => TIER_CONFIG[tier] || TIER_CONFIG.free;

export const hasFeature = (tier, feature) => {
  const config = getTierConfig(tier);
  return config.features[feature] === true;
};

export const isWithinLimit = (tier, type, currentCount) => {
  const config = getTierConfig(tier);
  const limit = config[type];
  if (limit === null) return true;
  return currentCount < limit;
};
