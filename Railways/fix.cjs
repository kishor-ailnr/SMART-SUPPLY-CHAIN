const fs = require('fs');
const path = require('path');
function clean(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('node_modules')) clean(full);
    } else if (full.endsWith('.js') || full.endsWith('.jsx')) {
      const c = fs.readFileSync(full, 'utf8');
      const cleaned = c.split('\\`').join('\`');
      if (c !== cleaned) {
        fs.writeFileSync(full, cleaned);
        console.log('Fixed', full);
      }
    }
  });
}
clean('.');
