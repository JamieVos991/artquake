// Openbare gegevens (agenda en artiesten) lezen zonder de Firebase-SDK.
// De SDK is ruim een halve megabyte JavaScript; voor alleen lezen is een
// gewone fetch naar de Firestore REST-API genoeg. De Firestore-regels staan
// lezen van deze collecties voor iedereen toe. Het dashboard en reserveren
// gebruiken wel de SDK (schrijven, inloggen, live bijwerken).
const PROJECT = "artquake-6fceb";
const BASIS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// Firestore REST geeft elk veld als { stringValue: "…" }, { integerValue: "3" } enz.
function waarde(v) {
	if ("stringValue" in v) return v.stringValue;
	if ("integerValue" in v) return Number(v.integerValue);
	if ("doubleValue" in v) return v.doubleValue;
	if ("booleanValue" in v) return v.booleanValue;
	if ("timestampValue" in v) return v.timestampValue;
	if ("nullValue" in v) return null;
	if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(waarde);
	if ("mapValue" in v) return velden(v.mapValue.fields ?? {});
	return undefined;
}

function velden(f) {
	return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, waarde(v)]));
}

// Haalt alle documenten van een collectie op als [{ id, ...velden }].
export async function haalCollectieOp(naam) {
	const docs = [];
	let pagina = "";
	do {
		const url = `${BASIS}/${naam}?pageSize=300${pagina ? `&pageToken=${pagina}` : ""}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`${naam} laden mislukt (${res.status})`);
		const data = await res.json();
		for (const d of data.documents ?? []) {
			docs.push({ id: d.name.split("/").pop(), ...velden(d.fields ?? {}) });
		}
		pagina = data.nextPageToken ?? "";
	} while (pagina);
	return docs;
}

// Haalt één document op als { id, ...velden }, of null als het niet bestaat.
export async function haalDocumentOp(naam, id) {
	const res = await fetch(`${BASIS}/${naam}/${encodeURIComponent(id)}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`${naam}/${id} laden mislukt (${res.status})`);
	const d = await res.json();
	return { id, ...velden(d.fields ?? {}) };
}
