# Hello World Handoff

## Project

- Local folder: `/Users/kaizen/Documents/hello-world`
- GitHub repository: https://github.com/jefflovell/hello-world
- Live site: https://jefflovell.github.io/hello-world/
- Deployment: GitHub Pages from `main`, repository root

## Current State

The first version is a dependency-free static personal site built with:

- `index.html`
- `styles.css`
- `script.js`
- `.nojekyll`

It includes a responsive hero, About/Work/Contact navigation, a three-part
principles section, a current-project section, and a mobile navigation menu.

## Verification

- Desktop viewport checked at 1280x720
- Mobile viewport checked at 390x844
- No horizontal overflow
- Mobile menu open/close behavior verified
- No browser console errors
- Live GitHub Pages URL verified after deployment

## Local-Only References

These files are useful for design comparison but intentionally excluded from
Git:

- `design-concept.png`
- `site-desktop.png`
- `site-mobile.png`

## Known Follow-Ups

- Replace `hello@example.com` with the real contact email.
- Update the GitHub link in `index.html` to the repository or profile.
- Revisit the visible name/brand (`KAIZEN`) and final personal-site copy.
- Add metadata such as social preview image, favicon, and canonical URL.
- Consider moving Google Fonts to local assets if external font loading is
  undesirable.

## Working Notes

The repository was initially committed locally, then uploaded through GitHub's
web interface because command-line Git authentication was unavailable. Local
`main` has since been aligned with `origin/main`.

Preview locally with:

```sh
python3 -m http.server 8000
```
