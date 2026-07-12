"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Gift, MessageCircle, Truck, Shield, CreditCard, Ban } from 'lucide-react';
import GiftsGallery from './GiftsGallery';

export default function GiftsPresentation({ whatsappLink }: { whatsappLink: string }) {
  const [activeCollection, setActiveCollection] = useState(0);

  const collections = [
    { title: "Anniversaries", img: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783784114/dastiyabstore/custom-gifts/ksygubcj06jmh4yhdn4u.png" },
    { title: "Birthdays", img: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783784315/dastiyabstore/custom-gifts/ecemwabtc2qumzozbgkw.png" },
    { title: "Corporate Events", img: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783784942/dastiyabstore/custom-gifts/ete8cmxyvidkjbswsgzu.png" },
    { title: "Special Milestones", img: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783784937/dastiyabstore/custom-gifts/xuu7epwpodlxuoe1opkt.png" },
  ];

  const policiesData = [
    {
      icon: <Ban className="policy-icon" />,
      title: "No Returns or Exchanges",
      text: "Because each Custom Gift Basket is bespoke and tailored specifically to your request with perishable items, all custom orders are final. We do not accept returns or exchanges."
    },
    {
      icon: <CreditCard className="policy-icon" />,
      title: "Advance Payment",
      text: "Your custom order is not confirmed until details are finalized. Due to the highly personalized nature, a partial or full advance payment may be required."
    },
    {
      icon: <Shield className="policy-icon" />,
      title: "Order Modifications",
      text: "Once an order has been confirmed and our artisans have started preparing the basket, we cannot accept any modifications to the configuration or note."
    },
    {
      icon: <Truck className="policy-icon" />,
      title: "Pristine Delivery",
      text: "We guarantee careful assembly and delivery. We advise that the recipient be available to receive the delivery promptly for temperature-sensitive items."
    }
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselInView, setIsCarouselInView] = useState(false);
  const [isCarouselInteracting, setIsCarouselInteracting] = useState(false);

  useEffect(() => {
    if (!isCarouselInView || isCarouselInteracting) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollCarousel = (time: number) => {
      if (carouselRef.current) {
        const deltaTime = time - lastTime;
        if (deltaTime > 16) { // Approx 60fps
          carouselRef.current.scrollLeft += 1;
          
          // Seamless Loop logic: 
          // Since the elements are exactly duplicated, scrollWidth / 2 is the exact midpoint.
          // When scrollLeft hits the midpoint, jump back to 0. It will be completely invisible!
          if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
            carouselRef.current.scrollLeft = 0;
          }
          lastTime = time;
        }
      }
      animationFrameId = requestAnimationFrame(scrollCarousel);
    };

    animationFrameId = requestAnimationFrame(scrollCarousel);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isCarouselInView, isCarouselInteracting]);

  // Fade up animation variant
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    // Seamless loop fix for Safari/iOS
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      // Seek back slightly before the end to prevent the native loop flicker
      if (video.duration && video.currentTime >= video.duration - 0.1) {
        video.currentTime = 0.05;
        video.play();
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  return (
    <div className="gifts-presentation">
      {/* SLIDE 1: Hero */}
      <section className="slide-section hero-slide">
        {/* Custom Poster Image for iOS object-fit bug */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <img 
            src="https://res.cloudinary.com/zpbci6tf/video/upload/v1783802447/dastiyabstore/custom-gifts/irlvi0o0cbt0qf3qno59.jpg" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isVideoPlaying ? 0 : 1, transition: 'opacity 0.3s ease' }} 
            alt="Gift Basket Preview" 
          />
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            loop={false} /* Handled by JS */
            playsInline 
            onPlaying={() => setIsVideoPlaying(true)}
            className="slide-bg-video"
            style={{ opacity: isVideoPlaying ? 1 : 0, transition: 'opacity 0.3s ease' }}
          >
            <source src="https://res.cloudinary.com/zpbci6tf/video/upload/v1783802447/dastiyabstore/custom-gifts/irlvi0o0cbt0qf3qno59.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="slide-overlay-dark"></div>
        <motion.div 
          className="slide-content text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={fadeUp}
        >
          <h1 className="cinematic-title" style={{ color: '#fff' }}>Bespoke<br />Gifting</h1>
          <p className="cinematic-subtitle">Make every moment unforgettable.</p>
          <div style={{ marginTop: '40px' }}>
            <a href="#philosophy" className="scroll-indicator bouncing-arrow">
              Scroll to Explore<br/>↓
            </a>
          </div>
        </motion.div>
      </section>

      {/* SLIDE 2: Philosophy */}
      <section id="philosophy" className="slide-section split-slide">
        <div className="slide-overlay-dark-solid"></div>
        <div className="split-container">
          <motion.div 
            className="split-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
            variants={fadeUp}
          >
            <h2 className="cinematic-heading">Where Time Slows. And Senses Wake.</h2>
            <p className="cinematic-text">
              We handcraft the perfect symphony of premium flowers, luxury chocolates, 
              and personalized touches. Each basket is designed to awake the senses and 
              celebrate the beauty of your unique moments.
            </p>
          </motion.div>
          <motion.div 
            className="split-right"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: false, amount: 0.4 }}
          >
            <div className="glowing-circle"></div>
            <img src="/images/gifts/gift-5.jpeg" alt="The Craft Basket" className="philosophy-img" />
          </motion.div>
        </div>
      </section>

      {/* SLIDE 3: The Process */}
      <section className="slide-section process-slide">
        <div className="slide-overlay-dark-solid"></div>
        <motion.div 
          className="process-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="process-header">
            <h2 className="cinematic-heading text-center">The Ritual</h2>
          </motion.div>
          
          <div className="process-grid">
            <motion.div variants={fadeUp} className="process-card">
              <span className="process-number">1</span>
              <Gift size={32} className="process-icon" />
              <h3>Get Inspired</h3>
              <p>Browse our gallery of past masterpieces to find the style you love.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="process-card">
              <span className="process-number">2</span>
              <MessageCircle size={32} className="process-icon" />
              <h3>Tell Us What You Want</h3>
              <p>Select your base, flowers, chocolates, and a custom note.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="process-card">
              <span className="process-number">3</span>
              <Truck size={32} className="process-icon" />
              <h3>Safe Delivery</h3>
              <p>Carefully assembled and delivered to your doorstep in pristine condition.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SLIDE 4: The Collections (Hover Reveal) */}
      <section className="slide-section collections-slide">
        {collections.map((coll, idx) => (
          <div 
            key={idx}
            className={`collection-bg ${activeCollection === idx ? 'active' : ''}`}
            style={{ backgroundImage: `url(${coll.img})` }}
          />
        ))}
        <div className="slide-overlay-gradient"></div>
        
        <div className="collections-container">
          <motion.div 
            className="collections-list"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="cinematic-heading" style={{ marginBottom: '40px' }}>Curated<br/>Moments</motion.h2>
            
            {collections.map((coll, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp}
                className={`collection-item ${activeCollection === idx ? 'active' : ''}`}
                onMouseEnter={() => setActiveCollection(idx)}
              >
                <div className="collection-dot"></div>
                {coll.title}
              </motion.div>
            ))}
          </motion.div>
          <div className="collections-info">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.4 }}
              variants={fadeUp}
            >
              <p className="cinematic-text" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                Explore our signature styles. Each basket combines warmth, contrast, and texture, setting the tone for the celebration ahead.
              </p>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-cinematic" style={{ marginTop: '30px' }}>
                Discuss Your Event
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SLIDE 5: Masterpieces (Gallery) */}
      <section className="slide-section gallery-slide" style={{ minHeight: 'auto', padding: '100px 0' }}>
        <div className="slide-overlay-dark-solid"></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 className="cinematic-heading">Our Masterpieces</h2>
            <p className="cinematic-text" style={{ maxWidth: '600px', margin: '0 auto' }}>Real orders crafted with love for our happy customers</p>
          </motion.div>
          
          <GiftsGallery whatsappLink={whatsappLink} />
        </div>
      </section>

      {/* SLIDE 6: Policies */}
      <section className="slide-section policies-slide" style={{ minHeight: 'auto', padding: '100px 5%' }}>
        <div className="slide-overlay-dark-solid"></div>
        <motion.div 
          className="policies-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={staggerContainer}
          onViewportEnter={() => setIsCarouselInView(true)}
          onViewportLeave={() => setIsCarouselInView(false)}
        >
          <motion.div variants={fadeUp} className="text-center" style={{ marginBottom: '50px' }}>
            <h2 className="cinematic-heading">Custom Orders Policy</h2>
            <p className="cinematic-text">Please review our rules for bespoke gifting</p>
          </motion.div>

          <div className="policy-carousel-container">
            <div 
              className="policy-carousel" 
              ref={carouselRef}
              onMouseEnter={() => setIsCarouselInteracting(true)}
              onMouseLeave={() => setIsCarouselInteracting(false)}
              onTouchStart={() => setIsCarouselInteracting(true)}
              onTouchEnd={() => {
                setTimeout(() => setIsCarouselInteracting(false), 2000);
              }}
            >
              {/* Original Set */}
              {policiesData.map((policy, i) => (
                <div key={`orig-${i}`} className="policy-card">
                  <div className="policy-card-content">
                    {policy.icon}
                    <h3 className="policy-title">{policy.title}</h3>
                    <p className="cinematic-text" style={{ fontSize: '0.95rem' }}>{policy.text}</p>
                  </div>
                </div>
              ))}
              {/* Duplicate Set for Infinite Scroll */}
              {policiesData.map((policy, i) => (
                <div key={`dup-${i}`} className="policy-card" aria-hidden="true">
                  <div className="policy-card-content">
                    {policy.icon}
                    <h3 className="policy-title">{policy.title}</h3>
                    <p className="cinematic-text" style={{ fontSize: '0.95rem' }}>{policy.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* SLIDE 7: Call to Action */}
      <section className="slide-section cta-slide">
        <img 
          src="https://res.cloudinary.com/zpbci6tf/image/upload/v1783784926/dastiyabstore/custom-gifts/pyvmalr2cgukgsajngmq.png" 
          className="slide-bg-video" 
          alt="Craft Your Masterpiece" 
        />
        <div className="slide-overlay-dark"></div>
        {/* Gradient to hide the hardcoded 'SHOP NOW' button in the image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '35%', background: 'linear-gradient(to top, #faf9f6 40%, transparent 100%)', zIndex: 1 }}></div>
        <motion.div 
          className="slide-content text-center"
          style={{ position: 'relative', zIndex: 10, marginTop: '150px' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="cinematic-heading" style={{ fontSize: '4rem', marginBottom: '30px', color: '#fff' }}>Craft Your Masterpiece</h2>
          <p className="cinematic-text" style={{ maxWidth: '600px', margin: '0 auto 50px', color: '#fff' }}>
            Ready to design something truly special? Connect with our team directly.
          </p>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-cinematic-glow">
            <MessageCircle size={24} />
            Start on WhatsApp
          </a>
        </motion.div>
      </section>
    </div>
  );
}
