const fs = require('fs');

const files = [
  'src/app/admin/products/new/page.tsx',
  'src/app/vendor/products/new/page.tsx',
  'src/app/admin/products/[id]/page.tsx',
  'src/app/vendor/products/[id]/page.tsx'
];

const handlersCode = `
  // Sizes handlers
  const handleAddSize = () => setSizes([...sizes, ""]);
  const handleSizeChange = (index: number, val: string) => {
    const newSizes = [...sizes];
    newSizes[index] = val;
    setSizes(newSizes);
  };
  const handleRemoveSize = (index: number) => setSizes(sizes.filter((_, i) => i !== index));
`;

const uiCode = `
        {/* Sizes Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <label className="label" style={{ marginBottom: 0 }}>Available Sizes</label>
            <button type="button" onClick={handleAddSize} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--red)", background: "var(--red-light)", padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer" }}>
              <Plus size={14} /> Add Size
            </button>
          </div>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: -12 }}>Add sizes available for this product (e.g. S, M, L, 32). Leave empty if there are no size options.</p>
          {sizes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {sizes.map((size, index) => (
                <div key={index} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input className="input" placeholder="e.g. S, M, L" value={size} onChange={e => handleSizeChange(index, e.target.value)} style={{ flex: 1, padding: 10, background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8 }} />
                  <button type="button" onClick={() => handleRemoveSize(index)} style={{ color: "var(--gray-500)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
`;

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Insert handlers if not already present
  if (!content.includes('handleAddSize')) {
    content = content.replace(/const handleAddSpec = \(\) => \{/g, handlersCode + '\n  const handleAddSpec = () => {');
  }

  // Insert UI
  if (!content.includes('Available Sizes')) {
    content = content.replace(/\{\/\* Badges Section \*\/\}/g, uiCode + '\n        {/* Badges Section */}');
  }

  fs.writeFileSync(file, content);
  console.log('Patched', file);
});
