const fs = require('fs');
let p = fs.readFileSync('src/app/vendor/products/new/page.tsx', 'utf8');
p = p.replace(/AddProductPage/g, 'VendorAddProductPage');
p = p.replace(/router\.push\("\/admin\/products"\)/g, 'router.push("/vendor/products")');
p = p.replace(/href="\/admin\/products"/g, 'href="/vendor/products"');

// Inject storeId logic
p = p.replace(/const \[loading, setLoading\] = useState\(false\);/, `const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState("");
  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.store?.id) {
          setStoreId(user.store.id);
        }
      } catch (e) {}
    }
  }, []);`);

p = p.replace(/const payload = \{/, 'const payload = { store_id: storeId,');
fs.writeFileSync('src/app/vendor/products/new/page.tsx', p);

let e = fs.readFileSync('src/app/vendor/products/[id]/page.tsx', 'utf8');
e = e.replace(/EditProductPage/g, 'VendorEditProductPage');
e = e.replace(/router\.push\("\/admin\/products"\)/g, 'router.push("/vendor/products")');
e = e.replace(/href="\/admin\/products"/g, 'href="/vendor/products"');
fs.writeFileSync('src/app/vendor/products/[id]/page.tsx', e);
