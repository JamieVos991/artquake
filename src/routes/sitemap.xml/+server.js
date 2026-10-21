import { base } from "$app/paths";
import { diensten } from "$lib/data/diensten.js";
import { SITE_DOMEIN } from "$lib/data/site.js";

// sitemap.xml wordt bij het bouwen gemaakt, met alle openbare pagina's;
// een nieuwe dienst in diensten.js komt er vanzelf in
export const prerender = true;

export function GET() {
	const paden = [
		"/",
		"/artiesten",
		...diensten.filter((d) => !d.pand).map((d) => `/diensten/${d.slug}`),
		"/privacybeleid",
		"/algemene-voorwaarden",
	];
	const urls = paden
		.map((pad) => `  <url><loc>${SITE_DOMEIN}${base}${pad === "/" ? "/" : pad}</loc></url>`)
		.join("\n");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
		{ headers: { "Content-Type": "application/xml" } }
	);
}
