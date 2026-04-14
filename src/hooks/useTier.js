import { useAuth } from '../context/AuthContext';
import { TIERS, getTierConfig, hasFeature, isWithinLimit } from '../constants/tiers';

export const useTier = () => {
  const { userProfile } = useAuth();
  const tier = userProfile?.tier || TIERS.FREE;
  const config = getTierConfig(tier);

  return {
    tier,
    config,
    hasFeature: (feature) => hasFeature(tier, feature),
    isWithinLimit: (type, count) => isWithinLimit(tier, type, count),
    isPro: tier === TIERS.PRO || tier === TIERS.BUSINESS,
    isBusiness: tier === TIERS.BUSINESS,
    isFree: tier === TIERS.FREE,
  };
};
