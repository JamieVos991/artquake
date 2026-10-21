// Alleen de Firebase-app en inloggen (zonder database en opslag), zodat het
// menu de inlogstatus kan opvragen zonder de hele SDK binnen te halen.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyDlmqdPTEsJOcbwbjL1Luy51CnE52slGfo',
	authDomain: 'artquake-6fceb.firebaseapp.com',
	projectId: 'artquake-6fceb',
	storageBucket: 'artquake-6fceb.firebasestorage.app',
	messagingSenderId: '202630612295',
	appId: '1:202630612295:web:68bcc60a9cb14425f07862'
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
