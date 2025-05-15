// scripts/setup-pyodide.js
const fetch = require('node-fetch'); // Using node-fetch v2
const tar = require('tar');
const fs = require('fs-extra');
const path = require('path');
const { pipeline } = require('stream/promises'); // For Node.js 16+
const zlib = require('zlib'); // For .bz2, though `tar` might handle it. If not, `bzip2` package might be needed.


// --- Configuration ---
const PYODIDE_VERSION = '0.27.5'; // Specify the Pyodide version you want
const PYODIDE_DIST_URL = `https://github.com/pyodide/pyodide/releases/download/${PYODIDE_VERSION}/pyodide-${PYODIDE_VERSION}.tar.bz2`;
// Check the release page for the exact filename. Some might be -full.tar.bz2
// For example, v0.25.1 is `pyodide-v0.25.1.tar.bz2`
// v0.25.0 was `pyodide-v0.25.0-full.tar.bz2`

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PYODIDE_TARGET_DIR = path.join(PUBLIC_DIR, 'pyodide');
const DOWNLOAD_TARGET_PATH = path.join(__dirname, `pyodide-${PYODIDE_VERSION}.tar.bz2`); // Temporary download location

async function setupPyodide() {
  console.log(`Setting up Pyodide version ${PYODIDE_VERSION}...`);

  try {
    // 1. Ensure public directory exists
    await fs.ensureDir(PUBLIC_DIR);

    // 2. Check if Pyodide is already set up correctly (simple check)
    // A more robust check would be to verify a specific file or version marker.
    if (await fs.pathExists(path.join(PYODIDE_TARGET_DIR, 'pyodide.js'))) {
      console.log('Pyodide already found in public/pyodide. Skipping setup.');
      // You could add a version check here if you store the version somewhere
      return;
    }

    // 3. Clean up target directory if it exists but is incomplete
    if (await fs.pathExists(PYODIDE_TARGET_DIR)) {
      console.log('Cleaning up existing incomplete Pyodide directory...');
      await fs.emptyDir(PYODIDE_TARGET_DIR);
      await fs.rmdir(PYODIDE_TARGET_DIR); // Remove the empty dir before recreating
    }


    // 4. Download Pyodide distribution
    console.log(`Downloading Pyodide from ${PYODIDE_DIST_URL}...`);
    const response = await fetch(PYODIDE_DIST_URL);
    if (!response.ok) {
      throw new Error(`Failed to download Pyodide: ${response.statusText}`);
    }
    // Use pipeline for efficient streaming of download to file
    await pipeline(response.body, fs.createWriteStream(DOWNLOAD_TARGET_PATH));
    console.log(`Downloaded Pyodide to ${DOWNLOAD_TARGET_PATH}`);

    // 5. Extract the downloaded archive
    console.log(`Extracting Pyodide to ${PUBLIC_DIR}...`);
    // The tar files from Pyodide releases often have a top-level directory like 'pyodide/'
    // or 'pyodide-vX.Y.Z/pyodide/'. We want to extract the *contents* of the inner 'pyodide' folder.
    // The `strip: 1` option in `tar.extract` helps remove leading directory components.
    // However, Pyodide archives usually have `pyodide/` as the main content.
    // We will extract to a temporary location and then move the 'pyodide' subfolder.

    const tempExtractDir = path.join(__dirname, 'pyodide_temp_extract');
    await fs.ensureDir(tempExtractDir);
    await fs.emptyDir(tempExtractDir); // Clean if exists

    console.log(`Extracting ${DOWNLOAD_TARGET_PATH} to ${tempExtractDir}...`);

    // The `tar` module might need help with .bz2 directly.
    // If `tar.x` doesn't handle bz2, you'd typically pipe through a bz2 decompressor.
    // However, many modern `tar` implementations (and the `tar` npm package)
    // can infer compression from the extension. Let's try directly first.
    // If it fails, you might need to use `bzip2-asm` or a similar package.
    // For now, this assumes `tar` can handle `.tar.bz2`
    await tar.extract({
      file: DOWNLOAD_TARGET_PATH,
      cwd: tempExtractDir,
      // strip: 1, // Be careful with strip, depends on archive structure
    });
    console.log('Extraction complete.');

    // Pyodide archives usually extract into a folder like `pyodide/`
    // or `dist/` or `pyodide-vX.Y.Z/pyodide/` within the tempExtractDir.
    // We need to find the actual 'pyodide' content directory.
    // Common structures are:
    // 1. pyodide-vX.Y.Z.tar.bz2 -> extracts to ./pyodide/* (files like pyodide.js directly in pyodide folder)
    // 2. pyodide-vX.Y.Z-full.tar.bz2 -> extracts to ./dist/* or some other top level before pyodide/*

    // Let's assume the key 'pyodide' directory is what we want
    let extractedPyodideSourceDir;
    const potentialPath1 = path.join(tempExtractDir, 'pyodide'); // e.g. if tar extracts 'pyodide/*'
    const potentialPath2 = path.join(tempExtractDir, `pyodide-v${PYODIDE_VERSION}`, 'pyodide'); // if versioned folder
    const potentialPathDist = path.join(tempExtractDir, 'dist'); // some versions have a 'dist' folder

    if (await fs.pathExists(potentialPath1) && (await fs.readdir(potentialPath1)).includes('pyodide.js')) {
        extractedPyodideSourceDir = potentialPath1;
    } else if (await fs.pathExists(potentialPath2) && (await fs.readdir(potentialPath2)).includes('pyodide.js')) {
        extractedPyodideSourceDir = potentialPath2;
    } else if (await fs.pathExists(potentialPathDist) && (await fs.readdir(potentialPathDist)).includes('pyodide.js')) {
        extractedPyodideSourceDir = potentialPathDist; // If pyodide.js is directly in dist/
    } else if (await fs.pathExists(potentialPathDist) && await fs.pathExists(path.join(potentialPathDist, 'pyodide')) && (await fs.readdir(path.join(potentialPathDist, 'pyodide'))).includes('pyodide.js')) {
        extractedPyodideSourceDir = path.join(potentialPathDist, 'pyodide'); // If it's dist/pyodide/
    }
     else {
      // Scan tempExtractDir for a directory named 'pyodide' that contains 'pyodide.js'
      const entries = await fs.readdir(tempExtractDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subDirPath = path.join(tempExtractDir, entry.name);
          const pyodideSubDir = path.join(subDirPath, 'pyodide');
          if (await fs.pathExists(path.join(subDirPath, 'pyodide.js'))) {
            extractedPyodideSourceDir = subDirPath;
            break;
          } else if (await fs.pathExists(pyodideSubDir) && (await fs.readdir(pyodideSubDir)).includes('pyodide.js')) {
             extractedPyodideSourceDir = pyodideSubDir;
             break;
          }
        }
      }
    }


    if (!extractedPyodideSourceDir || !(await fs.pathExists(extractedPyodideSourceDir))) {
      console.error('Could not find the "pyodide" content directory within the extracted archive.');
      console.error('Please check the archive structure or the extraction path logic in the script.');
      console.log('Contents of tempExtractDir:', await fs.readdir(tempExtractDir));
      throw new Error('Pyodide content directory not found after extraction.');
    }

    console.log(`Found Pyodide source content at: ${extractedPyodideSourceDir}`);
    console.log(`Moving Pyodide content from ${extractedPyodideSourceDir} to ${PYODIDE_TARGET_DIR}...`);
    await fs.move(extractedPyodideSourceDir, PYODIDE_TARGET_DIR, { overwrite: true });
    console.log('Pyodide successfully moved to public/pyodide.');

    // 6. Clean up downloaded archive and temporary extraction folder
    console.log('Cleaning up temporary files...');
    await fs.remove(DOWNLOAD_TARGET_PATH);
    await fs.remove(tempExtractDir); // Remove the parent temp extraction dir

    console.log('Pyodide setup complete.');

  } catch (error) {
    console.error('Error during Pyodide setup:', error);
    process.exit(1); // Exit with error code
  }
}

setupPyodide();