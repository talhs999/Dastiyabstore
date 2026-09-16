const fs = require('fs');

let file = 'src/app/product/[slug]/page.tsx';
let p = fs.readFileSync(file, 'utf8');

if (!p.includes('const [selectedSize')) {
  p = p.replace(/const \[selectedColor, setSelectedColor\].*?;/, '$&\n  const [selectedSize, setSelectedSize] = useState<string | null>(null);');
}

if (!p.includes('let parsedSizes')) {
  const initSizes = `
          let parsedSizes = [];
          try {
             parsedSizes = Array.isArray(mapped.sizes) ? mapped.sizes : (typeof mapped.sizes === 'string' ? JSON.parse(mapped.sizes) : []);
          } catch(e) {}
          if (parsedSizes.length === 1) {
            setSelectedSize(parsedSizes[0]);
          }`;
  p = p.replace(/if \(parsedColors\.length === 1\) \{\s*setSelectedColor\(parsedColors\[0\]\);\s*\}/, '$&\n' + initSizes);
}

if (!p.includes('const productSizes =')) {
  p = p.replace(/const productColors = .*?;/, '$&\n  const productSizes = Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === "string" ? (function() { try { return JSON.parse(product.sizes); } catch { return []; } })() : (product.sizes || []));');
}

if (!p.includes('if (productSizes.length > 0 && !selectedSize)')) {
  const sizeValidation = `
    if (productSizes.length > 0 && !selectedSize) {
      showToast("Please select a size first", "error");
      return;
    }`;
  p = p.replace(/if \(productColors\.length > 0 && !selectedColor\) \{\s*showToast\("Please select a color first", "error"\);\s*return;\s*\}/g, '$&\n' + sizeValidation);
}

if (!p.includes('size: selectedSize')) {
  p = p.replace(/colorHex: selectedColor\?\.hex,/g, '$&\n        size: selectedSize,');
}

if (!p.includes('{/* Size Selection */}')) {
  const sizeUI = `              {/* Size Selection */}
              {productSizes && productSizes.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label className="label">Size <span style={{ color: "var(--red)" }}>*</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {productSizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 48,
                          height: 48,
                          padding: "0 16px",
                          borderRadius: "var(--radius)",
                          border: \`2px solid \${selectedSize === size ? "var(--red)" : "var(--gray-200)"}\`,
                          background: selectedSize === size ? "var(--red)" : "white",
                          color: selectedSize === size ? "white" : "var(--gray-700)",
                          fontWeight: selectedSize === size ? 700 : 600,
                          fontSize: 15,
                          cursor: "pointer",
                          boxShadow: selectedSize === size ? "0 4px 12px rgba(220, 38, 38, 0.2)" : "var(--shadow-sm)",
                          transition: "all 0.2s"
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
`;
  p = p.replace(/\{\/\* Quantity \*\/\}/, sizeUI + '\n              {/* Quantity */}');
}

fs.writeFileSync(file, p);
console.log("Patched product page successfully");
