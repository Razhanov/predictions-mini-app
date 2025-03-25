import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCMox-PAcprAptJJRqWCqzt6mM0jUcCYBE",
    authDomain: "predictions-tg.firebaseapp.com",
    projectId: "predictions-tg",
    storageBucket: "predictions-tg.firebasestorage.app",
    messagingSenderId: "249196114641",
    appId: "1:249196114641:web:0ae2d25280b93d74c94bf0",
    measurementId: "G-GQR83D7Y7Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };