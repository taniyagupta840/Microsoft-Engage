import firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/database';

const config = {
    apiKey: "AIzaSyAKvkSFi4_G0SY2EE6W9bzIU5MsH6PDI20",
    authDomain: "engage-be755.firebaseapp.com",
    projectId: "engage-be755",
    storageBucket: "engage-be755.appspot.com",
    messagingSenderId: "417055963386",
    appId: "1:417055963386:web:63a75a24c321aa60a8b143",
    measurementId: "G-97ZL8NQF5H"
  };

export default firebase.initializeApp(config);

export const firebaseAuth = firebase.auth();
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider.PROVIDER_ID;
export const EmailAuthProvider =  firebase.auth.EmailAuthProvider.PROVIDER_ID;

export const firebaseStorage = firebase.storage();
export const firebaseStorageTaskStatePAUSED = firebase.storage.TaskState.PAUSED;
export const firebaseStorageTaskStateRUNNING = firebase.storage.TaskState.RUNNING;
export const firebaseStorageTaskEventSTATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;

export const firebaseDatabase = firebase.database();