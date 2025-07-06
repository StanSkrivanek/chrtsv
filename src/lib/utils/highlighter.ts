import { bundledLanguages, bundledThemes, createHighlighter } from 'shiki';
import type { BundledTheme, BundledLanguage } from 'shiki';

let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

export async function highlightCode(code: string, lang: BundledLanguage = 'javascript', theme: BundledTheme = 'github-dark') {
	// Validate theme and language
	if (!bundledThemes[theme]) {
		throw new Error(`Invalid Shiki theme: ${theme}`);
	}

	if (!bundledLanguages[lang]) {
		throw new Error(`Unsupported language: ${lang}`);
	}

	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: [theme],
			langs: [lang]
		});
	}

	// Load additional languages/themes if needed
	if (!highlighter.getLoadedLanguages().includes(lang)) {
		await highlighter.loadLanguage(lang);
	}

	if (!highlighter.getLoadedThemes().includes(theme)) {
		await highlighter.loadTheme(theme);
	}

	return highlighter.codeToHtml(code, {
		lang,
		theme
	});
}
