// Staat een artiest op de website? Niet als hij in het dashboard op inactief
// staat, en ook niet zolang er nog geen foto is.
export function artiestZichtbaar(a) {
	return !!a.naam && !a.inactief && !!a.imageUrl;
}
