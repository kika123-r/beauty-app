import { collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const addToWaitingList = async (salonId, serviceId, clientId, clientEmail, clientName) => {
  const existing = await getDocs(query(
    collection(db, 'salons', salonId, 'waitingList'),
    where('serviceId', '==', serviceId),
    where('clientId', '==', clientId)
  ));
  if (!existing.empty) return;
  await addDoc(collection(db, 'salons', salonId, 'waitingList'), {
    serviceId, clientId, clientEmail, clientName,
    createdAt: serverTimestamp(),
  });
};

export const removeFromWaitingList = async (salonId, entryId) => {
  await deleteDoc(doc(db, 'salons', salonId, 'waitingList', entryId));
};

export const getWaitingList = async (salonId, serviceId) => {
  const snap = await getDocs(query(
    collection(db, 'salons', salonId, 'waitingList'),
    where('serviceId', '==', serviceId)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getMyWaitingList = async (salonId, clientId) => {
  const snap = await getDocs(query(
    collection(db, 'salons', salonId, 'waitingList'),
    where('clientId', '==', clientId)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
