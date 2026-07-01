const fs = require('fs');
let content = fs.readFileSync('src/app/admin/settings/page.tsx', 'utf8');

// The file has several conflict markers. We'll find them using regex and replace them appropriately.
let blocks = [];
let regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> [^\n]+\r?\n/g;
let match;

while ((match = regex.exec(content)) !== null) {
  blocks.push({
    full: match[0],
    head: match[1],
    ours: match[2]
  });
}

if (blocks.length === 9) {
  // Conflict 1: States
  content = content.replace(blocks[0].full, blocks[0].head + blocks[0].ours);

  // Conflict 2: Functions
  content = content.replace(blocks[1].full, blocks[1].head + "  };\n\n" + blocks[1].ours);

  // Conflict 3: Tab Content Start
  content = content.replace(blocks[2].full, blocks[2].head + blocks[2].ours);

  // Conflict 4: Tab Content Loading
  content = content.replace(blocks[3].full, blocks[3].head + blocks[3].ours);

  // Conflict 5: Tab Content Headers
  content = content.replace(blocks[4].full, blocks[4].head + blocks[4].ours);

  // Conflict 6: Tab Content Rows
  content = content.replace(blocks[5].full, blocks[5].head + blocks[5].ours);

  // Conflict 7: Tab Fallback
  content = content.replace(blocks[6].full, blocks[6].ours);

  // Conflict 8: Modals
  content = content.replace(blocks[7].full, blocks[7].head + blocks[7].ours);

  // Conflict 9: Modal Forms
  content = content.replace(blocks[8].full, blocks[8].head + blocks[8].ours);
  
  fs.writeFileSync('src/app/admin/settings/page.tsx', content);
  console.log('Successfully fixed 9 merge conflicts');
} else {
  console.log('Expected 9 conflicts, found ' + blocks.length);
}
