// src/services/slotService.js
import { timeSlotsCol } from '../firebase/firestore';
import {
  addDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
} from '../firebase/firestore';
import { where } from '../firebase/firestore';
import { SLOT_STATUS } from '../constants';

export const createSlot = async (salonId, data) => {
  return await addDocument(timeSlotsCol(salonId), {
    ...data,
    status: SLOT_STATUS.AVAILABLE,
  });
};

export const getSlots = async (salonId) => {
  return await getDocuments(timeSlotsCol(salonId));
};

export const getSlotsForDate = async (salonId, date) => {
  return await getDocuments(timeSlotsCol(salonId), [
    where('date', '==', date),
  ]);
};

export const updateSlot = async (salonId, slotId, data) => {
  return await updateDocument(timeSlotsCol(salonId), slotId, data);
};

export const deleteSlot = async (salonId, slotId) => {
  return await deleteDocument(timeSlotsCol(salonId), slotId);
};

export const markAsLastMinute = async (salonId, slotId) => {
  return await updateDocument(timeSlotsCol(salonId), slotId, {
    status: SLOT_STATUS.LAST_MINUTE,
  });
};