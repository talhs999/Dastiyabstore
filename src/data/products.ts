export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  badgeType?: "red" | "yellow";
  isNew?: boolean;
  inStock: boolean;
  category: string;
  description: string;
  specs?: { label: string; value: string }[];
  features?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

export const products: Product[] = [
  {
    id: "neck-fan-001",
    name: "Premium 360° Wearable Neck Fan with 3 Speed Settings",
    slug: "premium-360-neck-fan",
    price: 1499,
    originalPrice: 2500,
    image: "https://images.unsplash.com/photo-1625765503151-c1a10cc57b44?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1625765503151-c1a10cc57b44?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    rating: 5,
    reviews: 128,
    badge: "Best Seller",
    badgeType: "red",
    inStock: true,
    category: "Neck Fan",
    isFeatured: true,
    isBestSeller: true,
    description: "Stay cool all summer with our premium 360° wearable neck fan. Featuring bladeless design, ultra-quiet motor, and 3 adjustable speed settings for personalized cooling comfort.",
    specs: [
      { label: "Battery", value: "2000mAh Li-ion" },
      { label: "Charging", value: "USB-C, 2 Hours" },
      { label: "Run Time", value: "4-8 Hours" },
      { label: "Noise Level", value: "< 35dB" },
      { label: "Speeds", value: "3 (Low/Mid/High)" },
      { label: "Weight", value: "200g" },
    ],
    features: ["360° bladeless airflow", "Ultra-quiet operation", "Flexible neck design", "USB-C fast charging", "LED indicator"],
  },
  {
    id: "laptop-stand-001",
    name: "Adjustable Aluminum Laptop Stand with Anti-Slip Pads",
    slug: "aluminum-laptop-stand",
    price: 1999,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
    rating: 4,
    reviews: 84,
    badge: "Popular",
    badgeType: "yellow",
    inStock: true,
    category: "Laptop Stand",
    isFeatured: true,
    isBestSeller: true,
    description: "Ergonomic aluminum laptop stand with 6 adjustable height levels. Improves posture, reduces neck strain, and keeps your laptop cool with ventilated design.",
    specs: [
      { label: "Material", value: "Premium Aluminum Alloy" },
      { label: "Compatibility", value: "10–17 inch laptops" },
      { label: "Height Levels", value: "6 Adjustable" },
      { label: "Weight Capacity", value: "Up to 8kg" },
      { label: "Weight", value: "450g" },
      { label: "Foldable", value: "Yes" },
    ],
    features: ["6 adjustable heights", "Anti-slip silicone pads", "Foldable portable design", "Heat dissipation ventilation", "Compatible with all laptop brands"],
  },
  {
    id: "airpods-001",
    name: "DastiyabBuds Pro — Active Noise Cancelling TWS Earbuds",
    slug: "dastiyab-buds-pro",
    price: 2499,
    originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    rating: 5,
    reviews: 210,
    badge: "Hot Deal",
    badgeType: "red",
    inStock: true,
    category: "AirPods / TWS",
    isFeatured: true,
    description: "Experience crystal-clear audio with our DastiyabBuds Pro. ANC technology, 30-hour total battery life, and premium sound drivers for audiophile-grade music.",
    specs: [
      { label: "Driver Size", value: "10mm Dynamic" },
      { label: "ANC", value: "Active Noise Cancellation" },
      { label: "Battery (Buds)", value: "6 Hours" },
      { label: "Battery (Case)", value: "24 Hours Extra" },
      { label: "Bluetooth", value: "5.3" },
      { label: "Water Resistance", value: "IPX5" },
    ],
    features: ["Active noise cancellation", "30-hour total battery", "Touch controls", "Crystal clear calls", "IPX5 water resistant"],
  },
  {
    id: "neckband-001",
    name: "DastiyabSound X1 Neckband Earphones with Magnetic Buds",
    slug: "dastiyabsound-x1-neckband",
    price: 899,
    originalPrice: 1800,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    rating: 4,
    reviews: 97,
    badge: "New",
    badgeType: "yellow",
    isNew: true,
    inStock: true,
    category: "Neckband Earphones",
    isFeatured: true,
    description: "Premium sound experience with DastiyabSound X1 magnetic neckband earphones. Wireless freedom with 12-hour battery and super bass stereo sound.",
    specs: [
      { label: "Battery", value: "12 Hours" },
      { label: "Bluetooth", value: "5.0" },
      { label: "Range", value: "10 meters" },
      { label: "Driver", value: "12mm Super Bass" },
      { label: "Charging", value: "Micro USB" },
      { label: "Magnetic Buds", value: "Yes, Auto Pause" },
    ],
    features: ["12-hour battery life", "Magnetic auto-pause", "Super bass drivers", "IPX4 sweat resistant", "Built-in mic for calls"],
  },
  {
    id: "portable-fan-001",
    name: "Mini USB Portable Table Fan — Silent Desk Cooler",
    slug: "mini-usb-portable-fan",
    price: 699,
    originalPrice: 1200,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    rating: 4,
    reviews: 53,
    inStock: true,
    category: "Portable Fan",
    description: "Compact and whisper-quiet USB desktop fan perfect for office, bedroom, or study room. 360° rotation with adjustable tilt for personalized airflow.",
    specs: [
      { label: "Power", value: "USB 5V/1A" },
      { label: "Noise Level", value: "< 30dB" },
      { label: "Tilt Angle", value: "0–90°" },
      { label: "Speeds", value: "2 (Low/High)" },
      { label: "Blade Size", value: "3.7 inches" },
    ],
    features: ["Ultra-quiet operation", "360° oscillation", "Energy efficient", "USB powered", "Adjustable tilt"],
  },
  {
    id: "airpods-002",
    name: "DastiyabBuds Lite — Affordable TWS with Long Battery",
    slug: "dastiyab-buds-lite",
    price: 1299,
    originalPrice: 2500,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
    rating: 4,
    reviews: 66,
    badge: "Value Pick",
    badgeType: "yellow",
    inStock: true,
    category: "AirPods / TWS",
    isBestSeller: true,
    description: "Get premium audio quality without breaking the bank. DastiyabBuds Lite offers 20+ hours total playtime, comfortable in-ear fit, and instant pairing.",
    specs: [
      { label: "Battery (Buds)", value: "5 Hours" },
      { label: "Battery (Case)", value: "15 Hours Extra" },
      { label: "Bluetooth", value: "5.1" },
      { label: "Charging", value: "USB-C" },
      { label: "Water Resistant", value: "IPX4" },
    ],
    features: ["20+ hour total playtime", "Instant pairing", "Touch controls", "USB-C charging case", "Compact design"],
  },
];

export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);
export const getFeaturedProducts = () => products.filter(p => p.isFeatured);
export const getBestSellers = () => products.filter(p => p.isBestSeller);
export const getProductsByCategory = (category: string) => products.filter(p => p.category === category);
