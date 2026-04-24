const fs = require('fs');
const path = require('path');
function fix(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('node_modules')) fix(full);
    } else if (full.endsWith('.js') || full.endsWith('.jsx')) {
      const c = fs.readFileSync(full, 'utf8');
      // Look for \${ or \\${ or \\\${
      const cleaned = c.replace(/\\+\$\{/g, '${');
      if (c !== cleaned) {
        fs.writeFileSync(full, cleaned);
        console.log('Fixed Template Literals:', full);
      }
    }
  });
}
fix('.');
