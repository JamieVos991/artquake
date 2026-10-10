<script>
  import { base } from "$app/paths";
  import logo from "$lib/assets/artquake-logo.avif";

  // Kleuren komen uit src/lib/styles/stylesheet.css
  const kleurGroepen = [
    {
      naam: "Zwart",
      rol: "Achtergrond, tekst op licht",
      tinten: [
        { hex: "#0B0B0B", token: "--color-bg" },
        { hex: "#242424", token: "--color-border" },
      ],
    },
    {
      naam: "Crème",
      rol: "Tekst op donker, lichte vlakken",
      tinten: [{ hex: "#F4F1EA", token: "--color-fg" }],
    },
    {
      naam: "Paars",
      rol: "Hoofdkleur, knoppen, accenten",
      tinten: [
        { hex: "#4A0BA0", token: "--color-primary-dark" },
        { hex: "#8A19E8", token: "--color-primary" },
        { hex: "#B57BF5", token: "--color-primary-light" },
      ],
    },
    {
      naam: "Oranje",
      rol: "Accent, labels, markering",
      tinten: [{ hex: "#F2A81C", token: "--color-accent" }],
    },
    {
      naam: "Grijs",
      rol: "Bijschriften, minder belangrijke tekst",
      tinten: [{ hex: "#9A9A9A", token: "--color-muted" }],
    },
  ];

  const koppen = [
    { naam: "Hero", spec: "Archivo 900 · 46–132px", klasse: "t-hero", tekst: "Jong talent" },
    { naam: "Paginatitel", spec: "Archivo 900 · 26–92px", klasse: "t-pagina", tekst: "Talent Night" },
    { naam: "Sectiekop", spec: "Archivo 900 · 34–64px", klasse: "t-sectie", tekst: "Samen werken we hard" },
    { naam: "Bloktitel", spec: "Archivo 900 · 40px", klasse: "t-blok", tekst: "Jam sessies" },
    { naam: "Naam", spec: "Archivo 900 · 19–24px", klasse: "t-naam", tekst: "Mado de Vries" },
    { naam: "Label", spec: "Space Mono 700 · 12px · 0,16em", klasse: "t-label", tekst: "WAT WE DOEN" },
  ];
</script>

<svelte:head>
  <title>Styleguide — Artquake</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<header class="sg-header">
  <a href={base || "/"}><img src={logo} alt="Artquake — naar home" /></a>
</header>

<main class="sg">
  <h1 class="sg-titel">Styleguide</h1>
  <p class="sg-intro">
    De huisstijl van de Artquake website: kleuren, typografie, knoppen en
    vaste onderdelen, zoals ze nu op de site staan.
  </p>

  <!-- 01 kleuren -->
  <section class="sg-sectie">
    <h2 class="sg-kop"><span>01</span> Kleuren</h2>
    <ul class="sg-kleuren">
      {#each kleurGroepen as g}
        <li class="sg-kleur">
          <div class="sg-staal">
            {#each g.tinten as t}
              <span style:background={t.hex}></span>
            {/each}
          </div>
          <div class="sg-kleur-info">
            <strong>{g.naam}</strong>
            <span class="sg-hex">{g.tinten.map((t) => t.hex).join(", ")}</span>
            <span class="sg-rol">{g.rol}</span>
          </div>
        </li>
      {/each}
    </ul>
  </section>

  <!-- 02 typografie -->
  <section class="sg-sectie">
    <h2 class="sg-kop"><span>02</span> Typografie</h2>
    <div class="sg-typo">
      <div>
        <h3 class="sg-subkop">Titels en koppen</h3>
        <ul class="sg-koppen">
          {#each koppen as k}
            <li>
              <p class={k.klasse}>{k.tekst}</p>
              <span class="sg-spec">{k.naam} · {k.spec}</span>
            </li>
          {/each}
        </ul>
      </div>
      <div>
        <h3 class="sg-subkop">Lopende tekst</h3>
        <p class="t-body">
          Artquake biedt oefenruimtes, organiseert optredens, exposities,
          events, workshops, masterclasses, lessen, coaching en promotie.
        </p>
        <span class="sg-spec">Space Mono 400 · 15px · regelhoogte 1,7</span>
        <p class="t-klein">
          Kleine tekst voor bijschriften en toelichting.
        </p>
        <span class="sg-spec">Space Mono 400 · 13px · regelhoogte 1,6</span>
        <p class="t-body sg-inline">
          <strong>Vet</strong> · <a href="#top">Link</a>
        </p>

        <h3 class="sg-subkop sg-subkop-ruim">Markering in koppen</h3>
        <p class="t-sectie sg-markering">
          Een <span class="m-paars">podium</span>, een
          <span class="m-donkerpaars">netwerk</span> en een
          <span class="m-blok">duw</span>
        </p>
        <span class="sg-spec">Paars woord · donkerpaars woord · oranje blok</span>
      </div>
    </div>
  </section>

  <!-- 03 knoppen -->
  <section class="sg-sectie">
    <h2 class="sg-kop"><span>03</span> Knoppen</h2>
    <div class="sg-knoppen">
      <div class="sg-knop-kolom sg-op-donker">
        <h3 class="sg-subkop">Hoofdknop (paars)</h3>
        <span class="k-paars">Normaal</span>
        <span class="k-paars is-hover">Hover</span>
        <span class="k-paars is-uit">Uitgeschakeld</span>
        <span class="sg-spec">Archivo 800 · 18px · ronding 26px</span>
      </div>
      <div class="sg-knop-kolom sg-op-donker">
        <h3 class="sg-subkop">Tweede knop (crème)</h3>
        <span class="k-creme">Doe mee</span>
        <span class="k-creme is-hover">Hover</span>
        <span class="sg-spec">Archivo 800 · 14px · ronding 26px</span>
      </div>
      <div class="sg-knop-kolom">
        <h3 class="sg-subkop">Overig</h3>
        <span class="k-menu" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="sg-spec">Menuknop · 56px · oranje met zwarte schaduw</span>
        <span class="k-rond" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </span>
        <span class="sg-spec">Bladerknop · 52px · rond</span>
        <span class="k-link">Bekijk alle makers</span>
        <span class="sg-spec">Tekstlink · Space Mono 700 · 12px · paarse streep</span>
      </div>
    </div>
  </section>

  <!-- 04 onderdelen -->
  <section class="sg-sectie">
    <h2 class="sg-kop"><span>04</span> Vaste onderdelen</h2>
    <div class="sg-onderdelen">
      <div>
        <h3 class="sg-subkop">Gekleurd vlak achter beeld</h3>
        <div class="sg-vlakken">
          <span class="o-vlak o-paars"></span>
          <span class="o-vlak o-oranje"></span>
          <span class="o-vlak o-creme"></span>
        </div>
        <span class="sg-spec">10–14px naar rechtsonder · paars, oranje of crème</span>
      </div>
      <div>
        <h3 class="sg-subkop">Blokken</h3>
        <div class="sg-blokken">
          <span class="o-blok o-blok-paars">01<b>Blok</b></span>
          <span class="o-blok o-blok-oranje">02<b>Blok</b></span>
          <span class="o-blok o-blok-creme">03<b>Blok</b></span>
        </div>
        <span class="sg-spec">Rechte hoeken · nummer in Space Mono · titel in Archivo 900</span>
      </div>
      <div>
        <h3 class="sg-subkop">Ruimte en lijnen</h3>
        <ul class="sg-maten">
          <li><i style:width="8px"></i>8px</li>
          <li><i style:width="14px"></i>14px</li>
          <li><i style:width="22px"></i>22px</li>
          <li><i style:width="40px"></i>40px</li>
          <li><i style:width="64px"></i>64px</li>
        </ul>
        <span class="sg-spec">Scheidingslijn tussen secties: 4px</span>
      </div>
    </div>
  </section>
</main>

<style>
  .sg-header {
    padding: 24px 40px;
    background: var(--color-bg);
  }
  .sg-header img {
    display: block;
    height: 80px;
    width: auto;
  }

  .sg {
    padding: 64px 40px 96px;
    background: #f1efe9;
    color: var(--color-bg);
    border-bottom: 4px solid var(--color-bg);
  }
  .sg > * {
    max-width: 1080px;
    margin-left: auto;
    margin-right: auto;
  }
  .sg-titel {
    margin-top: 0;
    margin-bottom: 12px;
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(34px, 5vw, 64px);
    line-height: 0.95;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }
  .sg-intro {
    margin-top: 0;
    margin-bottom: 0;
    font: 400 15px/1.7 var(--font-mono);
  }
  .sg-intro,
  .sg-titel {
    max-width: 1080px;
  }

  .sg-sectie {
    margin-top: 72px;
  }
  .sg-kop {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 0 0 28px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(11, 11, 11, 0.2);
    font-weight: 500;
    font-size: 26px;
  }
  .sg-kop span {
    font: 400 12px/1 var(--font-mono);
    color: var(--color-muted);
  }
  .sg-subkop {
    margin: 0 0 18px;
    font-weight: 600;
    font-size: 15px;
  }
  .sg-subkop-ruim {
    margin-top: 40px;
  }
  .sg-spec {
    display: block;
    margin-top: 6px;
    font: 400 11px/1.4 var(--font-mono);
    color: #6b6b6b;
  }

  /* kleuren */
  .sg-kleuren {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 16px;
  }
  .sg-kleur {
    background: #fff;
  }
  .sg-staal {
    display: flex;
    height: 96px;
  }
  .sg-staal span {
    flex: 1;
  }
  .sg-kleur-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 16px 16px;
  }
  .sg-kleur-info strong {
    font-size: 15px;
  }
  .sg-hex {
    font: 400 11px/1.4 var(--font-mono);
    color: #6b6b6b;
  }
  .sg-rol {
    font-size: 12px;
    color: #6b6b6b;
  }

  /* typografie */
  .sg-typo {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: 56px;
  }
  .sg-koppen {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .sg-koppen p {
    margin: 0;
    text-transform: uppercase;
  }
  .t-hero {
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(46px, 9vw, 132px);
    line-height: 0.86;
    letter-spacing: -0.035em;
  }
  .t-pagina {
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(26px, 8.4vw, 92px);
    line-height: 0.9;
    letter-spacing: -0.03em;
  }
  .t-sectie {
    font-weight: 900;
    font-stretch: 115%;
    font-size: clamp(34px, 4.6vw, 64px);
    line-height: 0.92;
    letter-spacing: -0.03em;
  }
  .t-blok {
    font-weight: 900;
    font-stretch: 118%;
    font-size: 40px;
    line-height: 0.9;
  }
  .t-naam {
    font-weight: 900;
    font-stretch: 110%;
    font-size: clamp(19px, 1.6vw, 24px);
    line-height: 1.05;
    text-transform: none !important;
  }
  .t-label {
    font: 700 12px/1 var(--font-mono);
    letter-spacing: 0.16em;
  }
  .t-body {
    margin: 0;
    font: 400 15px/1.7 var(--font-mono);
  }
  .t-klein {
    margin: 22px 0 0;
    font: 400 13px/1.6 var(--font-mono);
  }
  .sg-inline {
    margin-top: 22px;
  }
  .sg-inline a {
    color: var(--color-primary);
  }
  .sg-markering {
    margin: 0;
    font-size: clamp(24px, 2.6vw, 34px);
    line-height: 1.05;
    text-transform: uppercase;
  }
  .m-paars {
    color: var(--color-primary);
  }
  .m-donkerpaars {
    color: var(--color-primary-dark);
  }
  .m-blok {
    background: var(--color-accent);
    padding: 0 8px;
  }

  /* knoppen */
  .sg-knoppen {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .sg-knop-kolom {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 24px;
    background: #fff;
  }
  .sg-op-donker {
    background: var(--color-bg);
    color: var(--color-fg);
  }
  .sg-op-donker .sg-spec {
    color: var(--color-muted);
  }
  .sg-knop-kolom .sg-subkop {
    margin-bottom: 4px;
  }
  .k-paars {
    align-self: stretch;
    padding: 16px;
    border-radius: 26px;
    background: var(--color-primary);
    color: var(--color-fg);
    text-align: center;
    font: 800 18px/1 var(--font-display);
  }
  .k-paars.is-hover {
    background: var(--color-primary-dark);
  }
  .k-paars.is-uit {
    opacity: 0.6;
  }
  .k-creme {
    padding: 14px 32px;
    border-radius: 26px;
    background: var(--color-fg);
    color: var(--color-bg);
    font: 800 14px/1 var(--font-display);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .k-creme.is-hover {
    opacity: 0.8;
  }
  .k-menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    width: 56px;
    height: 56px;
    padding: 0 14px;
    background: var(--color-accent);
    border: 3px solid var(--color-bg);
    box-shadow: 4px 4px 0 var(--color-bg);
  }
  .k-menu i {
    display: block;
    height: 3px;
    background: var(--color-bg);
  }
  .k-menu i:nth-child(2) {
    width: 70%;
  }
  .k-rond {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    margin-top: 10px;
    border-radius: 50%;
    background: var(--color-accent);
  }
  .k-rond svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: var(--color-bg);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .k-link {
    margin-top: 10px;
    padding-bottom: 3px;
    border-bottom: 2px solid var(--color-primary);
    font: 700 12px/1 var(--font-mono);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  /* onderdelen */
  .sg-onderdelen {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 40px;
  }
  .sg-vlakken,
  .sg-blokken {
    display: flex;
    gap: 22px;
    margin-bottom: 20px;
  }
  .o-vlak {
    flex: 1;
    aspect-ratio: 4 / 5;
    background: #1b1b1b;
    box-shadow: 10px 10px 0 var(--color-primary);
  }
  .o-oranje {
    box-shadow: 10px 10px 0 var(--color-accent);
  }
  .o-creme {
    box-shadow: 10px 10px 0 var(--color-fg);
    outline: 1px solid rgba(11, 11, 11, 0.12);
  }
  .sg-blokken {
    gap: 10px;
  }
  .o-blok {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    aspect-ratio: 1;
    padding: 12px;
    font: 700 11px/1 var(--font-mono);
    letter-spacing: 0.14em;
  }
  .o-blok b {
    font: 900 20px/0.9 var(--font-display);
    letter-spacing: 0;
    text-transform: uppercase;
  }
  .o-blok-paars {
    background: var(--color-primary);
    color: var(--color-fg);
  }
  .o-blok-oranje {
    background: var(--color-accent);
  }
  .o-blok-creme {
    background: var(--color-fg);
    outline: 1px solid rgba(11, 11, 11, 0.12);
  }
  .sg-maten {
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font: 400 12px/1 var(--font-mono);
  }
  .sg-maten li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sg-maten i {
    display: block;
    height: 14px;
    background: var(--color-primary);
  }

  @media (max-width: 900px) {
    .sg-typo,
    .sg-knoppen,
    .sg-onderdelen {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .sg-header,
    .sg {
      padding-left: 20px;
      padding-right: 20px;
    }
    .sg-header img {
      height: 64px;
    }
  }
</style>
