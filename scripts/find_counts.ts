import fs from 'fs';
import path from 'path';

function searchFiles(dir: string, regex: RegExp, results: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath, regex, results);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json') || file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (regex.test(content)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const found1211 = searchFiles('./src', /1211|1,211|1000\+|1,000\+/g);
console.log('Files with 1211 / 1000+ mentions:', found1211);
