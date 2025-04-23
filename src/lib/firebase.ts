import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDrQcyAIMVbLNhJj-YB0swiqq7NuikVOQI",
    authDomain: "coldcasesync.firebaseapp.com",
    projectId: "coldcasesync",
    storageBucket: "coldcasesync.firebasestorage.app",
    messagingSenderId: "871924546082",
    appId: "1:871924546082:web:990459f138997eef1b287b",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };