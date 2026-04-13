// src/services/serviceService.js
import { servicesCol } from '../firebase/firestore';
import {
  addDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
} from '../firebase/firestore';

export const createService = async (salonId, data) => {
  return await addDocument(servicesCol(salonId), data);
};

export const getServices = async (salonId) => {
  return await getDocuments(servicesCol(salonId));
};

export const updateService = async (salonId, serviceId, data) => {
  return await updateDocument(servicesCol(salonId), serviceId, data);
};

export const deleteService = async (salonId, serviceId) => {
  return await deleteDocument(servicesCol(salonId), serviceId);
};