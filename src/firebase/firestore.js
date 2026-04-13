import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

export const salonCol     = (salonId, col) => collection(db, 'salons', salonId, col);
export const bookingsCol  = (salonId) => salonCol(salonId, 'bookings');
export const servicesCol  = (salonId) => salonCol(salonId, 'services');
export const timeSlotsCol = (salonId) => salonCol(salonId, 'timeSlots');
export const usersCol     = () => collection(db, 'users');

export const addDocument = async (colRef, data) => {
  const ref = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const setDocument = async (colRef, id, data) => {
  await setDoc(doc(colRef, id), { ...data, updatedAt: serverTimestamp() });
  return id;
};

export const getDocument = async (colRef, id) => {
  const snap = await getDoc(doc(colRef, id));
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const getDocuments = async (colRef, constraints) => {
  const c = constraints || [];
  const q = c.length ? query(colRef, ...c) : colRef;
  const snap = await getDocs(q);
  return snap.docs.map(function(d) {
    return { id: d.id, ...d.data() };
  });
};

export const updateDocument = async (colRef, id, data) => {
  await updateDoc(doc(colRef, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteDocument = async (colRef, id) => {
  await deleteDoc(doc(colRef, id));
};

export const subscribeToCollection = (colRef, constraints, callback) => {
  const c = constraints || [];
  const q = c.length ? query(colRef, ...c) : colRef;
  return onSnapshot(q, function(snap) {
    var docs = snap.docs.map(function(d) {
      return { id: d.id, ...d.data() };
    });
    callback(docs);
  });
};

export const runBatch = async (operationsFn) => {
  const batch = writeBatch(db);
  operationsFn(batch, db);
  await batch.commit();
};

export { where, orderBy, limit, serverTimestamp };