// src/services/salonService.js
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createSalon = async (adminUid, salonData) => {
  const salonId = adminUid;

  await setDoc(doc(db, 'salons', salonId), {
    ...salonData,
    adminUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'users', adminUid), {
    salonId,
  }, { merge: true });

  return salonId;
};

export const getSalon = async (salonId) => {
  const snap = await getDoc(doc(db, 'salons', salonId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
export const updateSalon = async (salonId, data) => {
  await setDoc(doc(db, 'salons', salonId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
