<script>
  import { onMount, onDestroy } from "svelte";
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
  } from "firebase/firestore";
  import { onAuthStateChanged, signOut } from "firebase/auth";
  import { db, auth } from "$lib/firebase.js";

  let authGecontroleerd = $state(false);
  let ingelogdeGebruiker = $state(null);
  let uitloggen = $state(false);

  async function handleUitloggen() {
    uitloggen = true;
    await signOut(auth);
    goto(`${base}/login`);
  }

  // matcht het bestaande schema van de 'agenda'-collectie (band, place, date,
  // startTime, endTime, type, imageUrl) zodat het compatibel blijft met de
  // reeds aanwezige data uit het oude admin-systeem.
  const typeSuggesties = [
    "Open entree",
    "Optreden",
    "Expositie",
    "Workshop",
    "Besloten",
  ];
  const standaardKleur = "#f2a81c";

  let band = $state("");
  let place = $state("");
  let type = $state("");
  let kleur = $state(standaardKleur);
  let date = $state("");
  let startTime = $state("");
  let endTime = $state("");
  let beschrijving = $state("");
  let submitting = $state(false);
  let error = $state("");
  let success = $state(false);

  let agendaItems = $state([]);
  let agendaGeladen = $state(false);
  let reserveringen = $state([]);
  let reserveringenGeladen = $state(false);
  let unsubscribeAgenda;
  let unsubscribeReserveringen;

  function studioLabel(id) {
    return studios.find((s) => s.id === id)?.label ?? id ?? "–";
  }

  function formatDatum(iso) {
    if (!iso) return "–";
    const [j, m, d] = iso.split("-");
    return `${d}-${m}-${j}`;
  }

  function reserveringIsAfgelopen(r) {
    if (!r.datum || !r.eindtijd) return false;
    return new Date(`${r.datum}T${r.eindtijd}`) < new Date();
  }

  function isDezeWeek(datumStr) {
    if (!datumStr) return false;
    const datum = new Date(`${datumStr}T00:00:00`);
    const nu = new Date();
    const dag = (nu.getDay() + 6) % 7; // maandag = 0
    const maandag = new Date(nu);
    maandag.setHours(0, 0, 0, 0);
    maandag.setDate(nu.getDate() - dag);
    const zondag = new Date(maandag);
    zondag.setDate(maandag.getDate() + 6);
    zondag.setHours(23, 59, 59, 999);
    return datum >= maandag && datum <= zondag;
  }

  function isRecent(timestamp) {
    if (!timestamp?.toDate) return false;
    return Date.now() - timestamp.toDate().getTime() < 24 * 60 * 60 * 1000;
  }

  let verwijderBezig = $state(null);

  async function verwijderReservering(r) {
    const naam = r.naam || "deze reservering";
    if (
      !confirm(
        `Reservering van ${naam} (${formatDatum(r.datum)}, ${r.starttijd}–${r.eindtijd}) verwijderen?`
      )
    )
      return;
    verwijderBezig = r.id;
    try {
      await deleteDoc(doc(db, "reserveringen", r.id));
    } catch (err) {
      alert("Verwijderen mislukt. Probeer het opnieuw.");
    } finally {
      verwijderBezig = null;
    }
  }

  function startDataSubscripties() {
    unsubscribeAgenda = onSnapshot(
      collection(db, "agenda"),
      (snapshot) => {
        agendaItems = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            `${a.date ?? ""}${a.startTime ?? ""}`.localeCompare(
              `${b.date ?? ""}${b.startTime ?? ""}`
            )
          );
        agendaGeladen = true;
      },
      () => {
        agendaGeladen = true;
      }
    );

    unsubscribeReserveringen = onSnapshot(
      collection(db, "reserveringen"),
      (snapshot) => {
        reserveringen = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            `${b.datum ?? ""}${b.starttijd ?? ""}`.localeCompare(
              `${a.datum ?? ""}${a.starttijd ?? ""}`
            )
          );
        reserveringenGeladen = true;
      },
      () => {
        reserveringenGeladen = true;
      }
    );
  }

  function stopDataSubscripties() {
    unsubscribeAgenda?.();
    unsubscribeReserveringen?.();
    agendaItems = [];
    reserveringen = [];
    agendaGeladen = false;
    reserveringenGeladen = false;
  }

  let unsubscribeAuth;

  onMount(() => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      ingelogdeGebruiker = user;
      authGecontroleerd = true;
      stopDataSubscripties();
      if (user) {
        startDataSubscripties();
      } else if (!uitloggen) {
        goto(`${base}/login`);
      }
    });
  });

  onDestroy(() => {
    unsubscribeAuth?.();
    stopDataSubscripties();
  });

  async function addAgendaItem(e) {
    e.preventDefault();
    error = "";
    success = false;
    submitting = true;
    try {
      await addDoc(collection(db, "agenda"), {
        band,
        place,
        type,
        kleur,
        date,
        startTime,
        endTime,
        beschrijving,
        createdAt: serverTimestamp(),
      });
      band = "";
      place = "";
      type = "";
      kleur = standaardKleur;
      date = "";
      startTime = "";
      endTime = "";
      beschrijving = "";
      success = true;
    } catch (err) {
      error = "Opslaan mislukt. Probeer het opnieuw.";
    } finally {
      submitting = false;
    }
  }

  const studios = [
    { id: "oefen", label: "OEFENRUIMTE", bg: "orange" },
    { id: "opname", label: "OPNAMESTUDIO", bg: "dark" },
    { id: "dans", label: "DANSSTUDIO", bg: "dark" },
    { id: "atelier", label: "ATELIER", bg: "purple" },
  ];

  function vandaagAlsDatum() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function nuAlsTijd() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function studioIsNuBezet(studioId) {
    const vandaag = vandaagAlsDatum();
    const nu = nuAlsTijd();
    return reserveringen.some(
      (r) =>
        r.studio === studioId &&
        r.datum === vandaag &&
        r.starttijd <= nu &&
        r.eindtijd > nu
    );
  }

  let studiosMetStatus = $derived(
    studios.map((s) => ({ ...s, bezet: studioIsNuBezet(s.id) }))
  );

  let vrijeStudiosAantal = $derived(
    studiosMetStatus.filter((s) => !s.bezet).length
  );

  let dezeWeek = $derived(reserveringen.filter((r) => isDezeWeek(r.datum)));
  let dezeWeekGeweest = $derived(dezeWeek.filter(reserveringIsAfgelopen).length);
  let nieuw24 = $derived(
    reserveringen.filter((r) => isRecent(r.aangemaaktOp)).length
  );
  // eerst wat nog komt (vroegste bovenaan), daarna wat al geweest is
  let reserveringenOpVolgorde = $derived([
    ...reserveringen.filter((r) => !reserveringIsAfgelopen(r)).reverse(),
    ...reserveringen.filter(reserveringIsAfgelopen),
  ]);
  let komendeReserveringen = $derived(
    reserveringen.filter((r) => !reserveringIsAfgelopen(r)).length
  );
  let komendeAgenda = $derived(
    agendaItems.filter((a) => a.date && a.date >= vandaagAlsDatum()).length
  );

  function initialen(naam) {
    return (naam ?? "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }

  let stats = $derived([
    {
      label: "RESERVERINGEN DEZE WEEK",
      value: String(reserveringen.filter((r) => isDezeWeek(r.datum)).length),
    },
    {
      label: "VRIJE STUDIO'S",
      value: `${vrijeStudiosAantal} / ${studios.length}`,
    },
    {
      label: "NIEUWE AANVRAGEN (24U)",
      value: String(
        reserveringen.filter((r) => isRecent(r.aangemaaktOp)).length
      ),
    },
  ]);
</script>

<svelte:head>
  <title>Dashboard — Artquake Admin</title>
</svelte:head>

{#if !authGecontroleerd}
  <div class="auth-gate">
    <p>Bezig met controleren…</p>
  </div>
{:else if !ingelogdeGebruiker}
  <div class="auth-gate">
    <p>Je wordt doorgestuurd naar de inlogpagina…</p>
  </div>
{:else}
  <div class="db">
    <!-- zijbalk met iconen -->
    <nav class="db-zij" aria-label="Dashboard">
      <a class="db-zij-knop is-actief" href="#overzicht" aria-label="Overzicht" title="Overzicht">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
      </a>
      <a class="db-zij-knop" href="#reserveringen" aria-label="Reserveringen" title="Reserveringen">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
      </a>
      <a class="db-zij-knop" href="#agenda" aria-label="Agenda" title="Agenda">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></svg>
      </a>
      <a class="db-zij-knop" href={base || "/"} aria-label="Naar de website" title="Naar de website">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /></svg>
      </a>
      <button class="db-zij-knop db-zij-uit" type="button" onclick={handleUitloggen} aria-label="Uitloggen" title="Uitloggen">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5" /><path d="M14 8l4 4-4 4M18 12H9" /></svg>
      </button>
    </nav>

    <main class="db-paneel" id="overzicht">
      <header class="db-top">
        <p class="db-welkom">Welkom bij <strong>Artquake</strong></p>
        <div class="db-gebruiker">
          <span class="db-avatar">{initialen(ingelogdeGebruiker.email)}</span>
          <span class="db-gebruiker-tekst">
            <strong>Beheerder</strong>
            <span>{ingelogdeGebruiker.email}</span>
          </span>
        </div>
      </header>

      <div class="db-kop">
        <h1>Overzicht</h1>
        <div class="db-pillen">
          <a class="db-pil is-actief" href="#overzicht">Alles</a>
          <a class="db-pil" href="#reserveringen">Reserveringen</a>
          <a class="db-pil" href="#agenda">Agenda</a>
        </div>
      </div>

      <!-- drie gekleurde kaarten -->
      <section class="db-kaarten" aria-label="Statistieken">
        <article class="db-kaart db-kaart-oranje">
          <span class="db-label db-label-donker">Deze week</span>
          <h2>{dezeWeek.length} {dezeWeek.length === 1 ? "reservering" : "reserveringen"}</h2>
          <div class="db-voortgang">
            <p><span>Al geweest</span><span>{dezeWeekGeweest}/{dezeWeek.length}</span></p>
            <div class="db-balk"><i style:width="{dezeWeek.length ? (dezeWeekGeweest / dezeWeek.length) * 100 : 0}%"></i></div>
          </div>
          <a class="db-knop" href="#reserveringen">Bekijk</a>
        </article>

        <article class="db-kaart db-kaart-paars">
          <span class="db-label db-label-oranje">Studio's</span>
          <h2>{vrijeStudiosAantal} van {studios.length} nu vrij</h2>
          <div class="db-voortgang">
            <p><span>Bezet</span><span>{studios.length - vrijeStudiosAantal}/{studios.length}</span></p>
            <div class="db-balk"><i style:width="{((studios.length - vrijeStudiosAantal) / studios.length) * 100}%"></i></div>
          </div>
          <a class="db-knop" href="{base}/reserveren">Reserveer</a>
        </article>

        <article class="db-kaart db-kaart-licht">
          <span class="db-label db-label-paars">Laatste 24 uur</span>
          <h2>{nieuw24} {nieuw24 === 1 ? "nieuwe aanvraag" : "nieuwe aanvragen"}</h2>
          <div class="db-voortgang">
            <p><span>Nog te komen</span><span>{komendeReserveringen} totaal</span></p>
            <div class="db-balk"><i style:width="{komendeReserveringen ? Math.min(100, (nieuw24 / komendeReserveringen) * 100) : 0}%"></i></div>
          </div>
          <a class="db-knop" href="#reserveringen">Bekijk</a>
        </article>
      </section>

      <!-- lijst + donkere kaart -->
      <div class="db-rij">
        <section class="db-blok" id="reserveringen">
          <header class="db-blok-kop">
            <h2>Reserveringen</h2>
            <span class="db-blok-info">{komendeReserveringen} nog te komen</span>
          </header>
          {#if !reserveringenGeladen}
            <p class="db-leeg">Laden…</p>
          {:else if reserveringen.length === 0}
            <p class="db-leeg">Nog geen reserveringen binnengekomen.</p>
          {:else}
            <div class="db-lijst-kop" aria-hidden="true">
              <span>Wie en waar</span><span>Datum</span><span>Tijd</span><span></span>
            </div>
            <ul class="db-lijst">
              {#each reserveringenOpVolgorde as r (r.id)}
                {@const geweest = reserveringIsAfgelopen(r)}
                <li class="db-regel" class:is-geweest={geweest}>
                  <span class="db-regel-wie">
                    <span class="db-avatar db-avatar-klein">{initialen(r.naam)}</span>
                    <span>
                      <strong>{r.naam ?? "–"}</strong>
                      <span>{studioLabel(r.studio)}{geweest ? " · afgelopen" : ""}</span>
                    </span>
                  </span>
                  <span class="db-regel-datum">{formatDatum(r.datum)}</span>
                  <span class="db-regel-tijd"
                    >{r.starttijd ?? "–"}{r.eindtijd ? `–${r.eindtijd}` : ""}</span
                  >
                  <button
                    type="button"
                    class="db-verwijder"
                    disabled={verwijderBezig === r.id}
                    onclick={() => verwijderReservering(r)}
                    aria-label="Reservering van {r.naam ?? 'onbekend'} verwijderen"
                  >
                    {verwijderBezig === r.id ? "…" : "Verwijder"}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <aside class="db-donker" aria-label="Studio status">
          <p class="db-donker-intro">Hoe staan de ruimtes er nu voor?</p>
          <span class="db-label db-label-oranje">Studio status</span>
          <ul class="db-studios">
            {#each studiosMetStatus as s}
              <li>
                <span>{s.label}</span>
                <span class="db-status" class:is-bezet={s.bezet}
                  >{s.bezet ? "Bezet" : "Vrij"}</span
                >
              </li>
            {/each}
          </ul>
          <a class="db-knop db-knop-breed" href="{base}/reserveren">Nieuwe reservering</a>
        </aside>
      </div>

      <!-- agenda -->
      <div class="db-rij db-rij-agenda" id="agenda">
        <section class="db-blok">
          <header class="db-blok-kop">
            <h2>Agenda</h2>
            <span class="db-blok-info">{komendeAgenda} op komst</span>
          </header>
          {#if !agendaGeladen}
            <p class="db-leeg">Laden…</p>
          {:else if agendaItems.length === 0}
            <p class="db-leeg">Geen evenementen op komst.</p>
          {:else}
            <div class="db-lijst-kop db-lijst-kop-agenda" aria-hidden="true">
              <span>Wat en waar</span><span>Datum</span><span>Tijd</span>
            </div>
            <ul class="db-lijst">
              {#each agendaItems as a (a.id)}
                <li class="db-regel db-regel-agenda">
                  <span class="db-regel-wie">
                    {#if a.imageUrl}
                      <img class="db-avatar db-avatar-klein" src={a.imageUrl} alt="" />
                    {:else}
                      <span class="db-avatar db-avatar-klein" style:background={a.kleur || undefined}></span>
                    {/if}
                    <span>
                      <strong>{a.band ?? "–"}</strong>
                      <span>{a.place ?? "–"}{a.type ? ` · ${a.type}` : ""}</span>
                    </span>
                  </span>
                  <span class="db-regel-datum">{formatDatum(a.date)}</span>
                  <span class="db-regel-tijd"
                    >{a.startTime ?? "–"}{a.endTime ? `–${a.endTime}` : ""}</span
                  >
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <section class="db-blok db-formulier-blok">
          <header class="db-blok-kop">
            <h2>Agenda-item toevoegen</h2>
          </header>
          <form class="db-formulier" onsubmit={addAgendaItem}>
            <label class="db-veld">
              <span>Band / act *</span>
              <input type="text" placeholder="bijv. The Wombats" bind:value={band} required />
            </label>
            <label class="db-veld">
              <span>Locatie *</span>
              <input type="text" placeholder="bijv. Artquake, Heerhugowaard" bind:value={place} required />
            </label>
            <div class="db-veld-rij">
              <label class="db-veld">
                <span>Datum *</span>
                <input type="date" bind:value={date} required />
              </label>
              <label class="db-veld">
                <span>Start *</span>
                <input type="time" bind:value={startTime} required />
              </label>
              <label class="db-veld">
                <span>Eind *</span>
                <input type="time" bind:value={endTime} required />
              </label>
            </div>
            <div class="db-veld-rij db-veld-rij-type">
              <label class="db-veld">
                <span>Type *</span>
                <input type="text" list="type-suggesties" placeholder="bijv. Open entree" bind:value={type} required />
                <datalist id="type-suggesties">
                  {#each typeSuggesties as t}
                    <option value={t}></option>
                  {/each}
                </datalist>
              </label>
              <label class="db-veld db-veld-kleur">
                <span>Kleur *</span>
                <input type="color" bind:value={kleur} required />
              </label>
            </div>
            <label class="db-veld">
              <span>Beschrijving</span>
              <textarea placeholder="korte omschrijving (optioneel)" rows="3" bind:value={beschrijving}></textarea>
            </label>

            {#if error}
              <p class="db-fout">{error}</p>
            {/if}
            {#if success}
              <p class="db-gelukt">Agenda-item toegevoegd ✓</p>
            {/if}

            <button class="db-knop db-knop-breed" type="submit" disabled={submitting}>
              {submitting ? "Bezig…" : "Toevoegen"}
            </button>
          </form>
        </section>
      </div>

    </main>
  </div>
{/if}

<style>
  .auth-gate {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    color: var(--color-muted);
    font: 700 12px/1.5 var(--font-mono);
    letter-spacing: 0.1em;
  }

  .db {
    --db-rand: rgba(11, 11, 11, 0.85);
    --db-zacht: rgba(11, 11, 11, 0.6);
    --db-paars-licht: #dcc4fb;
    --db-oranje-licht: #f8d37f;
    display: flex;
    gap: 14px;
    min-height: 100vh;
    padding: 14px;
    background: #1c1c1c;
    font-family: var(--font-display);
    color: var(--color-bg);
  }

  /* zijbalk */
  .db-zij {
    position: sticky;
    top: 14px;
    align-self: flex-start;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 18px 6px;
  }
  .db-zij-knop {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--color-fg);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .db-zij-knop svg {
    width: 21px;
    height: 21px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .db-zij-knop:hover {
    background: rgba(244, 241, 234, 0.12);
  }
  .db-zij-knop.is-actief {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .db-zij-uit {
    margin-top: 28px;
  }

  /* paneel */
  .db-paneel {
    flex: 1;
    min-width: 0;
    padding: clamp(18px, 2.400vw, 30px);
    background: var(--color-fg);
    border-radius: 24px;
    scroll-margin-top: 14px;
  }
  .db-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 26px;
    /* ruimte voor de menuknop rechtsboven */
    padding-right: 64px;
    min-height: 44px;
  }
  .db-welkom {
    margin: 0;
    font-size: 14px;
    color: var(--db-zacht);
  }
  .db-welkom strong {
    color: var(--color-primary);
    font-weight: 800;
    font-size: 17px;
  }
  .db-gebruiker {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .db-gebruiker-tekst {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 12px;
    line-height: 1.25;
    color: var(--db-zacht);
  }
  .db-gebruiker-tekst strong {
    color: var(--color-bg);
    font-size: 13px;
  }
  .db-gebruiker-tekst span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .db-avatar {
    flex: none;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1.500px solid var(--db-rand);
    border-radius: 50%;
    background: var(--db-oranje-licht);
    color: var(--color-bg);
    font-weight: 800;
    font-size: 13px;
    object-fit: cover;
  }
  .db-avatar-klein {
    width: 34px;
    height: 34px;
    font-size: 12px;
    background: var(--db-paars-licht);
  }

  .db-kop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }
  .db-kop h1 {
    margin: 0;
    font-weight: 700;
    font-size: clamp(24px, 2.600vw, 32px);
    letter-spacing: -0.010em;
  }
  .db-pillen {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .db-pil {
    padding: 8px 14px;
    border: 1.500px solid var(--db-rand);
    border-radius: 10px;
    color: var(--color-bg);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .db-pil:hover,
  .db-pil.is-actief {
    background: var(--color-bg);
    color: var(--color-fg);
  }

  /* gekleurde kaarten */
  .db-kaarten {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }
  .db-kaart {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 18px;
    border: 1.500px solid var(--db-rand);
    border-radius: 18px;
  }
  .db-kaart-oranje {
    background: var(--db-oranje-licht);
  }
  .db-kaart-paars {
    background: var(--db-paars-licht);
  }
  .db-kaart-licht {
    background: #fbf9f4;
  }
  .db-kaart h2 {
    margin: 0;
    font-weight: 700;
    font-size: clamp(18px, 1.700vw, 22px);
    line-height: 1.2;
  }
  .db-label {
    padding: 6px 10px;
    border: 1.500px solid var(--db-rand);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }
  .db-label-donker {
    background: var(--color-bg);
    color: var(--color-fg);
  }
  .db-label-oranje {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .db-label-paars {
    background: var(--db-paars-licht);
  }
  .db-voortgang {
    align-self: stretch;
  }
  .db-voortgang p {
    display: flex;
    justify-content: space-between;
    margin: 0 0 6px;
    font-size: 12px;
    color: var(--db-zacht);
  }
  .db-balk {
    height: 6px;
    border-radius: 999px;
    background: rgba(11, 11, 11, 0.14);
    overflow: hidden;
  }
  .db-balk i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--color-bg);
    transition: width 0.4s ease;
  }
  .db-knop {
    align-self: flex-end;
    padding: 10px 18px;
    border: 1.500px solid var(--db-rand);
    border-radius: 10px;
    background: var(--color-primary);
    color: var(--color-fg);
    font: 600 13px/1 var(--font-display);
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
  }
  .db-knop:hover:not(:disabled) {
    background: var(--color-primary-dark);
  }
  .db-knop:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .db-knop-breed {
    align-self: stretch;
    padding: 14px 18px;
    text-align: center;
    font-size: 14px;
  }

  /* blokken */
  .db-rij {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 14px;
    margin-bottom: 14px;
    scroll-margin-top: 14px;
  }
  .db-rij-agenda {
    grid-template-columns: minmax(0, 1.200fr) minmax(0, 1fr);
  }
  .db-blok {
    min-width: 0;
    padding: 20px 22px;
    border: 1.500px solid var(--db-rand);
    border-radius: 18px;
    background: #fbf9f4;
    scroll-margin-top: 14px;
  }
  .db-blok-kop {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .db-blok-kop h2 {
    margin: 0;
    font-weight: 700;
    font-size: 19px;
  }
  .db-blok-info {
    font-size: 13px;
    color: var(--color-primary);
    font-weight: 600;
    text-decoration: none;
  }
  .db-leeg {
    margin: 0;
    padding: 18px 0;
    font-size: 14px;
    color: var(--db-zacht);
  }

  .db-lijst-kop,
  .db-regel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 96px 110px 84px;
    align-items: center;
    gap: 12px;
  }
  .db-lijst-kop-agenda,
  .db-regel-agenda {
    grid-template-columns: minmax(0, 1fr) 96px 110px;
  }
  .db-lijst-kop {
    padding-bottom: 8px;
    font-size: 12px;
    color: var(--db-zacht);
  }
  .db-lijst {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 420px;
    overflow-y: auto;
  }
  .db-regel {
    padding: 12px 0;
    border-top: 1px solid rgba(11, 11, 11, 0.14);
    font-size: 14px;
  }
  .db-regel.is-geweest {
    opacity: 0.5;
  }
  .db-regel-wie {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .db-regel-wie > span:last-child {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 12px;
    color: var(--db-zacht);
  }
  .db-regel-wie strong {
    color: var(--color-bg);
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .db-regel-tijd {
    font-weight: 600;
  }
  .db-verwijder {
    justify-self: end;
    padding: 6px 10px;
    border: 1.500px solid var(--db-rand);
    border-radius: 8px;
    background: transparent;
    color: var(--color-bg);
    font: 500 12px/1 var(--font-display);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .db-verwijder:hover:not(:disabled) {
    background: #c0392b;
    border-color: #c0392b;
    color: #fff;
  }

  /* donkere kaart */
  .db-donker {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 22px;
    border-radius: 18px;
    background: #262626;
    color: var(--color-fg);
  }
  .db-donker-intro {
    margin: 0;
    font-size: 13px;
    opacity: 0.8;
  }
  .db-studios {
    align-self: stretch;
    list-style: none;
    margin: 0 0 auto;
    padding: 0;
  }
  .db-studios li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 11px 0;
    border-bottom: 1px solid rgba(244, 241, 234, 0.14);
    font-size: 14px;
    font-weight: 600;
  }
  .db-status {
    padding: 5px 10px;
    border-radius: 999px;
    background: #2f7d4f;
    font-size: 12px;
  }
  .db-status.is-bezet {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .db-donker .db-knop {
    border-color: transparent;
  }

  /* formulier */
  .db-formulier {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .db-veld {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
    font-size: 12px;
    color: var(--db-zacht);
  }
  .db-veld input,
  .db-veld textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1.500px solid var(--db-rand);
    border-radius: 10px;
    background: #fff;
    color: var(--color-bg);
    font: 500 14px/1.3 var(--font-display);
  }
  .db-veld input:focus,
  .db-veld textarea:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }
  .db-veld textarea {
    resize: vertical;
  }
  .db-veld-rij {
    display: grid;
    grid-template-columns: 1.300fr 1fr 1fr;
    gap: 10px;
  }
  .db-veld-rij-type {
    grid-template-columns: 1fr 72px;
  }
  .db-veld-kleur input {
    height: 42px;
    padding: 4px;
  }
  .db-fout,
  .db-gelukt {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }
  .db-fout {
    color: #c0392b;
  }
  .db-gelukt {
    color: #2f7d4f;
  }

  @media (max-width: 1000px) {
    .db-kaarten,
    .db-rij,
    .db-rij-agenda {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .db {
      flex-direction: column;
      gap: 10px;
      padding: 10px;
    }
    .db-zij {
      position: static;
      flex-direction: row;
      align-self: stretch;
      justify-content: space-between;
      padding: 4px 62px 4px 4px;
    }
    .db-zij-uit {
      margin-top: 0;
    }
    .db-paneel {
      border-radius: 18px;
    }
    .db-gebruiker-tekst {
      display: none;
    }
    .db-lijst-kop {
      display: none;
    }
    .db-regel,
    .db-regel-agenda {
      grid-template-columns: minmax(0, 1fr) auto;
      row-gap: 6px;
    }
    .db-regel-wie {
      grid-column: 1 / -1;
    }
    .db-regel-datum {
      color: var(--db-zacht);
    }
    .db-verwijder {
      grid-column: 1 / -1;
      justify-self: start;
    }
    .db-veld-rij {
      grid-template-columns: 1fr 1fr;
    }
    .db-veld-rij > :first-child {
      grid-column: 1 / -1;
    }
    .db-veld-rij-type > :first-child {
      grid-column: auto;
    }
    .db-veld-rij-type {
      grid-template-columns: 1fr 72px;
    }
  }
</style>
