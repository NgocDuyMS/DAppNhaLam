// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABFYRMISd6LDIFD50iKlGSRbBlBGNIOwY",
  authDomain: "dappnhalam.firebaseapp.com",
  projectId: "dappnhalam",
  storageBucket: "dappnhalam.firebasestorage.app",
  messagingSenderId: "1090867008234",
  appId: "1:1090867008234:web:4bc0fa98a52c2ef7107d93",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
