import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuration Firebase ta3 Afrechat El Wahrani
const firebaseConfig = {
  apiKey: "AIzaSyD0mKKOH8Suf5l7iVkB2aEIBCfOEYUlJ24",
  authDomain: "afrechat-el-wahrani.firebaseapp.com",
  projectId: "afrechat-el-wahrani",
  storageBucket: "afrechat-el-wahrani.firebasestorage.app",
  messagingSenderId: "502066301592",
  appId: "1:502066301592:web:833b27e0f82933da7adeed",
  measurementId: "G-3JQ5BPKBSK"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { collection, addDoc, getDocs, deleteDoc, doc };