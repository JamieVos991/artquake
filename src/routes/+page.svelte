<script>
  import logo from "$lib/assets/artquake-logo.avif";
  import { base } from "$app/paths";
  import dewiUitlegVideo from "$lib/assets/videos/dewi-uitleg.mp4";

  const heroModules = import.meta.glob("../lib/assets/pictures/hero/*.avif", {
    eager: true,
    import: "default",
  });
  const heroImages = Object.values(heroModules);
  const firstHeroImage = heroImages[0];

  let heroIndex = $state(0);
  let heroRevealed = $state(heroImages.length > 0 ? 1 : 0);

  $effect(() => {
    if (heroImages.length <= 1) return;
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const id = idle(() => {
      heroRevealed = heroImages.length;
    });
    return () => cancelIdle(id);
  });

  $effect(() => {
    if (heroImages.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      heroIndex = (heroIndex + 1) % heroImages.length;
    }, 3000);
    return () => clearInterval(id);
  });

  let videoEl = $state();
  let videoMuted = $state(true);

  function toggleVideoMute() {
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    videoMuted = videoEl.muted;
  }

  $effect(() => {
    if (!videoEl) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(videoEl);
    return () => observer.disconnect();
  });

  const ticks = [
    "OPTREDENS",
    "EXPOSITIES",
    "EVENTS",
    "WORKSHOPS",
    "MASTERCLASSES",
    "COACHING",
    "PROMOTIE",
  ];

  const services = [
    {
      id: "01",
      title: "TALENT\nNIGHT",
      text: "Dé uitgaansavond voor en door jongeren. Bomvol jong, aanstormend talent — voor liefhebbers van live-muziek, dansen en feesten.",
      bg: "purple",
      big: true,
    },
    { id: "02", title: "EXPO\nSITIES", bg: "cream" },
    { id: "03", title: "JAM\nSESSIES", bg: "cream", outline: true },
    {
      id: "04",
      title: "STREEKMARKT\nBROEKERVEILING",
      bg: "cream",
      wide: true,
      long: true,
    },
    { id: "05", title: "FOTO\nSHOOTS", bg: "purple" },
    {
      id: "06",
      title: "WORKSHOPS\nEN MASTERCLASSES",
      bg: "orange",
      long: true,
    },
    { id: "07", title: "COACHING", bg: "cream" },
    { id: "08", title: "IN\nOPDRACHT", bg: "purple" },
  ];

  const agenda = [
    {
      date: "12.09",
      iso: "2026-09-12",
      title: "BASSKELDER — OPEN PODIUM XL",
      meta: "Rotterdam · 20:00",
      tag: "LAATSTE 9",
      tagBg: "orange",
      bg: "dark",
    },
    {
      date: "27.09",
      iso: "2026-09-27",
      title: "EXPO: JONG & ONGEFILTERD",
      meta: "Utrecht · hele dag",
      tag: "VRIJE INLOOP",
      tagBg: "purple",
      bg: "cream",
    },
    {
      date: "10.10",
      iso: "2026-10-10",
      title: "MASTERCLASS: STEM & RUIMTE",
      meta: "Den Haag · 15:00",
      tag: "UITVERKOCHT",
      tagBg: "purple",
      bg: "dark",
    },
    {
      date: "02.11",
      iso: "2026-11-02",
      title: "ARTQUAKE FEST — 3 PODIA",
      meta: "Amsterdam · 14:00",
      tag: "TICKETS",
      tagBg: "cream",
      bg: "purple",
    },
  ];

  const talents = [
    { name: "NAÏMA K.", role: "RAP / SPOKEN", bg: "dark" },
    { name: "DUO ZEEF", role: "TEXTIEL", bg: "cream" },
    { name: "BROER V.", role: "BEATS", bg: "purple" },
  ];

  const crew = [
    { name: "MADO DE VRIES", role: "OPRICHTER", bg: "purple" },
    { name: "MADO DE VRIES", role: "PROGRAMMA", bg: "orange" },
    {
      name: "MADO DE VRIES",
      role: "TECHNIEK",
      bg: "cream",
      roleColor: "purple",
    },
    {
      name: "MADO DE VRIES",
      role: "COACHING",
      bg: "cream",
      roleColor: "purple",
    },
    { name: "MADO DE VRIES", role: "PROMOTIE", bg: "purple" },
    { name: "MADO DE VRIES", role: "PRODUCTIE", bg: "orange" },
  ];
