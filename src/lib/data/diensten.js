export const diensten = [
	{
		slug: "talent-night",
		id: "01",
		title: "TALENT\nNIGHT",
		heading: "Talent Night",
		// bestandsnaam (zonder .mp4) in src/lib/assets/videos
		video: "talent-night-aftermovie",
		videoLabel: "AFTERMOVIE",
		videoNaast: true,
		// de eerste seconden zijn zwart: de video begint hier (in seconden)
		videoStart: 4,
		// verhouding = breedte / hoogte van de uitsnede in de galerij
		galerij: [
			{ foto: "001-podiumbeeld", titel: "Podiumbeeld", verhouding: "4 / 3" },
			{ foto: "002-gitariste-lieke", titel: "Gitariste Lieke", verhouding: "3 / 4" },
			{ foto: "007-publiek", titel: "Publiek", verhouding: "4 / 5" },
			{ foto: "009-singer-songwriter", titel: "Singer/Songwriter Emily", verhouding: "4 / 5" },
			{ foto: "006-band-unbound", titel: "Band Unbound", verhouding: "4 / 3" },
			{ foto: "003-theater", titel: "Muziektheater Woordenschatjes", verhouding: "3 / 4" },
			{ foto: "005-sfeer", titel: "Sfeer", verhouding: "1 / 1" },
			{ foto: "008-dans", titel: "Dans", verhouding: "4 / 5" },
			{ foto: "004-de-kevers", titel: "De Kevers", verhouding: "9 / 10" },
		],
		bg: "purple",
		big: true,
		intro: "Het podium voor opkomend talent",
		// metaBeschrijving: de tekst die Google onder de link laat zien
		metaBeschrijving:
			"Talent Night: 5 keer per jaar in poppodium B3 in Sint Pancras. Jonge artiesten op één podium voor publiek, vrienden en scouts. Dé uitgaansavond voor jongeren.",
		// een lege regel (\n\n) begint een nieuwe alinea
		text: "5 Keer per jaar Talent Night in poppodium B3 in Sint Pancras. Op zo'n avond staan meerdere artiesten kort achter elkaar op hetzelfde podium, voor een zaal vol publiek, vrienden, familie en scouts. Het is dé plek om ervaring op te doen, uitgedaagd en gezien te worden!\n\nTegelijkertijd is Talent Night dé uitgaansavond voor en door jongeren uit Dijk & Waard en omgeving. Voor liefhebbers van live-muziek, dansen en feesten!",
	},
	{
		slug: "exposities",
		id: "02",
		title: "EXPO\nSITIES",
		heading: "Exposities",
		video: "video-exposities",
		// videoNaast: de video staat kleiner, rechts naast de tekst
		videoNaast: true,
		// foto's in src/lib/assets/pictures/exposities
		galerij: [
			{ foto: "006-publiek-bij-de-opening", titel: "Publiek bij de opening", verhouding: "5 / 4" },
			{ foto: "008-de-exposerende-makers", titel: "De exposerende makers", verhouding: "5 / 4" },
			{ foto: "003-bezoekers-bij-schilderijen", titel: "Bezoekers bij de schilderijen", verhouding: "5 / 4" },
			{ foto: "005-opening", titel: "Opening", verhouding: "5 / 4" },
			{ foto: "002-kunstmarkt", titel: "Kunstmarkt", verhouding: "1 / 1" },
			{ foto: "001-uitleg-bij-eigen-werk", titel: "Uitleg bij eigen werk", verhouding: "4 / 5" },
			{ foto: "004-kunstenares-bij-haar-werk", titel: "Kunstenares bij haar werk", verhouding: "1 / 1" },
			{ foto: "007-live-muziek-tussen-het-werk", titel: "Live muziek tussen het werk", verhouding: "1 / 1" },
			{ foto: "009-de-expositiegang", titel: "De expositiegang", verhouding: "4 / 5" },
			{ foto: "010-expositie-op-straat", titel: "Expositie op straat", verhouding: "1 / 1" },
		],
		bg: "cream",
		intro: "Beeldend werk in de hoofdrol",
		metaBeschrijving:
			"Exposities van Artquake: jonge makers laten hun schilderijen, fotografie, keramiek en meer zien aan publiek. Wij regelen de locatie, opbouw en promotie.",
		text: "Artquake Beeldend draait om kunst maken, samen ons werk laten zien op markten of exposities, en leren praten over je werk in een fijne omgeving.\n\nHet is een plek waar je jouw talent voor schilderen, fotografie, tekenen, textiel, keramiek en schrijven kunt ontdekken, samen met andere jonge kunstliefhebbers.\n\nVan schilderijen tot fotografie en installaties: op onze exposities laat je je werk zien aan een publiek dat er speciaal voor komt. Wij regelen de locatie, de opbouw en de promotie, zodat jij je kunt richten op je werk.",
	},
	{
		slug: "jam-sessies",
		id: "03",
		title: "JAM\nSESSIES",
		heading: "Jamsessies",
		video: "jamsessies",
		videoNaast: true,
		// foto's in src/lib/assets/pictures/jam-sessies
		galerij: [
			{ foto: "003-samen-op-het-podium", titel: "Samen op het podium", verhouding: "5 / 4" },
			{ foto: "004-gitaar-en-drums", titel: "Gitaar en drums", verhouding: "5 / 4" },
			{ foto: "005-keys-en-zang", titel: "Keys en zang", verhouding: "5 / 4" },
			{ foto: "006-zang-en-saxofoon", titel: "Zang en saxofoon", verhouding: "5 / 4" },
			{ foto: "002-gitarist", titel: "Gitarist", verhouding: "1 / 1" },
			{ foto: "001-zang-en-gitaar", titel: "Zang en gitaar", verhouding: "4 / 5" },
			{ foto: "008-zang-en-keys", titel: "Zang en keys", verhouding: "1 / 1" },
			{ foto: "009-elektrische-gitaar", titel: "Elektrische gitaar", verhouding: "1 / 1" },
			{ foto: "007-akoestische-gitaar", titel: "Akoestische gitaar", verhouding: "4 / 5" },
			{ foto: "010-zangeres", titel: "Zangeres", verhouding: "1 / 1" },
		],
		bg: "cream",
		outline: true,
		intro: "Samen muziek maken, zonder script",
		metaBeschrijving:
			"Jamsessies bij Artquake in Heerhugowaard: geen setlist, geen druk. Muzikanten van elk niveau spelen samen, experimenteren en ontmoeten elkaar.",
		text: "Geen setlist, geen druk. Gewoon instappen en meespelen. Op onze jamsessies komen muzikanten van verschillende niveaus en genres samen om te experimenteren en elkaar te ontmoeten.\n\nOf je nu voor het eerst met anderen speelt of al jaren op het podium staat: iedereen is welkom. Neem je instrument mee, of kom luisteren en ontdek met wie het klikt.\n\nUit een jam kan zomaar iets nieuws ontstaan: een band, een samenwerking of gewoon een goede avond.",
	},
	{
		slug: "foto-shoots",
		id: "04",
		title: "FOTO\nSHOOTS",
		heading: "Fotoshoots",
		video: "fotoshoot",
		videoNaast: true,
		bg: "purple",
		wide: true,
		intro: "Beeld waarmee je jezelf laat zien",
		metaBeschrijving:
			"Fotoshoots in de eigen fotostudio van Artquake: samen met een fotograaf maak je beeld voor je social media, profiel of affiche, dat je direct kunt gebruiken.",
		text: "Goede foto's zijn onmisbaar voor een artiest: voor social media, je profiel of een affiche. Tijdens onze fotoshoots werk je samen met een fotograaf aan beeld dat past bij wie je bent en waar je naartoe wilt.\n\nIn het Artquake pand hebben we een eigen fotostudio. Samen bedenk je de stijl, en je gaat naar huis met foto's die je direct kunt gebruiken.",
	},
	{
		slug: "workshops-en-masterclasses",
		id: "05",
		title: "WORKSHOPS\nEN MASTERCLASSES",
		heading: "Workshops & Masterclasses",
		video: "video-masterclasses",
		videoNaast: true,
		// foto's in src/lib/assets/pictures/workshops-en-masterclasses
		galerij: [
			{ foto: "001-collage", titel: "Collage", verhouding: "7 / 5" },
			{ foto: "009-moderne-dans", titel: "Moderne dans", verhouding: "7 / 5" },
			{ foto: "005-maak-je-eigen-tas", titel: "Maak je eigen tas", verhouding: "7 / 5" },
			{ foto: "004-looping", titel: "Looping", verhouding: "7 / 5" },
			{ foto: "006-maak-je-eigen-tas-2", titel: "Maak je eigen tas", verhouding: "7 / 5" },
			{ foto: "013-songwriting", titel: "Songwriting", verhouding: "1 / 1" },
			{ foto: "003-hoe-richt-je-een-expositie-in", titel: "Hoe richt je een expositie in", verhouding: "4 / 3" },
			{ foto: "002-ecoline-met-de-klas", titel: "Ecoline met de klas", verhouding: "1 / 1" },
			{ foto: "010-muziekproductie", titel: "Muziekproductie", verhouding: "4 / 3" },
			{ foto: "011-paspoppen-beschilderen", titel: "Paspoppen beschilderen", verhouding: "1 / 1" },
			{ foto: "008-maak-je-eigen-schilderij", titel: "Maak je eigen schilderij", verhouding: "4 / 3" },
			{ foto: "007-maak-je-eigen-kleding", titel: "Maak je eigen kleding", verhouding: "1 / 1" },
			{ foto: "012-schilderen-met-de-klas", titel: "Schilderen met de klas", verhouding: "4 / 3" },
		],
		bg: "orange",
		wide: true,
		long: true,
		intro: "Leren van professionals uit het vak",
		metaBeschrijving:
			"Workshops en masterclasses bij Artquake: ervaren professionals delen hun kennis over muziek, kunst en performance. Je gaat naar huis met concrete handvatten.",
		text: "In onze workshops en masterclasses delen ervaren professionals hun kennis op het gebied van muziek, kunst, performance en meer.\n\nIn een workshop ga je zelf aan de slag. In een masterclass kijk je mee met iemand die er zijn of haar vak van heeft gemaakt. Van techniek tot presentatie: je gaat naar huis met concrete handvatten om verder te groeien.",
	},
	{
		slug: "coaching",
		id: "06",
		title: "COACHING",
		heading: "Coaching",
		video: "coaching",
		videoNaast: true,
		bg: "cream",
		// coaching gaat in overleg, dus geen verwijzing naar de agenda
		geenAgenda: true,
		intro: "Begeleiding op maat, voor makers, bands en dansgroepen",
		metaBeschrijving:
			"Coaching bij Artquake: persoonlijke begeleiding voor jonge makers, bands en dansgroepen. Van artistieke ontwikkeling tot zelfvertrouwen op het podium.",
		text: "Iedere maker heeft andere doelen en andere twijfels. Wij helpen je om je eigen pad te vinden, of dat nu gaat over artistieke ontwikkeling, zelfvertrouwen op het podium of het uitstippelen van de volgende stap.\n\nDat kan in een persoonlijk traject, maar ook samen: we coachen bands en dansgroepen. Van samen leren repeteren en een set opbouwen tot staan als één geheel op het podium.\n\nJe hoeft daarvoor niet al ver te zijn. Zo begeleidt onder andere Emre ook bands die nog helemaal aan het begin staan (zie het filmpje).\n\nJe werkt samen met een coach uit onze crew. Samen kijk je waar je nu staat, waar je naartoe wilt en wat daarvoor nodig is.",
	},
	{
		slug: "in-opdracht",
		id: "07",
		title: "IN\nOPDRACHT",
		heading: "In opdracht",
		video: "inopdracht",
		videoNaast: true,
		bg: "purple",
		// opdrachten gaan in overleg, dus geen verwijzing naar de agenda
		geenAgenda: true,
		intro: "Onze makers voor jouw bedrijf, organisatie of event",
		metaBeschrijving:
			"Boek jonge makers van Artquake voor je bedrijf, school of event: optredens, workshops, visuele kunst of een creatieve invulling op maat.",
		text: "Bedrijven, scholen, gemeenten en organisatoren van events kunnen bij Artquake terecht voor optredens, workshops, visuele kunst of een creatieve invulling op maat.\n\nZo krijgen onze makers betaalde opdrachten en een breder podium, en krijg jij als opdrachtgever een uniek en verzorgd resultaat.\n\nVertel ons wat je zoekt, dan denken we mee over wie of wat daarbij past.",
	},
	{
		slug: "oefenruimtes-studios-atelier-en-zaal",
		id: "08",
		title: "OEFENRUIMTES\nSTUDIO'S\nATELIER EN ZAAL",
		heading: "Hoor het van Dewi zelf!",
		bg: "dark",
		outline: true,
		full: true,
		pand: true,
		intro: "Dewi leidt je rond door het Artquake pand 🩷",
	},
];

export function vindDienst(slug) {
	return diensten.find((d) => d.slug === slug);
}
