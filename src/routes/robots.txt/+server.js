import { base } from "$app/paths";
import { SITE_DOMEIN, nietIndexeren } from "$lib/data/site.js";

// robots.txt wordt bij het bouwen gemaakt. Let op: zoekmachines lezen alleen
// de robots.txt in de hoofdmap van een domein. Op jamievos991.github.io/artquake
// telt dit bestand dus nog niet, op een eigen domein wel.
export const prerender = true;

export function GET() {
	const regels = [
		"User-agent: *",
		"Allow: /",
		...nietIndexeren.map((pad) => `Disallow: ${base}${pad}`),
		"",
		`Sitemap: ${SITE_DOMEIN}${base}/sitemap.xml`,
		"",
	];
	return new Response(regels.join("\n"), {
		headers: { "Content-Type": "text/plain" },
	});
}
