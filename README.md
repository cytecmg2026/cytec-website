# CyTec Mönchengladbach — Website

Neue Unternehmens-Website der CyTec Mönchengladbach GmbH & Co. KG (cytec-mg.de).

- **Stack:** Statisches HTML/CSS/JS, kein Build-Schritt
- **Hosting:** Netlify (Projekt `cytec-mg`), Auto-Deploy bei jedem Push auf `main`
- **Kontaktformular:** Netlify Forms (Formularname `rfq`), Danke-Seite `/danke.html`
- **SEO/GEO:** `robots.txt` (KI-Crawler erlaubt), `sitemap.xml`, `llms.txt`, Schema.org (FAQ, Glossar, Artikel)
- **Redirects:** `_redirects` mappt alte WordPress-URLs (301) für den Domain-Umzug

## Struktur

```
index.html, kontakt.html, ueber-uns.html, karriere.html, danke.html
produkte/   — Flaschenbündel, Gasetrailer, HD-Leitungssysteme, Engineering
pruefung/   — Behälterprüfung, NDT
wissen/     — News, Ratgeber, Glossar, FAQ
assets/     — css, js (site.js = Effekte, fluid.js = Fluid-Hintergrund), media
```

Betreut von Jörg Schröder Unternehmensberatung · geplanter Transfer an CyTec-eigene Konten.
