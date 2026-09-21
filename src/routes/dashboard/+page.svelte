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
  let uitgelichteArtiesten = $state([]);
  let reserveringen = $state([]);
  let reserveringenGeladen = $state(false);
  let unsubscribeAgenda;
  let unsubscribeArtiesten;
  let unsubscribeReserveringen;

  function kiesWillekeurig(lijst, aantal) {
    const shuffled = [...lijst].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, aantal);
  }

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

    unsubscribeArtiesten = onSnapshot(
      collection(db, "artiesten"),
      (snapshot) => {
        const alleArtiesten = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => a.naam);
        uitgelichteArtiesten = kiesWillekeurig(alleArtiesten, 3);
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
    unsubscribeArtiesten?.();
    unsubscribeReserveringen?.();
    agendaItems = [];
    uitgelichteArtiesten = [];
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
  <div class="dash">
    <header class="topbar">
      <div class="brand">
        <span class="brand-name">ARTQUAKE</span>
        <span class="admin-badge">ADMIN</span>
      </div>
      <nav class="topnav" aria-label="Beheer">
        <span class="nav-link is-active">DASHBOARD</span>
        <span class="nav-link">RESERVERINGEN</span>
        <span class="nav-link">STUDIO'S</span>
      </nav>
      <button class="logout" type="button" onclick={handleUitloggen}
        >UITLOGGEN →</button
      >
    </header>

    <main class="content">
      <p class="eyebrow">OVERZICHT</p>
      <h1 class="headline">WELKOM<br /><em>TERUG.</em></h1>

      <section class="stats" aria-label="Statistieken">
        {#each stats as s}
          <div class="stat-card">
            <p class="stat-value">{s.value}</p>
            <p class="stat-label">{s.label}</p>
          </div>
        {/each}
      </section>

      <section class="block">
        <h2 class="block-title">AGENDA-ITEM TOEVOEGEN</h2>
        <form class="agenda-form" onsubmit={addAgendaItem}>
          <div class="form-row">
            <label class="fld">
              <span>BAND / ACT <b>*</b></span>
              <input
                class="finp"
                type="text"
                placeholder="bijv. The Wombats"
                bind:value={band}
                required
              />
            </label>
            <label class="fld">
              <span>LOCATIE <b>*</b></span>
              <input
                class="finp"
                type="text"
                placeholder="bijv. Artquake, Heerhugowaard"
                bind:value={place}
                required
              />
            </label>
          </div>
          <div class="form-row">
            <label class="fld fld-narrow">
              <span>DATUM <b>*</b></span>
              <input class="finp" type="date" bind:value={date} required />
            </label>
            <label class="fld fld-narrow">
              <span>STARTTIJD <b>*</b></span>
              <input class="finp" type="time" bind:value={startTime} required />
            </label>
            <label class="fld fld-narrow">
              <span>EINDTIJD <b>*</b></span>
              <input class="finp" type="time" bind:value={endTime} required />
            </label>
          </div>
          <div class="form-row">
            <label class="fld">
              <span>TYPE <b>*</b></span>
              <input
                class="finp"
                type="text"
                list="type-suggesties"
                placeholder="bijv. Open entree"
                bind:value={type}
                required
              />
              <datalist id="type-suggesties">
                {#each typeSuggesties as t}
                  <option value={t}></option>
                {/each}
              </datalist>
            </label>
            <label class="fld fld-color">
              <span>KLEUR <b>*</b></span>
              <input
                class="finp finp-color"
                type="color"
                bind:value={kleur}
                required
              />
            </label>
          </div>
          <label class="fld">
            <span>BESCHRIJVING</span>
            <textarea
              class="finp farea"
              placeholder="korte omschrijving (optioneel)"
              rows="3"
              bind:value={beschrijving}
            ></textarea>
          </label>

          {#if error}
            <p class="field-error">{error}</p>
          {/if}
          {#if success}
            <p class="field-success">Agenda-item toegevoegd ✓</p>
          {/if}

          <button class="submit-btn" type="submit" disabled={submitting}>
            {submitting ? "BEZIG…" : "AGENDA-ITEM TOEVOEGEN"}
          </button>
        </form>

        {#if agendaGeladen && agendaItems.length === 0}
          <p class="empty-state">Geen evenementen op komst.</p>
        {:else if agendaItems.length}
          <div class="table-wrap agenda-list">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th>BAND / ACT</th>
                  <th>LOCATIE</th>
                  <th>DATUM</th>
                  <th>TIJD</th>
                  <th>TYPE</th>
                </tr>
              </thead>
              <tbody>
                {#each agendaItems as a (a.id)}
                  <tr>
                    <td class="thumb-cell">
                      {#if a.imageUrl}
                        <img class="thumb" src={a.imageUrl} alt="" />
                      {/if}
                    </td>
                    <td>{a.band ?? "–"}</td>
                    <td>{a.place ?? "–"}</td>
                    <td>{a.date ?? "–"}</td>
                    <td
                      >{a.startTime ?? "–"}{a.endTime
                        ? `–${a.endTime}`
                        : ""}</td
                    >
                    <td>
                      <span class="cat">
                        {#if a.kleur}<span
                            class="cat-dot"
                            style="background:{a.kleur}"
                          ></span>{/if}
                        {a.type ?? "–"}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </section>

      <section class="block">
        <h2 class="block-title">STUDIO STATUS</h2>
        <ul class="studios">
          {#each studiosMetStatus as s}
            <li class="studio bg-{s.bg}">
              <span class="studio-status"> {s.bezet ? "BEZET" : "VRIJ"}</span>
              <h3 class="studio-name">{s.label}</h3>
            </li>
          {/each}
        </ul>
      </section>

      <section class="block">
        <h2 class="block-title">ARTIESTEN</h2>
        <ul class="artiesten-preview">
          {#each uitgelichteArtiesten as a, i (a.id)}
            {@const bg = ["dark", "purple", "orange"][i % 3]}
            <li class="art-card bg-{bg}">
              <figure class="art-photo">
                {#if a.imageUrl}
                  <img class="art-img" src={a.imageUrl} alt="" loading="lazy" />
                {:else}
                  <span class="art-placeholder">[ ARTIESTFOTO ]</span>
                {/if}
                {#if a.type}
                  <span class="art-badge">{a.type}</span>
                {/if}
              </figure>
              <h3 class="art-name">{a.naam}</h3>
              {#if a.beschrijving}
                <p class="art-desc">{a.beschrijving}</p>
              {/if}
            </li>
          {/each}
        </ul>
        <a class="artiesten-more" href="{base}/artiesten">ALLE ARTIESTEN →</a>
      </section>

      <section class="block">
        <h2 class="block-title">RECENTE RESERVERINGEN</h2>
        {#if reserveringenGeladen && reserveringen.length === 0}
          <p class="empty-state">Nog geen reserveringen binnengekomen.</p>
        {:else if reserveringen.length}
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>NAAM</th>
                  <th>STUDIO</th>
                  <th>DATUM</th>
                  <th>TIJD</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {#each reserveringen as r (r.id)}
                  <tr>
                    <td>{r.naam ?? "–"}</td>
                    <td>{studioLabel(r.studio)}</td>
                    <td>{formatDatum(r.datum)}</td>
                    <td
                      >{r.starttijd ?? "–"}{r.eindtijd
                        ? `–${r.eindtijd}`
                        : ""}</td
                    >
                    <td>
                      {#if reserveringIsAfgelopen(r)}
                        <span class="badge badge-past">AFGELOPEN</span>
                      {:else}
                        <span class="badge badge-ok">AANKOMEND</span>
                      {/if}
                    </td>
                    <td class="actions-cell">
                      <button
                        type="button"
                        class="row-delete"
                        disabled={verwijderBezig === r.id}
                        onclick={() => verwijderReservering(r)}
                      >
                        {verwijderBezig === r.id ? "…" : "VERWIJDEREN"}
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </section>
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
  .dash {
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-fg);
  }

  /* topbar */
  .topbar {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 20px 40px;
    border-bottom: 2px solid var(--color-border);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-name {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 16px;
    letter-spacing: 1px;
  }
  .admin-badge {
    background: var(--color-accent);
    color: var(--color-bg);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 1.5px;
    padding: 4px 10px;
    border-radius: 4px;
  }
  .topnav {
    display: flex;
    gap: 24px;
    flex: 1;
  }
  .nav-link {
    font: 700 11px/1 var(--font-mono);
    letter-spacing: 0.12em;
    color: var(--color-muted);
  }
  .nav-link.is-active {
    color: var(--color-fg);
    border-bottom: 2px solid var(--color-accent);
    padding-bottom: 4px;
  }
  .logout {
    background: none;
    border: none;
    padding: 0;
    font: 700 11px/1 var(--font-mono);
    letter-spacing: 0.1em;
    color: var(--color-muted);
    text-decoration: none;
    cursor: pointer;
  }
  .logout:hover {
    color: var(--color-fg);
  }

  /* content */
  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 56px 40px 100px;
  }
  .eyebrow {
    margin: 0 0 16px;
    font: 700 10px/1 var(--font-mono);
    letter-spacing: 0.2em;
    color: var(--color-accent);
  }
  .headline {
    margin: 0 0 48px;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(44px, 6vw, 80px);
    line-height: 0.9;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }
  .headline em {
    color: var(--color-accent);
    font-style: normal;
  }

  /* stats */
  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 56px;
  }
  .stat-card {
    background: #141414;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    padding: 24px;
  }
  .stat-value {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(32px, 4vw, 44px);
    line-height: 1;
  }
  .stat-label {
    margin: 0;
    font: 700 10px/1.5 var(--font-mono);
    letter-spacing: 0.12em;
    color: var(--color-muted);
  }

  /* blocks */
  .block {
    margin-bottom: 56px;
  }
  .block-title {
    margin: 0 0 20px;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 20px;
    letter-spacing: 0.02em;
  }

  /* agenda form */
  .agenda-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-width: 760px;
    margin-bottom: 24px;
  }
  .form-row {
    display: flex;
    gap: 16px;
  }
  .fld {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font: 700 11px/1 var(--font-display);
    letter-spacing: 0.08em;
  }
  .fld-narrow {
    flex: 0 0 auto;
    min-width: 150px;
  }
  .fld b {
    color: var(--color-accent);
    font-weight: 700;
  }
  .finp {
    background: #1a1a1a;
    border: 1.5px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-fg);
    font: 400 14px/1 var(--font-display);
    padding: 13px 14px;
    outline: none;
    transition: border-color 0.12s;
    width: 100%;
    box-sizing: border-box;
  }
  .finp::placeholder {
    color: #4a4a4a;
  }
  .finp:focus {
    border-color: var(--color-primary);
  }
  .farea {
    font-family: var(--font-mono);
    line-height: 1.5;
    resize: vertical;
  }
  .field-error,
  .field-success {
    margin: 0;
    font: 700 12px/1.5 var(--font-mono);
  }
  .field-error {
    color: var(--color-accent);
  }
  .field-success {
    color: var(--color-primary-light);
  }
  .submit-btn {
    align-self: flex-start;
    background: var(--color-primary);
    color: var(--color-fg);
    border: none;
    border-radius: 4px;
    font: 800 14px/1 var(--font-display);
    letter-spacing: 0.06em;
    padding: 14px 26px;
    cursor: pointer;
    text-transform: uppercase;
    transition: background 0.15s;
  }
  .submit-btn:hover:not(:disabled) {
    background: var(--color-primary-dark);
  }
  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .agenda-list {
    max-width: 760px;
  }
  .fld-color {
    flex: 0 0 auto;
    min-width: 90px;
  }
  .finp-color {
    padding: 4px;
    height: 44px;
    cursor: pointer;
  }
  .thumb-cell {
    width: 44px;
  }
  .thumb {
    width: 36px;
    height: 36px;
    object-fit: cover;
    border-radius: 4px;
    display: block;
  }
  .empty-state {
    max-width: 760px;
    margin: 0;
    padding: 24px;
    border: 1.5px dashed var(--color-border);
    border-radius: 8px;
    font: 400 13px/1.5 var(--font-mono);
    color: var(--color-muted);
    text-align: center;
  }
  .cat {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font: 700 10px/1 var(--font-mono);
    letter-spacing: 0.1em;
  }
  .cat-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* studios */
  .studios {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 3px;
    background: #111;
  }
  .studio {
    padding: 22px 20px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
  }
  .bg-orange {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .bg-dark {
    background: #181818;
    color: var(--color-fg);
  }
  .bg-purple {
    background: var(--color-primary);
    color: var(--color-fg);
  }
  .studio-status {
    font: 700 9px/1 var(--font-mono);
    letter-spacing: 0.18em;
    opacity: 0.7;
  }
  .studio-name {
    margin: 0;
    font: 900 18px/1.1 var(--font-display);
    letter-spacing: -0.01em;
    text-transform: uppercase;
  }

  /* artiesten */
  .artiesten-preview {
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .art-card {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .art-photo {
    position: relative;
    height: 200px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.18);
    overflow: hidden;
  }
  .art-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .art-placeholder {
    font: 400 10px/1.4 var(--font-mono);
    letter-spacing: 0.08em;
    opacity: 0.6;
  }
  .art-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 5px 10px;
    background: var(--color-bg);
    color: var(--color-fg);
    font: 700 9px/1 var(--font-mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-radius: 4px;
  }
  .art-name {
    margin: 0;
    font: 900 18px/1.1 var(--font-display);
    letter-spacing: -0.01em;
    text-transform: uppercase;
  }
  .art-desc {
    margin: 0;
    font: 400 12px/1.4 var(--font-mono);
    opacity: 0.85;
  }
  .artiesten-more {
    font: 700 11px/1 var(--font-mono);
    letter-spacing: 0.1em;
    color: var(--color-muted);
    text-decoration: none;
  }
  .artiesten-more:hover {
    color: var(--color-fg);
  }

  /* table */
  .table-wrap {
    overflow-x: auto;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
    font: 400 13px/1.4 var(--font-mono);
    min-width: 560px;
  }
  .table th {
    text-align: left;
    padding: 14px 18px;
    font: 700 10px/1 var(--font-mono);
    letter-spacing: 0.12em;
    color: var(--color-muted);
    border-bottom: 1.5px solid var(--color-border);
  }
  .table td {
    padding: 16px 18px;
    border-bottom: 1px solid var(--color-border);
  }
  .table tr:last-child td {
    border-bottom: none;
  }
  .badge {
    display: inline-block;
    font: 700 10px/1 var(--font-mono);
    letter-spacing: 0.1em;
    padding: 5px 10px;
    border-radius: 20px;
  }
  .badge-new {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .badge-ok {
    background: var(--color-primary);
    color: var(--color-fg);
  }
  .badge-past {
    background: var(--color-border);
    color: var(--color-muted);
  }
  .actions-cell {
    text-align: right;
  }
  .row-delete {
    background: none;
    border: 1.5px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-muted);
    font: 700 10px/1 var(--font-mono);
    letter-spacing: 0.08em;
    padding: 8px 12px;
    cursor: pointer;
    transition:
      border-color 0.12s,
      color 0.12s;
  }
  .row-delete:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  .row-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* responsive */
  @media (max-width: 860px) {
    .topbar {
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px 24px;
    }
    .topnav {
      order: 3;
      width: 100%;
    }
    .content {
      padding: 40px 24px 80px;
    }
    .stats {
      grid-template-columns: 1fr 1fr;
    }
    .studios {
      grid-template-columns: 1fr 1fr;
    }
    .artiesten-preview {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 480px) {
    .stats {
      grid-template-columns: 1fr;
    }
    .studios {
      grid-template-columns: 1fr;
    }
    .artiesten-preview {
      grid-template-columns: 1fr;
    }
    .form-row {
      flex-direction: column;
    }
    .fld-narrow {
      min-width: 0;
    }
  }
</style>
