import { doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createSalon = async (adminUid, salonData) => {
  const salonId = adminUid;
  const slug = salonData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  await setDoc(doc(db, 'salons', salonId), {
    ...salonData,
    slug,
    adminUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'users', adminUid), { salonId }, { merge: true });
  return salonId;
};

export const getSalon = async (salonId) => {
  const snap = await getDoc(doc(db, 'salons', salonId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getSalonBySlug = async (slug) => {
  const snap = await getDocs(query(collection(db, 'salons'), where('slug', '==', slug)));
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const updateSalon = async (salonId, data) => {
  const updates = { ...data, updatedAt: serverTimestamp() };
  if (data.name) {
    updates.slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  await setDoc(doc(db, 'salons', salonId), updates, { merge: true });
};
