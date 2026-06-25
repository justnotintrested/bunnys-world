// ── Firebase Config ────────────────────────────────────────────
// Bunny's World — anna-birthday-site

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, update, remove }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAvEc04TFiGuYnDkgPQID9LFaU3Ot1dBnc",
  authDomain:        "anna-birthday-site.firebaseapp.com",
  databaseURL:       "https://anna-birthday-site-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "anna-birthday-site",
  storageBucket:     "anna-birthday-site.firebasestorage.app",
  messagingSenderId: "972555476285",
  appId:             "1:972555476285:web:5dfd0ac26dd7df9b9f7954"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export { app, db, ref, set, get, push, onValue, update, remove };
