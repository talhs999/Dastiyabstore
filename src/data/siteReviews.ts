export interface SiteReview {
  name: string;
  city: string;
  text: string;
  product: string;
  productSlug: string;
  productPrice: number;
  productImage: string;
  time: string;
  color: string;
  rating: number;
  reply?: string;
}

export const DEFAULT_SITE_REVIEWS: SiteReview[] = [
  {
    name: "Khizar Noman",
    city: "Karachi",
    text: "Dastiyab Store has quickly become one of the most reliable places for online shopping. Their service quality, product variety, and customer support really stand out.",
    product: "Mini Fan — Handheld & Desktop Stand, USB Rechargeable, Foldable Design (Cream/Brown)",
    productSlug: "mini-fan-399-10-usb-rechargeable-handheld-fan",
    productPrice: 599,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783361896/dastiyabstore/zent2vjpqszlddccpla3.webp",
    time: "8 weeks ago",
    color: "#004d40",
    rating: 5,
    reply: "Thanks khizar for Your kind words"
  },
  {
    name: "Daneen Khan",
    city: "Karachi",
    text: "I had great experience 🥰\nWhich i orderd i received the same thing",
    product: "Stress Relief 3-in-1 Gift Set — Pop-It Fidget, Earbuds & Accessories",
    productSlug: "stress-relief-3-in-1-gift-set",
    productPrice: 1899,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783766998/dastiyabstore/n4ojhvde5viritytmieb.webp",
    time: "1 week ago",
    color: "#2196f3",
    rating: 5
  },
  {
    name: "Talha Khan",
    city: "Karachi",
    text: "Very good product. I bought the U39 earbuds and was surprised by the sound quality and battery life. The quality is amazing considering the price. Highly recommended.",
    product: "Air39 ENC Wireless Earbuds",
    productSlug: "air39-enc-wireless-earbuds",
    productPrice: 699,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783373488/dastiyabstore/kpxnirknl2og8cbb9fez.webp",
    time: "2 weeks ago",
    color: "#e91e63",
    rating: 5
  },
  {
    name: "Owais Ahmed",
    city: "Karachi",
    text: "Great product! Delivery was prompt and original quality.",
    product: "Ven-Dens VD-BT060 Wireless Bluetooth Neckband Earphones — Bluetooth 5.3, Magnetic Earbuds",
    productSlug: "ven-dens-vd-bt060-wireless-neckband-earphones",
    productPrice: 1199,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783375662/dastiyabstore/up5agxn2mzimktyhf2hx.webp",
    time: "2 weeks ago",
    color: "#ff5722",
    rating: 5
  },
  {
    name: "Ayesha Siddiqui",
    city: "Lahore",
    text: "Super cute design and sound is crystal clear! Battery backup lasts for days. Best purchase from Dastiyab Store, 100% recommended!",
    product: "Picnic Music Wireless Earbuds Gift Set — Fun Theme, Bluetooth 5.0, Compact Design",
    productSlug: "picnic-music-wireless-earbuds-gift-set",
    productPrice: 1899,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783767637/dastiyabstore/znfxchjogk41o9hjypti.webp",
    time: "3 weeks ago",
    color: "#9c27b0",
    rating: 5,
    reply: "Thank you Ayesha! Glad you loved the Capybara earbuds."
  },
  {
    name: "Hamza Farooq",
    city: "Islamabad",
    text: "Bass and noise cancellation are top notch. LED digital indicator looks futuristic. Fast delivery and safe packing.",
    product: "M10 Digital Indicator True Wireless Earbuds — BT 5.3, LED Battery Display",
    productSlug: "m10-digital-indicator-true-wireless-earbuds",
    productPrice: 699,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783373877/dastiyabstore/fqbmix1mkyrrpdva2qgk.webp",
    time: "1 month ago",
    color: "#4caf50",
    rating: 5
  },
  {
    name: "Nimra Sheikh",
    city: "Rawalpindi",
    text: "Genuine quality facial kit! Instant glow after first use. The packaging was neat and courier reached within 2 days.",
    product: "Woomin 6 Steps Rice Facial Kit",
    productSlug: "woomin-6-steps-rice-facial-kit",
    productPrice: 449,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1787388354/dastiyabstore/ara4rufpeswskk8ejqqx.webp",
    time: "1 month ago",
    color: "#e91e63",
    rating: 5
  },
  {
    name: "Bilal Tariq",
    city: "Faisalabad",
    text: "Very cute mini fan with LED light! Silicone texture is so soft and works nicely. Kids love it.",
    product: "Mini Fan HQ66-23A — LED Light, USB Type-C Charging, Fruit-Top Design",
    productSlug: "mini-fan-hq66-23a-led-light-fruit-design",
    productPrice: 899,
    productImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783348746/dastiyabstore/v96edlghw6qyifana3ff.webp",
    time: "2 months ago",
    color: "#3f51b5",
    rating: 5
  }
];
