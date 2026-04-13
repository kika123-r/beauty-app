// src/services/bookingService.js
import { bookingsCol, timeSlotsCol } from '../firebase/firestore';
import {
  addDocument,
  getDocuments,
  updateDocument,
  runBatch,
} from '../firebase/firestore';
import { where, orderBy, serverTimestamp } from '../firebase/firestore';
import { BOOKING_STATUS, SLOT_STATUS } from '../constants';
import { doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createBooking = async (salonId, clientId, slotId, serviceId) => {
  const slotRef = doc(db, 'salons', salonId, 'timeSlots', slotId);

  await runBatch((batch) => {
    const bookingRef = doc(bookingsCol(salonId));
    batch.set(bookingRef, {
      salonId,
      clientId,
      slotId,
      serviceId,
      status:    BOOKING_STATUS.CONFIRMED,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.update(slotRef, {
      status:    SLOT_STATUS.BOOKED,
      clientId,
      updatedAt: serverTimestamp(),
    });
  });
};

export const getBookingsForSalon = async (salonId) => {
  return await getDocuments(bookingsCol(salonId), [
    orderBy('createdAt', 'desc'),
  ]);
};

export const getBookingsForClient = async (salonId, clientId) => {
  return await getDocuments(bookingsCol(salonId), [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ]);
};

export const cancelBooking = async (salonId, bookingId, slotId) => {
  const slotRef = doc(db, 'salons', salonId, 'timeSlots', slotId);
  await runBatch((batch) => {
    const bookingRef = doc(bookingsCol(salonId), bookingId);
    batch.update(bookingRef, {
      status:    BOOKING_STATUS.CANCELLED,
      updatedAt: serverTimestamp(),
    });
    batch.update(slotRef, {
      status:    SLOT_STATUS.AVAILABLE,
      clientId:  null,
      updatedAt: serverTimestamp(),
    });
  });
};