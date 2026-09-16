const fs = require('fs');

// Patch Navbar.tsx
let nav = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
nav = nav.replace(/key=\{`\$\{item\.id\}-\$\{item\.color \|\| index\}`\}/g, 'key={`\${item.id}-\${item.color || index}-\${item.size || ""}`}');
nav = nav.replace(/updateQuantity\(item\.id, item\.color,/g, 'updateQuantity(item.id, item.color, item.size,');
nav = nav.replace(/removeFromCart\(item\.id, item\.color\)/g, 'removeFromCart(item.id, item.color, item.size)');
nav = nav.replace(
  /(\{\s*item\.color\s*&&\s*\([\s\S]*?\)\s*\})/,
  `$1\n                        {item.size && (
                          <div style={{ display: "inline-block", fontSize: 12, color: "var(--gray-500)", marginLeft: item.color ? 8 : 0, marginBottom: 4 }}>Size: <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{item.size}</span></div>
                        )}`
);
fs.writeFileSync('src/components/Navbar.tsx', nav);

// Patch cart/page.tsx
let cart = fs.readFileSync('src/app/cart/page.tsx', 'utf8');
cart = cart.replace(/key=\{`\$\{item\.id\}-\$\{item\.color \|\| index\}`\}/g, 'key={`\${item.id}-\${item.color || index}-\${item.size || ""}`}');
cart = cart.replace(/updateQuantity\(item\.id, item\.color,/g, 'updateQuantity(item.id, item.color, item.size,');
cart = cart.replace(/removeFromCart\(item\.id, item\.color\)/g, 'removeFromCart(item.id, item.color, item.size)');
cart = cart.replace(
  /(\{\s*item\.color\s*&&\s*\([\s\S]*?\)\s*\})/,
  `$1\n                    {item.size && (
                      <div style={{ fontSize: 13, color: "var(--gray-500)", fontWeight: 500, marginBottom: 6 }}>Size: <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{item.size}</span></div>
                    )}`
);
fs.writeFileSync('src/app/cart/page.tsx', cart);

console.log("Patched cart components");
