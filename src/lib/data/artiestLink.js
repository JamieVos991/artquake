// Eigen link per artiest: /artiesten#leech opent meteen de popup van Leech.
// Het stukje na # is de naam in kleine letters met streepjes.
export function artiestSlug(artiest) {
	return (artiest.naam ?? "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "") // é wordt e
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

// Zoekt de artiest bij een #-link; ook een document-id werkt.
export function vindArtiestBijSlug(artiesten, hash) {
	const slug = decodeURIComponent((hash ?? "").replace(/^#/, ""));
	if (!slug) return null;
	return artiesten.find((a) => artiestSlug(a) === slug) ?? artiesten.find((a) => a.id === slug) ?? null;
}
