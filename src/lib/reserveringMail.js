import emailjs from "@emailjs/browser";
import {
	EMAILJS_SERVICE_ID,
	EMAILJS_TEMPLATE_ID_CONFIRM,
	EMAILJS_TEMPLATE_ID_GEWIJZIGD,
	EMAILJS_TEMPLATE_ID_VERWIJDERD,
	EMAILJS_PUBLIC_KEY,
	bevestigingsmailActief,
} from "$lib/email-config.js";

export const studioNamen = {
	oefen: "Oefenruimte",
	opname: "Opnamestudio",
	dans: "Dansstudio",
	atelier: "Atelier",
};

// Soorten mail: "bevestigd", "gewijzigd" en "verwijderd". Op het gratis
// plan van EmailJS (twee templates, de andere is de verificatiecode) gaan
// ze allemaal via het bevestigingstemplate; kop en tekst gaan dan als
// variabelen mee: {{onderwerp}}, {{label}}, {{titel}}, {{intro}}.
// Zie de map email-templates.
const teksten = {
	bevestigd: {
		onderwerp: "Reservering bevestigd",
		label: "GELUKT ✓",
		titel: "Reservering bevestigd.",
		intro: "je reservering staat vast:",
	},
	gewijzigd: {
		onderwerp: "Je reservering is gewijzigd",
		label: "GEWIJZIGD",
		titel: "Je reservering is gewijzigd.",
		intro: "we hebben je reservering aangepast. Dit zijn de nieuwe gegevens:",
	},
	verwijderd: {
		onderwerp: "Je reservering is verwijderd",
		label: "VERWIJDERD",
		titel: "Je reservering is verwijderd.",
		intro: "deze reservering gaat helaas niet door:",
	},
};

// Een eigen template per soort als dat is ingesteld in email-config.js,
// anders het gedeelde bevestigingstemplate (met de teksten hierboven).
const templatePerSoort = {
	bevestigd: EMAILJS_TEMPLATE_ID_CONFIRM,
	gewijzigd: EMAILJS_TEMPLATE_ID_GEWIJZIGD || EMAILJS_TEMPLATE_ID_CONFIRM,
	verwijderd: EMAILJS_TEMPLATE_ID_VERWIJDERD || EMAILJS_TEMPLATE_ID_CONFIRM,
};

// Stuurt de mail en geeft terug of dat gelukt is (true/false). Gooit nooit,
// zodat een mislukte mail de reservering zelf niet in de weg zit.
export async function stuurReserveringMail(reservering, soort = "bevestigd") {
	if (!bevestigingsmailActief || !reservering.email) return false;
	try {
		await emailjs.send(
			EMAILJS_SERVICE_ID,
			templatePerSoort[soort],
			{
				...teksten[soort],
				naam: reservering.naam,
				email: reservering.email,
				studio: studioNamen[reservering.studio] ?? reservering.studio,
				datum: new Date(`${reservering.datum}T00:00`).toLocaleDateString("nl-NL", {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric",
				}),
				starttijd: reservering.starttijd,
				eindtijd: reservering.eindtijd,
			},
			{ publicKey: EMAILJS_PUBLIC_KEY }
		);
		return true;
	} catch {
		return false;
	}
}
