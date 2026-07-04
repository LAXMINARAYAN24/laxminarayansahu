The user uploaded a résumé PDF (currently named `Infosys.pdf`) and wants it served as a downloadable file named **LaxminarayanSAHU_Resume** from the portfolio. Right now the portfolio links to `/resume.pdf`, which does not exist and returns a 404.

### What to build
1. **Asset upload**: Upload the uploaded PDF to the Lovable Assets CDN via the `lovable-assets` CLI (using `--filename LaxminarayanSAHU_Resume.pdf`) and create the `.asset.json` pointer file in `src/assets/`.
2. **Import the pointer**: Import the asset JSON in `src/routes/index.tsx` so the URL is available in code.
3. **Update both download links**: The portfolio currently has two "résumé" links — one in the sticky nav (`<a href="/resume.pdf" download>`) and one in the hero section (`<a href="/resume.pdf" download>`). Replace both `href="/resume.pdf"` with the CDN asset URL so visitors can view and download the file.
4. **Download filename**: The `download` attribute will ensure the browser saves the file as `LaxminarayanSAHU_Resume.pdf`.

### Technical details
- Use `lovable-assets create --file /mnt/user-uploads/Infosys.pdf --filename LaxminarayanSAHU_Resume.pdf > src/assets/resume.pdf.asset.json`
- Remove the temporary binary from `src/assets/` after upload (only the `.asset.json` pointer stays in the repo).
- In `src/routes/index.tsx`, import the asset and wire the `href` on the two anchor tags.

No new dependencies needed.