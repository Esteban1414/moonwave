import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from 'firebase-admin/auth';
import { Resend } from 'resend';

import dotenv from 'dotenv';

const resend = new Resend(process.env.RESEND_API_KEY);

dotenv.config();

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Convierte \n textual a saltos reales

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey 
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
};

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
const db = getFirestore(app);

export { db, getAuth, resend };
