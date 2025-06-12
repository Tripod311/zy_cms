import fs from 'fs/promises';
import path from 'path';

async function fixImportsInDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await fixImportsInDir(fullPath);
    } else if (entry.name.endsWith('.js')) {
      let code = await fs.readFile(fullPath, 'utf8');
      code = code.replace(/from\s+(['"])(\.\/.*?)(?<!\.js)\1/g, 'from $1$2.js$1');
      await fs.writeFile(fullPath, code);
    }
  }
}

await fixImportsInDir('./dist');