</script>

<svelte:head>
  <title>Artquake — Jong talent maakt lawaai</title>
  {#if firstHeroImage}
    <link rel="preload" as="image" href={firstHeroImage} fetchpriority="high" />
  {/if}
</svelte:head>

<header class="hero-shell">
  <a class="brand" href="{base}">
    <img class="brand-logo" src={logo} alt="Artquake — creative space" />
  </a>

  <section class="hero" id="hero" aria-label="Introductie">
    <figure class="hero-image">
      {#each heroImages as src, i}
        {#if i < heroRevealed}
          <img
            class="hero-photo"
            class:active={i === heroIndex}
            {src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            fetchpriority={i === 0 ? "high" : undefined}
          />
        {/if}
      {/each}
      {#if heroImages.length === 0}
        <figcaption>Drop hero foto — publiek / artiest, 2400×1600</figcaption>
      {/if}
    </figure>
    <h1 class="hero-copy">
      <span class="hero-line hero-line-orange">JONG TALENT</span>
      <span class="hero-line hero-line-cream">MAAKT LAWAAI</span>
    </h1>
  </section>
</header>

<main class="page-main">
  <p class="stripe-bar" aria-hidden="true">
    <span class="stripe stripe-orange"></span>
    <span class="stripe stripe-purple"></span>
    <span class="stripe stripe-cream"></span>
    <span class="stripe stripe-dark"></span>
    <span class="stripe stripe-orange"></span>
    <span class="stripe stripe-purple"></span>
  </p>

  <section class="mission" aria-label="Missie">
    <h2 class="mission-title">
      WIJ GEVEN JONGE MAKERS EEN <span class="hl-purple">PODIUM</span>, EEN
      <span class="hl-purple-dark">NETWERK</span> EN EEN FLINKE
      <span class="hl-orange-block">DUW</span>.
    </h2>
    <aside class="mission-side">
      <p>
        Artquake organiseert optredens, exposities, events, workshops,
        masterclasses, coaching en promotie. Alles wat je nodig hebt om jezelf
        verder te ontwikkelen — behalve slaap.
      </p>
      <p class="mission-stats">339+ MAKERS · 58 EVENTS · 12 STEDEN</p>
    </aside>
  </section>

  <section class="services" id="services" aria-label="Wat we doen">
    <header class="section-head">
      <h2 class="section-eyebrow eyebrow-orange">01 — WAT WE DOEN</h2>
      <span class="section-rule"></span>
    </header>
    <ul class="services-grid">
      {#each services as s}
        <li
          class="service-card bg-{s.bg}"
          class:service-big={s.big}
          class:service-wide={s.wide}
          class:service-outline={s.outline}
          class:service-long={s.long}
        >
          <span class="service-id">☆ {s.id}</span>
          <h3 class="service-title">
            {#each s.title.split("\n") as line, i}{#if i > 0}<br
                />{/if}{line}{/each}
          </h3>
          {#if s.text}<p class="service-text">{s.text}</p>{/if}
        </li>
      {/each}
    </ul>
  </section>

  <section class="agenda" id="agenda" aria-label="Agenda najaar 2026">
    <header class="agenda-head">
      <h2 class="agenda-title">AGENDA<br />NAJAAR '26</h2>
      <a class="agenda-cta" href="#agenda"
        >ALLE EVENTS →<br />GRATIS VOOR LEDEN</a
      >
    </header>
    <ol class="agenda-list">
      {#each agenda as ev}
        <li class="agenda-row bg-{ev.bg}">
          <time class="agenda-date" datetime={ev.iso}>{ev.date}</time>
          <h3 class="agenda-name">{ev.title}</h3>
          <p class="agenda-meta">{ev.meta}</p>
          <span class="agenda-tag bg-{ev.tagBg}">{ev.tag}</span>
        </li>
      {/each}
    </ol>
  </section>

  <section class="talent" id="talent" aria-label="Talent van nu">
    <header class="section-head section-head-dark">
      <h2 class="section-eyebrow eyebrow-purple">02 — TALENT VAN NU</h2>
      <span class="section-rule section-rule-dark"></span>
      <span class="section-count">340 MAKERS</span>
    </header>
    <ul class="talent-grid">
      {#each talents as t}
        <li class="talent-card bg-{t.bg}">
          <figure class="talent-photo">
            <figcaption>[ ARTIESTFOTO<br />1200×1500 ]</figcaption>
          </figure>
          <hgroup class="talent-meta">
            <h3 class="talent-name">{t.name}</h3>
            <p class="talent-role">{t.role}</p>
          </hgroup>
        </li>
      {/each}
    </ul>
  </section>

  <section class="crew" id="crew" aria-label="De crew">
    <header class="section-head">
      <h2 class="section-eyebrow eyebrow-orange">03 — DE CREW</h2>
      <span class="section-rule"></span>
      <span class="section-count">14 KOPPEN · 1 PLAN</span>
    </header>
    <h3 class="crew-title">
      SAMEN WERKEN WE <span class="hl-purple">HARD</span> ZODAT MAKERS ALLEEN
      MAAR HOEVEN TE
      <span class="hl-orange-block">MAKEN</span>.
    </h3>
    <ul class="crew-grid">
      {#each crew as c}
        <li class="crew-card bg-{c.bg}">
          <figure class="crew-photo">
            <figcaption>Portret · 1200×1500</figcaption>
          </figure>
          <hgroup class="crew-meta">
            <h4 class="crew-name">{c.name}</h4>
            <p class="crew-role" class:role-purple={c.roleColor === "purple"}>
              {c.role}
            </p>
          </hgroup>
        </li>
      {/each}
    </ul>
  </section>

  <section class="video-section" id="video" aria-label="Video">
    <header class="section-head">
      <h2 class="section-eyebrow eyebrow-purple">04 — IN BEELD</h2>
      <span class="section-rule"></span>
    </header>
    <h3 class="video-title">
      HOOR HET VAN <span class="hl-orange-block">DEWI</span> ZELF.
    </h3>
    <figure class="video-frame">
      <video
        bind:this={videoEl}
        class="video-player"
        controls
        muted
        playsinline
        preload="metadata"
      >
        <source src={dewiUitlegVideo} type="video/mp4" />
        Je browser ondersteunt deze video niet.
      </video>
      <button
        type="button"
        class="video-unmute"
        aria-pressed={!videoMuted}
        onclick={toggleVideoMute}
      >
        <span aria-hidden="true"></span>
        {videoMuted ? "GELUID AAN" : "DEMPEN"}
      </button>
    </figure>
  </section>

  <section class="cta" id="doe-mee" aria-label="Contact">
    <span class="cta-blob" aria-hidden="true"></span>
    <hgroup class="cta-copy">
      <h2 class="cta-title">VRAAG HET<br />GEWOON.<br />SERIEUS.</h2>
      <p class="cta-text">
        Een vraag, een idee, of gewoon interesse? Stuur ons een berichtje — we
        reageren binnen twee werkdagen, geen kastje-muur-verhaal.
      </p>
    </hgroup>
    <form class="cta-form">
      <p class="cta-form-label">CONTACT</p>
      <label class="cta-field-label">
        <span class="visually-hidden">Naam</span>
        <input
          class="cta-field"
          type="text"
          name="naam"
          placeholder="naam"
          autocomplete="name"
        />
      </label>
      <label class="cta-field-label">
        <span class="visually-hidden">E-mail</span>
        <input
          class="cta-field"
          type="email"
          name="email"
          placeholder="e-mail"
          autocomplete="email"
        />
      </label>
      <label class="cta-field-label">
        <span class="visually-hidden">Je vraag of bericht</span>
        <textarea
          class="cta-field cta-textarea"
          name="bericht"
          placeholder="je vraag of bericht"
          rows="3"
        ></textarea>
      </label>
      <button type="submit" class="cta-submit">VERSTUUR</button>
    </form>
  </section>
</main>

<footer class="footer">
  <img class="footer-brand" src={logo} alt="Artquake — creative space" />
  <p class="footer-tag">
    Creatief &amp; cultureel jongerenplatform.<br />Jongerenkunst ·
    talentontwikkeling.
  </p>
  <nav class="footer-col" aria-label="Doen">
    <h3 class="footer-heading heading-orange">DOEN</h3>
    <ul>
      <li>Optredens</li>
      <li>Exposities</li>
      <li>Events</li>
      <li>Workshops</li>
    </ul>
  </nav>
  <nav class="footer-col" aria-label="Groeien">
    <h3 class="footer-heading heading-lilac">GROEIEN</h3>
    <ul>
      <li>Masterclasses</li>
      <li>Coaching</li>
      <li>Promotie</li>
      <li>Netwerk</li>
    </ul>
  </nav>
  <nav class="footer-col" aria-label="Contact">
    <h3 class="footer-heading heading-cream">CONTACT</h3>
    <ul>
      <li><a href="mailto:hoi@artquake.nl">hoi@artquake.nl</a></li>
      <li><a href="https://instagram.com">Instagram</a></li>
      <li><a href="https://tiktok.com">TikTok</a></li>
      <li><a href="#doe-mee">Nieuwsbrief</a></li>
    </ul>
  </nav>
  <p class="footer-bottom">
    <span>© 2026 ARTQUAKE</span><span
      >MADE LOUD IN NL BY <a href="https://lychees.studio">LYCHEES.STUDIO</a
      ></span
    >
  </p>
</footer>

<style>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.page-main) {
    background: var(--color-bg);
    display: block;
  }

  .bg-dark {
    background: var(--color-bg);
    color: var(--color-fg);
  }
  .bg-cream {
    background: var(--color-fg);
    color: var(--color-bg);
  }
  .bg-orange {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .bg-purple {
    background: var(--color-primary);
    color: var(--color-fg);
  }

  /* marquee */
  .marquee {
    margin: 0;
    height: 46px;
    background: var(--color-accent);
    color: var(--color-bg);
    display: flex;
    align-items: center;
    overflow: hidden;
    border-bottom: 4px solid var(--color-bg);
  }
  .marquee-track {
    display: flex;
    white-space: nowrap;
    animation: aq-march 26s linear infinite;
    font:
      700 13px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }
  .marquee-set {
    padding: 0 22px;
  }
  @keyframes aq-march {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  /* scroll-driven reveal animations */
  @keyframes aq-rise {
    from {
      transform: translateY(60px) rotate(-1.1deg);
    }
    to {
      transform: translateY(0) rotate(0);
    }
  }
  @keyframes aq-left {
    from {
      transform: translateX(-90px) rotate(2deg);
    }
    to {
      transform: translateX(0) rotate(0);
    }
  }
  @keyframes aq-right {
    from {
      transform: translateX(90px) rotate(-2deg);
    }
    to {
      transform: translateX(0) rotate(0);
    }
  }
  @keyframes aq-pop {
    from {
      transform: scale(0.86) rotate(-4deg);
    }
    to {
      transform: scale(1) rotate(0);
    }
  }
  @keyframes aq-skew {
    from {
      transform: translateY(40px) scale(1.06);
    }
    to {
      transform: translateY(0) scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .mission,
    .services-grid,
    .agenda-list,
    .talent-grid,
    .crew-grid,
    .cta-copy,
    .cta-form,
    .video-title,
    .video-frame {
      animation: none !important;
    }
  }

  /* hero always fills the viewport; nav floats on top of it */
  .hero-shell {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
  }

  /* brand */
  .brand {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 16px 30px;
  }
  .brand-logo {
    height: 80px;
    width: auto;
    display: block;
  }

  /* hero */
  .hero {
    position: relative;
    flex: 1 1 auto;
    min-height: 280px;
    background: var(--color-bg);
    border-bottom: 4px solid var(--color-fg);
    overflow: hidden;
  }
  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #151515;
  }
  .hero-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1.5s ease;
  }
  .hero-photo.active {
    opacity: 1;
  }
  .hero-image figcaption {
    color: #6b6b6b;
    font:
      400 12px/1.4 "Space Mono",
      monospace;
    text-align: center;
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-photo {
      transition: none;
    }
  }
  .hero-image::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
        180deg,
        rgba(11, 11, 11, 0.55) 0%,
        rgba(11, 11, 11, 0.15) 34%,
        rgba(11, 11, 11, 0.82) 100%
      ),
      radial-gradient(
        120% 80% at 70% 20%,
        rgba(138, 25, 232, 0.22),
        transparent 60%
      );
  }
  .hero-copy {
    position: absolute;
    left: 40px;
    right: 40px;
    bottom: 52px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .hero-line {
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(46px, 9vw, 132px);
    line-height: 0.86;
    letter-spacing: -0.035em;
  }
  .hero-line-orange {
    color: var(--color-accent);
    text-shadow: 9px 9px 0 var(--color-bg);
  }
  .hero-line-cream {
    color: var(--color-fg);
    text-shadow: 9px 9px 0 var(--color-primary);
  }

  /* stripe bar */
  .stripe-bar {
    margin: 0;
    display: flex;
    height: 74px;
    border-bottom: 4px solid var(--color-fg);
  }
  .stripe {
    flex: 1;
  }
  .stripe-orange {
    background: var(--color-accent);
  }
  .stripe-purple {
    background: var(--color-primary);
  }
  .stripe-cream {
    background: var(--color-fg);
  }
  .stripe-dark {
    background: var(--color-bg);
  }

  /* mission */
  .mission {
    background: var(--color-fg);
    color: var(--color-bg);
    padding: clamp(36px, 5vw, 70px) clamp(16px, 4vw, 60px);
    border-bottom: 4px solid var(--color-bg);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 340px);
    gap: clamp(20px, 4vw, 60px);
    align-items: start;
    animation: aq-rise linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 32%;
  }
  .mission-title {
    margin: 0;
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(40px, 6.4vw, 92px);
    line-height: 0.9;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }
  .hl-purple {
    color: var(--color-primary);
  }
  .hl-purple-dark {
    color: var(--color-primary-dark);
  }
  .hl-orange-block {
    background: var(--color-accent);
    padding: 0 8px;
  }
  .mission-side {
    display: flex;
    flex-direction: column;
    gap: 18px;
    font:
      400 13px/1.6 "Space Mono",
      monospace;
    border-left: 3px solid var(--color-bg);
    padding-left: 18px;
    margin: 0;
  }
  .mission-side p {
    margin: 0;
  }
  .mission-stats {
    font-weight: 700;
  }

  /* section head */
  .section-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 0 20px 26px;
    color: var(--color-fg);
  }
  .section-head-dark {
    padding: 0 8px 26px;
    color: var(--color-bg);
  }
  .section-eyebrow {
    margin: 0;
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }
  .eyebrow-orange {
    color: var(--color-accent);
  }
  .eyebrow-purple {
    color: var(--color-primary);
  }
  .section-rule {
    flex: 1;
    height: 2px;
    background: #242424;
  }
  .section-rule-dark {
    background: var(--color-bg);
  }
  .section-count {
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }

  /* services grid */
  .services {
    background: var(--color-bg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-fg);
    overflow-x: clip;
  }
  .services-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(150px, 190px);
    gap: 14px;
    animation: aq-pop linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
  .service-card {
    /* padding: 22px; */
    display: flex;
    padding: 20px;
    flex-direction: column;
    justify-content: space-between;
  }
  .service-big {
    grid-column: span 2;
    grid-row: span 2;
    /* padding: 26px; */
  }
  .service-wide {
    grid-column: span 2;
    min-width: 0;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }
  .service-wide .service-title {
    min-width: 0;
  }
  .service-wide.service-long {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 6px;
  }
  .service-outline {
    border: 3px solid var(--color-fg);
  }
  .service-id {
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
  }
  .service-title {
    margin: 0;
    font-weight: 900;
    font-stretch: 118%;
    font-size: 40px;
    line-height: 0.9;
    overflow-wrap: break-word;
  }
  .service-big .service-title {
    font-size: clamp(48px, 6.6vw, 96px);
    line-height: 0.85;
  }
  .service-wide .service-title {
    font-weight: 900;
    font-stretch: 125%;
    font-size: 56px;
    line-height: 0.85;
  }
  .service-long .service-title {
    font-stretch: 100%;
    font-size: 32px;
    line-height: 1.05;
  }
  .service-card:not(.service-wide).service-long .service-title {
    font-size: 24px;
    line-height: 1.15;
  }
  .service-text {
    margin: 0;
    font:
      400 13px/1.5 "Space Mono",
      monospace;
    max-width: 340px;
  }

  /* agenda */
  .agenda {
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 60px 40px;
    border-bottom: 4px solid var(--color-bg);
    overflow-x: clip;
  }
  .agenda-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    padding: 0 8px 28px;
  }
  .agenda-title {
    margin: 0;
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(38px, 5.2vw, 76px);
    line-height: 0.85;
    letter-spacing: -0.03em;
  }
  .agenda-cta {
    font:
      700 12px/1.5 "Space Mono",
      monospace;
    letter-spacing: 0.12em;
    text-align: right;
    color: inherit;
    text-decoration: none;
  }
  .agenda-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: aq-left linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 34%;
  }
  .agenda-row {
    display: grid;
    grid-template-columns: minmax(0, 110px) minmax(0, 1fr) minmax(0, 180px) minmax(
        0,
        150px
      );
    gap: 20px;
    align-items: center;
    padding: 18px 22px;
  }
  .agenda-date {
    font:
      700 30px/1 "Archivo",
      sans-serif;
  }
  .agenda-name {
    margin: 0;
    font-weight: 900;
    font-stretch: 110%;
    font-size: clamp(20px, 2.4vw, 34px);
    line-height: 1;
  }
  .agenda-meta {
    margin: 0;
    font:
      400 12px/1.4 "Space Mono",
      monospace;
  }
  .agenda-tag {
    justify-self: end;
    padding: 9px 16px;
    border-radius: 18px;
    font:
      800 13px/1 "Archivo",
      sans-serif;
    white-space: nowrap;
  }

  /* talent */
  .talent {
    background: var(--color-fg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-bg);
    overflow-x: clip;
  }
  .talent-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    animation: aq-right linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 34%;
  }
  .talent-card {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .talent-photo {
    height: 280px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(
      45deg,
      rgba(20, 20, 20, 0.16) 0 12px,
      rgba(20, 20, 20, 0.06) 12px 24px
    );
  }
  .talent-photo figcaption {
    font:
      400 11px/1.4 "Space Mono",
      monospace;
    text-align: center;
    letter-spacing: 0.08em;
  }
  .bg-dark .talent-photo {
    background: repeating-linear-gradient(
      45deg,
      #242424 0 12px,
      #1c1c1c 12px 24px
    );
  }
  .bg-purple .talent-photo {
    background: repeating-linear-gradient(
      45deg,
      rgba(20, 20, 20, 0.22) 0 12px,
      rgba(20, 20, 20, 0.08) 12px 24px
    );
  }
  .talent-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: 0;
  }
  .talent-name {
    margin: 0;
    font-weight: 900;
    font-stretch: 110%;
    font-size: 30px;
  }
  .talent-role {
    margin: 0;
    font:
      700 11px/1 "Space Mono",
      monospace;
  }
  .bg-cream .talent-role {
    color: var(--color-bg);
  }
  .bg-dark .talent-role {
    color: var(--color-accent);
  }
  .bg-purple .talent-role {
    color: var(--color-fg);
  }

  /* crew */
  .crew {
    background: var(--color-bg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-fg);
  }
  .crew-title {
    margin: 0 0 26px 8px;
    max-width: 1080px;
    font-weight: 900;
    font-stretch: 115%;
    font-size: clamp(34px, 4.6vw, 64px);
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: var(--color-fg);
    text-wrap: balance;
  }
  .crew-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    animation: aq-pop linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
  .crew-card {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .crew-photo {
    height: 280px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.15);
  }
  .crew-photo figcaption {
    text-align: center;
    font:
      400 11px/1.4 "Space Mono",
      monospace;
  }
  .crew-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: 0;
  }
  .crew-name {
    margin: 0;
    font-weight: 900;
    font-stretch: 110%;
    font-size: 27px;
  }
  .crew-role {
    margin: 0;
    font:
      700 11px/1 "Space Mono",
      monospace;
  }
  .crew-role.role-purple {
    color: var(--color-primary);
  }
  .crew-bottom {
    margin-top: 16px;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 16px;
    align-items: stretch;
  }
  .crew-quote {
    margin: 0;
    background: var(--color-fg);
    color: var(--color-bg);
    padding: 34px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    box-shadow: 12px 12px 0 var(--color-primary);
  }
  .quote-label {
    margin: 0;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
    color: var(--color-primary);
  }
  .quote-text {
    margin: 0;
    font:
      700 32px/1.15 "Archivo",
      sans-serif;
    text-wrap: pretty;
  }
  .quote-attr {
    font:
      400 13px/1.5 "Space Mono",
      monospace;
    color: #5a5a5a;
  }
  .quote-attr cite {
    font-style: normal;
  }
  .crew-photo-large {
    min-height: 320px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(
      45deg,
      #1c1c1c 0 12px,
      #151515 12px 24px
    );
  }
  .crew-photo-large figcaption {
    text-align: center;
    color: #6b6b6b;
    font:
      400 12px/1.4 "Space Mono",
      monospace;
  }

  /* video */
  .video-section {
    background: var(--color-bg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-fg);
    overflow-x: clip;
  }
  .video-title {
    margin: 0 0 30px 8px;
    max-width: 900px;
    font-weight: 900;
    font-stretch: 115%;
    font-size: clamp(34px, 4.6vw, 64px);
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: var(--color-fg);
    text-wrap: balance;
    animation: aq-rise linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 32%;
  }
  .video-frame {
    position: relative;
    display: block;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
    background: #000;
    box-shadow: 14px 14px 0 var(--color-primary);
    animation: aq-pop linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
  .video-player {
    display: block;
    width: auto;
    height: min(80vh, 720px);
    max-width: 100%;
  }
  .video-unmute {
    position: absolute;
    right: 16px;
    bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--color-bg);
    color: var(--color-fg);
    border: 2px solid var(--color-fg);
    border-radius: 20px;
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  .video-unmute:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  /* cta */
  .cta {
    position: relative;
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 74px 40px;
    border-bottom: 4px solid var(--color-bg);
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 380px);
    gap: clamp(20px, 3vw, 50px);
    align-items: center;
  }
  .cta-blob {
    position: absolute;
    right: -60px;
    top: -60px;
    width: 320px;
    height: 320px;
    border-radius: 160px;
    background: var(--color-primary);
  }
  .cta-copy {
    position: relative;
    margin: 0;
    animation: aq-skew linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
  .cta-title {
    margin: 0 0 18px;
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(48px, 7vw, 104px);
    line-height: 0.84;
    letter-spacing: -0.035em;
  }
  .cta-text {
    margin: 0;
    max-width: 560px;
    font:
      400 14px/1.6 "Space Mono",
      monospace;
  }
  .cta-form {
    position: relative;
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 3px solid var(--color-bg);
    box-shadow: 12px 12px 0 var(--color-primary);
    animation: aq-skew linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
  .cta-form-label {
    margin: 0;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
    color: var(--color-accent);
  }
  .cta-field {
    width: 100%;
    box-sizing: border-box;
    background: #242424;
    border: none;
    padding: 14px;
    font:
      400 13px/1 "Space Mono",
      monospace;
    color: var(--color-fg);
  }
  .cta-field::placeholder {
    color: #8d8d8d;
  }
  .cta-textarea {
    font-family: "Space Mono", monospace;
    line-height: 1.5;
    resize: vertical;
  }
  .cta-submit {
    background: var(--color-primary);
    color: var(--color-fg);
    padding: 16px;
    text-align: center;
    border-radius: 26px;
    font:
      800 18px/1 "Archivo",
      sans-serif;
    border: none;
    cursor: pointer;
  }

  /* footer */
  .footer {
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 56px 40px 34px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
    gap: clamp(16px, 3vw, 36px);
    font:
      400 12px/1.9 "Space Mono",
      monospace;
  }
  .footer-brand {
    grid-column: 1;
    display: block;
    margin: 0 0 12px;
    height: 64px;
    width: auto;
  }
  .footer-tag {
    grid-column: 1;
    margin: 0;
    color: #9a9a9a;
  }
  .footer-col ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .footer-col a {
    color: inherit;
    text-decoration: none;
  }
  .footer-col a:hover {
    text-decoration: underline;
  }
  .footer-heading {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
  }
  .heading-orange {
    color: var(--color-accent);
  }
  .heading-lilac {
    color: var(--color-primary-light);
  }
  .heading-cream {
    color: var(--color-fg);
  }
  .footer-bottom {
    grid-column: 1 / -1;
    margin: 34px 0 0;
    padding-top: 16px;
    border-top: 2px solid #242424;
    display: flex;
    justify-content: space-between;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
    color: #7d7d7d;
  }

  /* tablet */
  @media (max-width: 860px) {
    .mission {
      grid-template-columns: 1fr;
    }
    .services-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .service-big {
      grid-column: span 2;
    }
    .service-wide {
      grid-column: span 2;
    }
    .agenda-row {
      grid-template-columns: minmax(0, 70px) minmax(0, 1fr);
      row-gap: 8px;
    }
    .talent-grid {
      grid-template-columns: 1fr;
    }
    .crew-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .crew-bottom {
      grid-template-columns: 1fr;
    }
    .cta {
      grid-template-columns: 1fr;
    }
    .footer {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .footer-brand,
    .footer-tag {
      grid-column: 1 / -1;
    }
  }

  /* phone */
  @media (max-width: 640px) {
    .brand {
      padding: 14px 16px;
    }

    .hero {
      min-height: 320px;
    }
    .hero-copy {
      left: 20px;
      right: 20px;
      bottom: 28px;
      gap: 2px;
    }
    .hero-line {
      font-size: clamp(34px, 13vw, 64px);
    }

    .mission,
    .services,
    .agenda,
    .talent,
    .crew,
    .cta,
    .footer {
      padding-left: 20px;
      padding-right: 20px;
    }

    .services-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
    }
    .service-big,
    .service-wide {
      grid-column: span 1;
    }
    .service-card {
      min-height: 130px;
      gap: 11px;
    }

    .agenda-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 16px 18px;
    }
    .agenda-tag {
      justify-self: auto;
    }

    .crew-grid {
      grid-template-columns: 1fr;
    }

    .footer {
      grid-template-columns: 1fr;
    }
    .footer-brand,
    .footer-tag,
    .footer-col {
      grid-column: 1;
    }
    .footer-brand {
      height: 48px;
    }
    .footer-bottom {
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
