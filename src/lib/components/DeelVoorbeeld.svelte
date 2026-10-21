<script>
  // Het voorbeeld dat WhatsApp, Instagram, Facebook enz. tonen als je een link deelt.
  // afbeelding: naam van een JPG in static/og/ (1200x630; AVIF werkt daar niet)
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import { SITE_DOMEIN } from "$lib/data/site.js";

  let { titel, beschrijving, afbeelding = "artquake", afbeeldingAlt = "Jonge makers op het podium bij Artquake" } = $props();

  const url = $derived(`${SITE_DOMEIN}${page.url.pathname}`);
  // base is in de build relatief (bijv. ".."), dus vanaf de pagina-URL uitrekenen
  const afbeeldingUrl = $derived(new URL(`${base}/og/${afbeelding}.jpg`, url).href);
</script>

<svelte:head>
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Artquake" />
  <meta property="og:locale" content="nl_NL" />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={titel} />
  <meta property="og:description" content={beschrijving} />
  <meta property="og:image" content={afbeeldingUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={afbeeldingAlt} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
