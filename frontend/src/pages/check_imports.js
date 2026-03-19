import fs from 'fs';

const content = fs.readFileSync('c:/Users/ASUS/Desktop/clone1/frontend/src/pages/DealerView.jsx', 'utf8');
const importsMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+'lucide-react'/);
const imports = importsMatch ? importsMatch[1].split(',').map(i => i.trim()) : [];

const jsxMatches = content.match(/<([A-Z][a-zA-Z]+)/g);
const components = jsxMatches ? jsxMatches.map(m => m.slice(1)) : [];

const builtIn = ['div', 'span', 'header', 'aside', 'nav', 'h1', 'h2', 'h3', 'p', 'button', 'input', 'label', 'aside', 'nav', 'main', 'select', 'option', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'];
const missing = components.filter(c => !imports.includes(c) && !builtIn.includes(c.toLowerCase()));

console.log('Missing imports:', [...new Set(missing)]);
