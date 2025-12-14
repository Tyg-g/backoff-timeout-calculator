import fs from "node:fs/promises";
import sharp from "sharp";


const themes = {
  '': null,
  dark: '#dde',
  light: '#223'
};

const outputs = [
  ['svg', 0],
  ['png', 16],
  ['png', 32]
];


const baseName = 'favicon';
const outputDir = './public/';
const outputPath = 'favicons/';


// ---------------------


const origSvg = await fs.readFile("./src-img/favicon.svg", "utf8");

for (const [theme, color] of Object.entries(themes)) {
  await processSvg(origSvg, theme, color);
}


async function processSvg(svg, theme, color) {

  if (theme) {
    svg = svg.replace(
      /(fill:\s*)#[0-9a-fA-F]{3,8}(?=\s*[;"])/g,
      `$1${color}`
    );
  }

  const spec = (s) => s ? `-${s}` : '';

  const fileSpecs = outputs.map(([type, size]) => ({
    type,
    size,
    theme,
    filename: `${baseName}${spec(size)}${spec(theme)}.${type}`
  }));

  for (const spec of fileSpecs) {
    await writeFile(spec, svg);
    printTag(spec);
  }
}


async function writeFile(spec, svg) {
  const { type, size, filename } = spec;
  const dirPath = `${outputDir}${outputPath}`;
  const filePath = `${dirPath}${filename}`;

  await fs.mkdir(dirPath, { recursive: true });

  let fileContent = svg;

  if (type === 'png') {
    fileContent = await
      sharp(Buffer.from(svg))
      .resize(size, size, { fit: 'contain' })
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        effort: 10 // = more CPU, smaller
      })
      .toBuffer();
  }

  await fs.writeFile(filePath, fileContent);
}


function printTag(spec) {
  const { type, size, theme, filename } = spec;

  const sizesStr = size ? `sizes="${size}x${size}"` : '';
  const media = theme ? `media="(prefers-color-scheme: ${theme})"` : '';

  console.log(`<Link rel="icon" type="image/${type}" href="/${outputPath}${filename}" ${sizesStr} ${media} />`);
}
