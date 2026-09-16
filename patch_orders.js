const fs = require('fs');

const files = [
  'src/app/vendor/orders/page.tsx',
  'src/app/admin/orders/page.tsx'
];

const sizeModalHTML = `
                        {item.size && (
                          <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2, fontWeight: 500 }}>
                            Size: <span style={{ fontWeight: 700 }}>{item.size}</span>
                          </div>
                        )}`;

const slipHTML = `{item.product_name}
                            {(item.color || item.size) && (
                              <div style={{ fontSize: 10, color: "var(--gray-500)", fontWeight: 500, marginTop: 2 }}>
                                {item.color ? \`Color: \${item.color}\` : ""}
                                {item.color && item.size ? " | " : ""}
                                {item.size ? \`Size: \${item.size}\` : ""}
                              </div>
                            )}`;

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Patch Modal Items
  if (!content.includes('Size: <span')) {
    content = content.replace(
      /(\{\s*item\.color\s*&&\s*\([\s\S]*?\)\s*\})/,
      `$1${sizeModalHTML}`
    );
  }

  // Patch Packing Slip
  if (!content.includes('item.color || item.size')) {
    content = content.replace(
      />\{item\.product_name\}<\/td>/g,
      `>\n                            ${slipHTML}\n                          </td>`
    );
  }

  fs.writeFileSync(file, content);
  console.log('Patched', file);
});
