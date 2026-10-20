import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "$lib/firebase.js";

// maakt de foto kleiner (max 1600px breed of hoog, WebP) zodat de
// website snel blijft; lukt dat niet, dan gaat het origineel omhoog
async function verkleinFoto(bestand) {
	try {
		const beeld = await createImageBitmap(bestand);
		const schaal = Math.min(1, 1600 / Math.max(beeld.width, beeld.height));
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(beeld.width * schaal);
		canvas.height = Math.round(beeld.height * schaal);
		canvas.getContext("2d").drawImage(beeld, 0, 0, canvas.width, canvas.height);
		const blob = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.82));
		return blob ?? bestand;
	} catch {
		return bestand;
	}
}

// Uploadt een gekozen foto naar een map in Firebase Storage en geeft de
// link terug. onVoortgang krijgt 0–100. Gooit een Error met een Nederlandse
// melding die zo in het dashboard getoond kan worden.
export async function uploadFoto(bestand, map, onVoortgang = () => {}) {
	if (!bestand.type.startsWith("image/")) {
		throw new Error("Kies een afbeelding (jpg, png, webp…).");
	}
	onVoortgang(0);
	try {
		const blob = await verkleinFoto(bestand);
		const extensie = blob.type === "image/webp" ? "webp" : bestand.name.split(".").pop();
		const naam = bestand.name
			.replace(/\.[^.]+$/, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.slice(0, 40);
		const plek = ref(storage, `${map}/${Date.now()}-${naam}.${extensie}`);
		const taak = uploadBytesResumable(plek, blob, { contentType: blob.type });
		taak.on("state_changed", (s) =>
			onVoortgang(Math.round((s.bytesTransferred / s.totalBytes) * 100))
		);
		await taak;
		return await getDownloadURL(plek);
	} catch (err) {
		throw new Error(
			err?.code === "storage/unauthorized"
				? "Uploaden niet toegestaan: de opslagregels in Firebase staan dit nog niet toe."
				: "Uploaden mislukt. Probeer het opnieuw."
		);
	}
}
