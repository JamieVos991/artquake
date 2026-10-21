// De socials die je per artiest kunt invullen in het dashboard.
// veld: de naam in Firestore (artiesten/{id}), label: wat de bezoeker ziet.
export const artiestSocials = [
	{ veld: "instagram", label: "Instagram", voorbeeld: "https://www.instagram.com/…" },
	{ veld: "tiktok", label: "TikTok", voorbeeld: "https://www.tiktok.com/@…" },
	{ veld: "spotify", label: "Spotify", voorbeeld: "https://open.spotify.com/artist/…" },
	{ veld: "youtube", label: "YouTube", voorbeeld: "https://www.youtube.com/@…" },
	{ veld: "website", label: "Website", voorbeeld: "https://…" },
];

// Alleen echte webadressen als link gebruiken (geen javascript: e.d.).
// Zonder https:// ervoor (bv. "instagram.com/naam") wordt dat aangevuld.
export function veiligeLink(waarde) {
	const tekst = (waarde ?? "").trim();
	if (!tekst) return null;
	try {
		const url = new URL(/^[a-z]+:/i.test(tekst) ? tekst : `https://${tekst}`);
		return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
	} catch {
		return null;
	}
}

// De ingevulde socials van een artiest als [{ label, href }]
export function socialsVan(artiest) {
	return artiestSocials
		.map((x) => ({ label: x.label, href: veiligeLink(artiest[x.veld]) }))
		.filter((x) => x.href);
}
