import firebase from 'firebase';
import { firebaseConfig } from './config';

console.log('>>> firebaseConfig', firebaseConfig);
export const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebase;