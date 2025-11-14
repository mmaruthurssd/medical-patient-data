const r = require('../config/sheet-registry.json');
const withScript = r.sheets.filter(s => s.production.scriptId && s.production.scriptId !== null).length;
const withoutScript = r.sheets.filter(s => s.production.scriptId === null).length;
const dev3 = r.sheets.filter(s => s.name.startsWith('DEV3')).length;
const dev4 = r.sheets.filter(s => s.name.startsWith('DEV4')).length;

console.log('Total sheets:', r.sheets.length);
console.log('  - DEV3:', dev3);
console.log('  - DEV4:', dev4);
console.log('\nWith script IDs:', withScript);
console.log('Without script IDs (null):', withoutScript);
console.log('\nSample sheets without script IDs:');
r.sheets.filter(s => s.production.scriptId === null).slice(0, 5).forEach(s => console.log(`  - ${s.id}: ${s.name.substring(0, 70)}`));
