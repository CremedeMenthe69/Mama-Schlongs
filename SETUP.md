# Mama Schlong's Gallery — Setup

Same daily-post site as Creme de Menthe, dressed as a 1987 Italian family restaurant.
Set it up exactly like Creme de Menthe, as a **separate** site.

## 1. GitHub
- New repository called `mama-schlongs-gallery`
- **Add file → Upload files** → drag in everything inside this folder → **Commit changes**

## 2. Vercel
- **Add New → Project** → import `mama-schlongs-gallery`
- Environment Variables: `ADMIN_PASSWORD` = your password for this site
- **Deploy**

## 3. Storage
- In the new project: **Storage → Create → Blob**, set it to **Public**, connect it to this project
- **Deployments → ⋯ → Redeploy**

## 4. Domain (optional)
- **Settings → Domains → Add**, then point your domain's DNS at Vercel the same way you did for cremedementhe.io

## Every day
- Go to `/admin` (Mama's kitchen), enter your password
- Drop in a file, write what Mama says about it, click **Serve it**
- Edit the About page in the same place, then click **Save About**

## Changing the look
- Mama is `public/mama.png` (and `app/icon.png` for the browser tab). The cup and Chianti bottle are drawings in `/art`
- Colors and fonts are at the top of `app/globals.css`
- The photo of the boys is `public/mamas-boys.jpg`. Replace it with a file of the same name to change it.
