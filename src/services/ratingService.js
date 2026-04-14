import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createRating = async (salonId, clientId, bookingId, rating, comment) => {
  await addDoc(collection(db, 'salons', salonId, 'ratings'), {
    clientId,
    bookingId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
};

export const getRatings = async (salonId) => {
  const snap = await getDocs(collection(db, 'salons', salonId, 'ratings'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const hasRated = async (salonId, bookingId) => {
  const snap = await getDocs(query(
    collection(db, 'salons', salonId, 'ratings'),
    where('bookingId', '==', bookingId)
  ));
  return !snap.empty;
};
