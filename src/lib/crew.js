// Onthoudt in deze browser dat iemand van de crew hier heeft ingelogd. Alleen
// dan laadt het menu Firebase om te kijken of je nog bent ingelogd (voor
// Dashboard en Uitloggen); gewone bezoekers laden zo geen Firebase.
const SLEUTEL = "artquake-crew";

export function isCrewBrowser() {
	try {
		return localStorage.getItem(SLEUTEL) === "1";
	} catch {
		return false;
	}
}

export function markeerCrewBrowser(aan) {
	try {
		if (aan) localStorage.setItem(SLEUTEL, "1");
		else localStorage.removeItem(SLEUTEL);
	} catch {
		// geen opslag beschikbaar (privévenster): dan geen Dashboard in het menu
	}
}
