import fs from "node:fs/promises";
import sharp from "sharp";


const themes = {
  '': null,
  dark: '#dde',
  light: '#223'
};

const faviconOutputs = [
  ['svg', 0],
  ['png', 32]
];

const appiconOutputs = [
  ['png', 180],
  ['png', 256],
  ['png', 512]
];

const previewOutputs = [
  ['png', undefined],
  ['png', [512,256]],
];


const inputDir = './src-img/';
const outputDir = './public/';
const outputPath = 'icons/';


// ---------------------


const faviconSvg = await fs.readFile(inputDir + "favicon.svg", "utf8");

for (const [theme, color] of Object.entries(themes)) {
  await processSvg('favicon', faviconSvg, theme, color, faviconOutputs);
}

const appiconSvg = await fs.readFile(inputDir + "appicon.ink.svg", "utf8");

await processSvg('appicon', appiconSvg, '', null, appiconOutputs);

const previewSvg = await fs.readFile(inputDir + "preview.ink.svg", "utf8");

await processSvg('preview', previewSvg, '', null, previewOutputs);

// ---------------------


async function processSvg(fnameBase, svg, theme, color, outputSpecs) {

  if (theme) {
    svg = svg.replace(
      /(fill:\s*)#[0-9a-fA-F]{3,8}(?=\s*[;"])/g,
      `$1${color}`
    );
  }
  const sizeStr = (size) => size?.[0] ? `${size[0]}x${size[1]}` : size;
  const spec = (s) => s ? `-${s}` : '';

  const fileSpecs = outputSpecs.map(([type, size]) => ({
    type,
    size,
    theme,
    filename: `${fnameBase}${spec(sizeStr(size))}${spec(theme)}.${type}`
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

  const width = size?.[0] ?? size;
  const height = size?.[1] ?? size;

  let fileContent = svg;

  if (type === 'png') {
    fileContent = await
      sharp(Buffer.from(svg))
      .resize(width, height, { Xfit: 'contain' })
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
  const width = size?.[0] ?? size;
  const height = size?.[1] ?? size;

  const typeStr = 'image/' + type + (type==='svg' ? '+xml' : '');
  const sizesStr = size ? `sizes="${width}x${height}"` : '';
  const media = theme ? `media="(prefers-color-scheme: ${theme})"` : '';

  console.log(`<Link rel="icon" type="${typeStr}" href="/${outputPath}${filename}" ${sizesStr} ${media} />`);

  if (size === 180) {
    console.log(`<Link rel="apple-touch-icon" href="/${outputPath}${filename}" ${sizesStr} />`);
  }
}
