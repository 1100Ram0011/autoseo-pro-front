const fs = require('fs');

for (const file of ['src/app/dashboard/lighthouse/page.tsx', 'src/app/dashboard/cwv/page.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  
  const startMarker = '  // --- STRATEGY PANEL';
  const endMarkerIndex = content.lastIndexOf('  return (');

  if (content.indexOf(startMarker) !== -1 && endMarkerIndex !== -1 && endMarkerIndex > content.indexOf(startMarker)) {
    const startIndex = content.indexOf(startMarker);
    const before = content.slice(0, startIndex);
    const after = content.slice(endMarkerIndex);
    
    let newContent = before + after;
    newContent = newContent.replace("import { toast } from 'react-hot-toast';", "import { toast } from 'react-hot-toast';\nimport { StrategyPanel } from '../../../components/StrategyPanel';");
    
    fs.writeFileSync(file, newContent);
    console.log('Successfully updated', file);
  } else {
    console.log('Failed to find markers in', file);
  }
}
