"use client";
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function GiftsGallery({ whatsappLink }: { whatsappLink: string }) {
  const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);

  const openLightbox = (url: string, type: 'image' | 'video') => {
    setSelectedMedia({ url, type });
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const galleryImages = [
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783615/dastiyabstore/custom-gifts/wecensozfeszyw4utbpl.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783616/dastiyabstore/custom-gifts/jcck1qbdzd6xm8b64i7n.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783617/dastiyabstore/custom-gifts/p6u2vy1ihohjqjo5lq5y.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783618/dastiyabstore/custom-gifts/sdktonnjmbnnrwfxiaqo.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783619/dastiyabstore/custom-gifts/waqtrcpkf5nkhx5ec30a.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783620/dastiyabstore/custom-gifts/mdxltunwzugmu71wuolr.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783621/dastiyabstore/custom-gifts/ehmmetotod6fsijpaewv.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783621/dastiyabstore/custom-gifts/rajdnx2huhwew0zyioqy.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783622/dastiyabstore/custom-gifts/kb4qjvtfrmfkmbnqcsly.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783623/dastiyabstore/custom-gifts/lkxdxq8ohyjbzpejkqsd.jpg",
    "https://res.cloudinary.com/zpbci6tf/image/upload/v1783783624/dastiyabstore/custom-gifts/i0dghuhexnk94rqehvv7.jpg"
  ];

  const galleryVideos = [
    "https://res.cloudinary.com/zpbci6tf/video/upload/v1783783634/dastiyabstore/custom-gifts/wlzmplmbsj6bancqgntr.mp4",
    "https://res.cloudinary.com/zpbci6tf/video/upload/v1783783641/dastiyabstore/custom-gifts/t2y6mr6abax7ur1wiojk.mp4",
    "https://res.cloudinary.com/zpbci6tf/video/upload/v1783783656/dastiyabstore/custom-gifts/mmisqc7rj0foodeolrnw.mp4"
  ];

  return (
    <>
      <div className="masonry-gallery">
        {/* Images */}
        {galleryImages.map((url, i) => (
          <div 
            className="masonry-item" 
            key={`img-${i}`}
            onClick={() => openLightbox(url, 'image')}
            style={{ cursor: 'pointer' }}
          >
            <img src={url} alt={`Custom Gift Basket ${i + 1}`} loading="lazy" />
            <div className="masonry-overlay">
              <span>View Details</span>
            </div>
          </div>
        ))}
        
        {/* Videos */}
        {galleryVideos.map((url, i) => (
          <div 
            className="masonry-item" 
            key={`vid-${i}`}
            onClick={() => openLightbox(url, 'video')}
            style={{ cursor: 'pointer' }}
          >
            <video 
              src={url} 
              autoPlay 
              muted 
              loop 
              playsInline 
              controls={false}
            />
            <div className="masonry-overlay">
              <span>View Details</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.url} alt="Gift Details" />
            ) : (
              <video src={selectedMedia.url} autoPlay controls playsInline />
            )}
            <div className="lightbox-footer">
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-cinematic-glow" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                <MessageCircle size={20} /> Request Similar Basket
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
