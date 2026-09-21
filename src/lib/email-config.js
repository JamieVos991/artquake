// E-mail voor reserveringen loopt via EmailJS (https://www.emailjs.com/), een
// client-side mailservice die ook op een statische site (GitHub Pages) werkt
// — er is geen eigen server voor nodig. Er zijn twee templates: één met de
// verificatiecode (wordt gestuurd zodra iemand een tijd kiest, vóórdat de
// reservering vaststaat) en één met de uiteindelijke bevestiging (pas ná een
// juiste code).
//
// Zo activeer je 'm (kost ~10 minuten, gratis tot 200 mails/maand):
//   1. Maak een account op https://www.emailjs.com/ en koppel een e-maildienst
//      (bv. Gmail) onder "Email Services" → noteer de Service ID.
//   2. Maak onder "Email Templates" TWEE templates:
//      - een verificatiemail met minimaal {{naam}} en {{code}}
//      - een bevestigingsmail met minimaal
//        {{naam}}, {{email}}, {{studio}}, {{datum}}, {{starttijd}}, {{eindtijd}}
//      → noteer beide Template ID's.
//   3. Kopieer je Public Key onder "Account" → "General".
//   4. Vul de 4 waarden hieronder in.
//
// Zolang EMAILJS_TEMPLATE_ID_CODE leeg is, wordt er geen verificatiecode
// gestuurd en slaat het boekingsformulier die stap automatisch over (een
// reservering wordt dan meteen bevestigd, zoals voorheen) — zo blijft de site
// werken terwijl je dit nog aan het instellen bent.
export const EMAILJS_SERVICE_ID = 'service_ba3mc3e';
export const EMAILJS_TEMPLATE_ID_CODE = 'template_q9x1mif';
export const EMAILJS_TEMPLATE_ID_CONFIRM = 'template_9tzlnda';
export const EMAILJS_PUBLIC_KEY = 'Jrzv7YJlfecQ-BptO';

export const codeVerificatieActief = Boolean(
  EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID_CODE && EMAILJS_PUBLIC_KEY
);
export const bevestigingsmailActief = Boolean(
  EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID_CONFIRM && EMAILJS_PUBLIC_KEY
);
