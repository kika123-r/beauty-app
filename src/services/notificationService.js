// src/services/notificationService.js
import { doc, setDoc, getDoc, getDocs, collection, where, query, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const saveNotificationPreferences = async (userId, preferences) => {
  await setDoc(doc(db, 'notificationPreferences', userId), {
    ...preferences,
    updatedAt: serverTimestamp(),
  });
};

export const getNotificationPreferences = async (userId) => {
  const snap = await getDoc(doc(db, 'notificationPreferences', userId));
  return snap.exists() ? snap.data() : null;
};

export const getSubscribersForService = async (serviceId) => {
  const q = query(
    collection(db, 'notificationPreferences'),
    where('enabled', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ userId: d.id, ...d.data() }))
    .filter((u) =>
      u.services?.includes('all') || u.services?.includes(serviceId)
    );
};

export const createLastMinuteNotification = async (salonId, slot, service, subscribers) => {
  for (const subscriber of subscribers) {
    await addDoc(collection(db, 'notifications'), {
      userId:    subscriber.userId,
      email:     subscriber.email,
      salonId,
      slotId:    slot.id,
      serviceId: service.id,
      serviceName: service.name,
      date:      slot.date,
      time:      slot.time,
      price:     service.price,
      type:      'last_minute',
      read:      false,
      sent:      false,
      createdAt: serverTimestamp(),
    });
  }
};