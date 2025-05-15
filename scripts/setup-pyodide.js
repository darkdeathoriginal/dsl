const fs = require('fs-extra');
const path = require('path');
const tar = require('tar');
const fetch = require('node-fetch');
const bz2 = require('unbzip2-stream');
const { pipeline } = require('stream/promises');

const VERSION = '0.27.5';
const URL = `https://github.com/pyodide/pyodide/releases/download/${VERSION}/pyodide-${VERSION}.tar.bz2`;
const DOWNLOAD_PATH = path.join(__dirname, `pyodide-${VERSION}.tar.bz2`);
const EXTRACT_DIR = path.join(__dirname, '..', 'public', 'pyodide');

(async () => {
  try {
    await fs.ensureDir(EXTRACT_DIR);

    // Download .tar.bz2
    console.log(`Downloading ${URL}...`);
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    // Stream: .bz2 -> .tar -> extract
    console.log(`Extracting to ${EXTRACT_DIR}...`);
    await pipeline(
      response.body,
      bz2(),
      tar.extract({ cwd: EXTRACT_DIR, strip: 1 })
    );

    console.log('Extraction complete.');
  } catch (err) {
    console.error('Error during Pyodide setup:', err);
  }
})();
