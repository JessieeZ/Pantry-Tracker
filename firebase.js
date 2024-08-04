import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
 apiKey: "AIzaSyCUVrkFbYJsK22P4F-W41pX_CuGJ7cYZUc",
  authDomain: "pantry-tracker-356b1.firebaseapp.com",
  projectId: "pantry-tracker-356b1",
  storageBucket: "pantry-tracker-356b1.appspot.com",
  messagingSenderId: "923049348677",
  appId: "1:923049348677:web:a249a9adaef944c1439d2c",
 };
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };