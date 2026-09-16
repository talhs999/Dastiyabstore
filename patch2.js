const fs = require('fs');

// PATCH NEW PRODUCT
let p = fs.readFileSync('src/app/vendor/products/new/page.tsx', 'utf8');
p = p.replace(/AddProductPage/g, 'VendorAddProductPage');
p = p.replace(/router\.push\("\/admin\/products"\)/g, 'router.push("/vendor/products")');
p = p.replace(/href="\/admin\/products"/g, 'href="/vendor/products"');

p = p.replace(/const \[loading, setLoading\] = useState\(false\);/, `const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState("");
  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.store?.id) setStoreId(user.store.id);
      } catch (e) {}
    }
  }, []);`);

p = p.replace(/const product = \{/, 'const product = {\n        store_id: storeId,');
fs.writeFileSync('src/app/vendor/products/new/page.tsx', p);
console.log("Patched new product page.");
