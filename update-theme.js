const fs = require('fs');
const path = require('path');

const files = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/InputForm.tsx',
  'src/components/Dashboard.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Backgrounds: pure white in light mode
  content = content.replace(/bg-slate-50/g, 'bg-white');
  
  // Also simplify some borders that might look muddy in pure white
  // We'll leave them as is, but change the accent colors
  
  // Colors: blue -> emerald, indigo -> teal
  content = content.replace(/blue-/g, 'emerald-');
  content = content.replace(/indigo-/g, 'teal-');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Updated', file);
});
