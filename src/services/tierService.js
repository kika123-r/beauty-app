import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { serverTimestamp } from '../firebase/firestore';
import { TIERS } from '../constants/tiers';

export const getSalonTier = async (salonId) => {
  const snap = await getDoc(doc(db, 'salons', salonId));
  if (!snap.exists()) return TIERS.FREE;
  return snap.data().tier || TIERS.FREE;
};

export const updateSalonTier = async (salonId, tier) => {
  await setDoc(doc(db, 'salons', salonId), {
    tier,
    tierUpdatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getBookingCountThisMonth = async (salonId) => {
  const { bookingsCol } = await import('../firebase/firestore');
  const { getDocuments, where } = await import('../firebase/firestore');
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const bookings = await getDocuments(bookingsCol(salonId), [
    where('createdAt', '>=', startOfMonth),
  ]);
  return bookings.length;
};
