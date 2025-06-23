import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDvj7q567ob2rg3GJJSjN7MUNiN-7MYYSE",
  authDomain: "quick-hitters.firebaseapp.com",
  databaseURL: "https://quick-hitters-default-rtdb.firebaseio.com",
  projectId: "quick-hitters",
  storageBucket: "quick-hitters.firebasestorage.app",
  messagingSenderId: "863555860780",
  appId: "1:863555860780:web:a72bcca0971e7ee7229489",
  measurementId: "G-EWL6QRMP89"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
