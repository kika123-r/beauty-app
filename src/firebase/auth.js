// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export const registerUser = async ({ name, email, password, role = 'client', salonId = null }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, 'users', user.uid), {
    uid:              user.uid,
    name,
    email,
    phone:            '',
    role,
    salonId,
    reliabilityScore: 100,
    createdAt:        serverTimestamp(),
    updatedAt:        serverTimestamp(),
  });

  return user;
};

export const loginUser = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const logoutUser = () => signOut(auth);

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);