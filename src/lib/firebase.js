// De volledige Firebase-SDK: inloggen, database en bestandsopslag. Alleen
// in gebruik op de crewpagina's (login, dashboard, reserveren). Openbare
// pagina's lezen via $lib/publiekeData.js, dat scheelt een halve megabyte.
// Bezoekstatistieken lopen via Plausible (app.html), niet via Firebase.
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { app, auth } from './firebaseApp.js';

export { app, auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
