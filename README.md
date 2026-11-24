# 3point-websolutions

The static website for 3Point Web Solutions, built with HTML, CSS, and JavaScript.

## Project structure

- `index.html` - the complete page content, including the hero section
- `styles.css` - layout, responsive styles, and themes
- `script.js` - interactive behavior
- `assets/images/` - images used by the site
- `CNAME` - custom domain for GitHub Pages
- `robots.txt` and `sitemap.xml` - search engine files

Keep these files at the repository root. GitHub Pages publishes this root, so moving the HTML or assets into another folder would require changing the deployment source and asset paths.

## Edit and publish

1. Open the Desktop project folder directly in VS Code. The Explorer should show `index.html` at the top level, and the Source Control panel should show the `3point-websolutions` Git repository.
2. Edit and save the files in this repository. For example, change the hero heading or copy in `index.html`.
3. In Source Control, stage the changes and commit them on `main`.
4. Push/sync the commit to GitHub.
5. GitHub Pages automatically builds and deploys changes pushed to `main`. Check the repository's **Actions** tab for the `pages build and deployment` run; wait for it to finish successfully, then refresh the live site.

Changes made in a separate folder outside this repository are not included in its commits or deployments.
