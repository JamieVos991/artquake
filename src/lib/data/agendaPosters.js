// Poster van een agenda-item. Posters beheer je in het dashboard (posterUrl).
//
// Een paar posters zijn eerst in de website zelf gezet (src/lib/assets/fotos/posters),
// gekoppeld aan het Firestore-document-id. Zodra iemand van de crew het dashboard
// opent, worden die één keer naar Firebase Storage gezet en krijgt het item
// posterUrl + posterOvergezet. Daarna zijn het gewone posters: vervangen of
// weghalen kan in het dashboard, en de ingebouwde versie wordt niet meer gebruikt.
const bestanden = import.meta.glob("../assets/fotos/posters/*.avif", {
	eager: true,
	import: "default",
});

const ingebouwdPerItem = {
	hQkV9A7FfS7qXjaMxEbH: "alkmaars-bierhuis-7-november", // Artquake in het Alkmaars Bierhuis
	VASzcdhXdtdrxpqRhHmH: "workshop-muziekproductie-november", // Workshop muziekproductie 5 nov
	"2oRhIc4iyUBarqPYyz12": "workshop-muziekproductie-november", // Workshop muziekproductie 9 nov
};

// De ingebouwde poster die nog naar Storage moet: { naam, url } of null
export function ingebouwdePoster(item) {
	const naam = ingebouwdPerItem[item.id];
	if (!naam || item.posterUrl || item.posterOvergezet) return null;
	const url = bestanden[`../assets/fotos/posters/${naam}.avif`];
	return url ? { naam, url } : null;
}

export function agendaPoster(item) {
	return item.posterUrl || ingebouwdePoster(item)?.url || "";
}
