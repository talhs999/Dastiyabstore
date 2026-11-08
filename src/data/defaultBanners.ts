export interface BannerSlide {
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
  accent: string;
  image: string;
  floatingTagTitle?: string;
  floatingTagSubtitle?: string;
}

export const DEFAULT_HERO_SLIDES: BannerSlide[] = [
  {
    badge: "🔥 Top Trending",
    title: "Cozy & Stylish\n2-Piece Night Suits",
    subtitle: "Premium soft fabric, trendy prints for women & kids starting from Rs. 1,450. Cash on delivery nationwide!",
    cta: "Shop Night Suits",
    href: "/shop/night-suits",
    bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)",
    accent: "var(--red)",
    image: "/images/mashallah-store/women-suit-01.webp",
    floatingTagTitle: "Trending",
    floatingTagSubtitle: "Mashallah Store"
  },
  {
    badge: "⚡ Top Rated Audio",
    title: "Premium Sound &\nENC Wireless Earbuds",
    subtitle: "Deep bass, crystal clear calling & all-day battery life with digital LED display",
    cta: "Explore Audio",
    href: "/shop/tws-wireless-earbuds",
    bg: "linear-gradient(135deg, #fff9e6 0%, #fff0f0 100%)",
    accent: "var(--yellow-dark)",
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783374081/dastiyabstore/pjvunzav56ikyo9irgwy.webp",
    floatingTagTitle: "HD Stereo",
    floatingTagSubtitle: "Bluetooth 5.4"
  },
  {
    badge: "🎁 Special Edition",
    title: "Make Every Occasion\nUnforgettable",
    subtitle: "Handcrafted Gift Sets, Cute Themes & Personalized Hampers made with love",
    cta: "View Gift Boxes",
    href: "/shop/gift-box",
    bg: "linear-gradient(135deg, #f0fff4 0%, #fff5f5 100%)",
    accent: "#16a34a",
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783362758/dastiyabstore/emmpbbnxjfinlzuhw3wb.webp",
    floatingTagTitle: "Perfect Gift",
    floatingTagSubtitle: "Ready to Gift"
  },
  {
    badge: "✨ Cute & Aesthetic",
    title: "Soft Silicone Panda\nLED Night Light",
    subtitle: "3 Brightness Levels with tap and squeeze controls — soft, safe and rechargeable",
    cta: "Order Now",
    href: "/product/panda-led-night-light-silicone",
    bg: "linear-gradient(135deg, #f0f4ff 0%, #fff0f5 100%)",
    accent: "var(--blue)",
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1784753546/dastiyabstore/dkzttylp7r5ebphii2ui.webp",
    floatingTagTitle: "Best Seller",
    floatingTagSubtitle: "Dastiyab Official"
  }
];

export const DEFAULT_PROMO_BANNER = {
  enabled: true,
  badge1: "Special Offer",
  badge2: "Up to 30% Off",
  title: "Trending Loungewear & Audio —",
  titleHighlight: "Night Suits & TWS Earbuds",
  titleEnd: "On Sale",
  subtitle: "Explore our latest collection of 2-Piece Night Suits and wireless accessories. Cash on delivery nationwide!",
  buttonText: "Shop Collection",
  buttonLink: "/shop",
  buttonBg: "var(--yellow)",
  buttonTextCol: "var(--black)",
  bgStyle: "linear-gradient(135deg, var(--red) 0%, #c62333 40%, #9b1526 100%)",
  bullet1: "Free Delivery on Qualifying Orders",
  bullet2: "Cash on Delivery Available",
  bullet3: "5-Day Easy Returns"
};

export const DEFAULT_BENTO_GRID = [
  { id: "block1", badge: "🔥 Trending Product", title: "Cozy & Stylish", titleHighlight: "Night Suits", subtitle: "Premium soft fabric, trendy prints for women & kids starting from Rs. 1,450.", buttonText: "Shop Now", buttonLink: "/shop/night-suits", bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)", accentColor: "var(--red)", image: "/images/mashallah-store/women-suit-01.webp", type: "main" },
  { id: "block2", title: "Wireless\nEarbuds", subtitle: "Deep Bass & ANC Audio", buttonText: "Explore", buttonLink: "/shop/tws-wireless-earbuds", bg: "#e0f2fe", accentColor: "#0ea5e9", image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783374081/dastiyabstore/pjvunzav56ikyo9irgwy.webp", type: "wide" },
  { id: "block3", title: "Gift", subtitle: "Special Hampers", buttonText: "View Gifts", buttonLink: "/shop/gift-box", bg: "#fff0f0", accentColor: "var(--red)", image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783362758/dastiyabstore/emmpbbnxjfinlzuhw3wb.webp", type: "small" },
  { id: "block4", title: "Night Lights", subtitle: "Cute LED Lamps", buttonText: "Explore", buttonLink: "/product/panda-led-night-light-silicone", bg: "#f0fdf4", accentColor: "#16a34a", image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1784753546/dastiyabstore/dkzttylp7r5ebphii2ui.webp", type: "small" },
  { id: "block5", title: "Explore All\nCategories", subtitle: "Find everything you need in one place.", buttonText: "Browse Catalog", buttonLink: "/shop", bg: "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)", accentColor: "#8b5cf6", image: "", type: "wide" },
];

