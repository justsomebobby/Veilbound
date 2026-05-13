# GitHub Setup for Veilbound

This guide assumes you are starting from the ZIP file.

## Easiest GitHub upload method

1. Go to GitHub and sign in.
2. Click the **+** button near the top-right.
3. Choose **New repository**.
4. Name it something like `veilbound`.
5. Choose **Public** if you want free GitHub Pages hosting on a free account.
6. Do **not** add a README, `.gitignore`, or license from GitHub because this ZIP already includes project files.
7. Create the repository.
8. On the empty repository page, choose **uploading an existing file**.
9. Drag all project files and folders from `veilbound-v0-phase1` into the upload page.
10. Commit the files to `main`.

## Enable GitHub Pages

1. Open the repository.
2. Click **Settings**.
3. Click **Pages** in the left sidebar.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Go to the **Actions** tab.
6. Run or wait for **Deploy to GitHub Pages**.
7. Once it succeeds, open the deployment URL.

## Command-line method

Replace `YOUR_USERNAME` and `veilbound` with your actual GitHub username/repository name.

```bash
cd veilbound-v0-phase1
git init
git add .
git commit -m "Add Phase 1 scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/veilbound.git
git push -u origin main
```

Then enable GitHub Pages from repository settings using GitHub Actions.
