import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// runes-modus voor het hele project (niet voor libraries in node_modules)
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		// statische site voor GitHub Pages; onbekende pagina's krijgen 404.html
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			// de site staat op jamievos991.github.io/artquake; bij een eigen
			// domein wordt dit '' (zie ook src/lib/data/site.js)
			base: process.env.NODE_ENV === 'production' ? '/artquake' : ''
		}
	}
};

export default config;
