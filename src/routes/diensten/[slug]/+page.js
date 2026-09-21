import { error } from "@sveltejs/kit";
import { diensten, vindDienst } from "$lib/data/diensten.js";

export const prerender = true;

export function entries() {
	return diensten.map((d) => ({ slug: d.slug }));
}

export function load({ params }) {
	const dienst = vindDienst(params.slug);
	if (!dienst) error(404, "Dienst niet gevonden");
	return { dienst };
}
