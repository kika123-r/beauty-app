import { collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createRepeatBooking = async (salonId, clientId, serviceId, interval, startDate, time) => {
  await addDoc(collection(db, 'salons', salonId, 'repeatBookings'), {
    clientId,
    serviceId,
    interval,
    startDate,
    time,
    active: true,
    createdAt: serverTimestamp(),
  });
};

export const getRepeatBookings = async (salonId, clientId) => {
  const snap = await getDocs(query(
    collection(db, 'salons', salonId, 'repeatBookings'),
    where('clientId', '==', clientId)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteRepeatBooking = async (salonId, id) => {
  await deleteDoc(doc(db, 'salons', salonId, 'repeatBookings', id));
};
