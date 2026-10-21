// Het domein waarop de site draait, zonder pad en zonder slash aan het eind.
// Wordt gebruikt voor sitemap.xml en robots.txt. Gaat de site over naar een
// eigen domein (bv. https://art-quake.com), pas het dan hier aan; zet dan ook
// paths.base in svelte.config.js en vite.config.js op ''.
export const SITE_DOMEIN = "https://jamievos991.github.io";

// Pagina's die niet in zoekmachines horen (alleen voor de crew)
export const nietIndexeren = ["/login", "/dashboard", "/reserveren", "/styleguide"];
