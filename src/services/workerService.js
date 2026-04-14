import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createWorker = async (salonId, data) => {
  const ref = await addDoc(collection(db, 'salons', salonId, 'workers'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getWorkers = async (salonId) => {
  const snap = await getDocs(collection(db, 'salons', salonId, 'workers'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateWorker = async (salonId, workerId, data) => {
  await updateDoc(doc(db, 'salons', salonId, 'workers', workerId), data);
};

export const deleteWorker = async (salonId, workerId) => {
  await deleteDoc(doc(db, 'salons', salonId, 'workers', workerId));
};
