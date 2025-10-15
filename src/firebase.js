import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config for database
const firebaseConfig = {
  apiKey: "AIzaSyCui8RSfPwF1ng6ho7P6xv2OGNUDAtTEZc",
  authDomain: "toms-movie.firebaseapp.com",
  projectId: "toms-movie",
  storageBucket: "toms-movie.firebasestorage.app",
  messagingSenderId: "392109328819",
  appId: "1:392109328819:web:018e5b4173c19b73cca3c6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);