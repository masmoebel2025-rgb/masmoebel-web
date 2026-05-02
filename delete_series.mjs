import { rm } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const filesToDelete = [
  'src/pages/cocinas/serie-1-gloss.astro',
  'src/pages/cocinas/serie-2-matt.astro',
  'src/pages/cocinas/serie-3-adira.astro',
  'src/pages/cocinas/serie-4-universo.astro',
  'src/pages/cocinas/serie-5-real.astro',
  'src/pages/cocinas/serie-6-stone.astro',
  'src/pages/cocinas/serie-7-fenix.astro',
  'src/pages/cocinas/serie-8-finger-pull.astro',
];

async function deleteFiles() {
  for (const file of filesToDelete) {
    const fullPath = join(__dirname, file);
    try {
      await rm(fullPath);
      console.log(`Deleted: ${file}`);
    } catch (err) {
      console.error(`Failed to delete ${file}:`, err.message);
    }
  }
  console.log('Done!');
}

deleteFiles();
