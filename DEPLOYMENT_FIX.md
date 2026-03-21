# Bakery POS - Deployment Fixes

This project should be deployed using **Vite** settings in Vercel.

## Why you might see a 404:
1.  **Mismatched URL**: The project name in the code is `bakery-pos`, but the URL in the screenshot was `baker-pos.vercel.app` (missing the 'y'). Please ensure you are visiting `https://bakery-pos.vercel.app`.
2.  **Missing Output Settings**: If Vercel didn't auto-detect Vite, it might be looking for a `public` or `build` folder instead of `dist`.

## Fixes Applied:
-   Added `.gitignore`: Avoids committing `node_modules` and `dist` which can slow down or break deployments.
-   Added `vercel.json`: This explicitly tells Vercel:
    -   To use the **Vite framework**.
    -   To look into the `dist` directory for the built files.
    -   To handle **Single Page Application (SPA)** routing (all paths redirect to `index.html`).

## Redeploy Steps:
1.  Make sure your changes (the new `vercel.json` and `.gitignore`) are committed to your GitHub repository.
2.  Check the "Project Settings" in Vercel and ensure:
    -   **Framework Preset**: Vite
    -   **Root Directory**: (Leave empty, use root)
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
3.  Vercel will redeploy automatically on the next push.
