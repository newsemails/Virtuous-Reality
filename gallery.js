// gallery.js
import { promises as fs } from "fs";
import path from "path";
import { imageSizeFromFile } from 'image-size/fromFile';

const folder = "./Pictures"; // map met jouw 17 foto's
const outputWidth = 1200;  // breedte van de gallery in px
const gap = 12;            // ruimte tussen foto's in px

async function buildGallery() {
  const files = (await fs.readdir(folder))
    .filter(f => /\.(jpe?g|png|web|avif)$/i.test(f));

  const images = await Promise.all(
    files.map(async f => {
      const dims = await imageSizeFromFile(path.join(folder, f));
      return {
        file: f,
        ratio: dims.width / dims.height
      };
    })
  );

  // groepeer: 3 per rij, laatste rij kan anders zijn
  const rows = [];
  for (let i = 0; i < images.length;) {
    const remaining = images.length - i;
    const take = remaining === 2 ? 2 : Math.min(3, remaining);
    rows.push(images.slice(i, i + take));
    i += take;
  }

  return rows;
}

const rows = await buildGallery();

  // HTML opbouwen
  let html = `<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>Responsive Gallery</title>
<style>
body{margin:0;font-family:sans-serif;background:#f7f7f7}
.gallery{max-width:1200px;margin:20px auto;padding:0 ${gap}px;}
.row{display:flex;gap:${gap}px;margin-bottom:${gap}px;align-items:center}
.item{flex-grow:1;flex-basis:0;display:flex}
.item img{width:100%;height:auto;display:block;
  border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,.15)}
</style></head><body>
<div class="gallery">\n`;

  rows.forEach(row => {
    html += `\t<div class="row">\n`;
    // som van ratio’s in deze rij
    const sumRatio = row.reduce((s, im) => s + im.ratio, 0);
    row.forEach(im => {
      // flex-grow volgens verhouding
      const grow = (im.ratio / sumRatio).toFixed(5);
      html += `\t\t<div class="item" style="flex-grow:${grow}"><img src="${folder}/${im.file}" alt=""></div>\n`;
    });
    html += `\t</div>\n`;
  });

  html += `</div></body></html>`;

  await fs.writeFile("gallery.html", html);
  console.log("✅ Klaar! gallery.html gebruikt de containerbreedte dynamisch.");