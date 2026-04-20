import React, { useState } from 'react';
import './ImageGallery.css';

const ImageGallery_FU = ({ images }) => {
  const [activeImg, setActiveImg] = useState(images[0]);

  return (
    <div className="mb-5">
      {/* Main 4K Image */}
      <div className="rounded-4 overflow-hidden shadow-sm mb-3" style={{ height: '450px' }}>
        <img 
          src={activeImg} 
          alt="Resource Main" 
          className="w-100 h-100 object-fit-cover transition-all" 
          style={{ transition: 'opacity 0.3s ease-in-out' }}
        />
      </div>
      
      {/* Thumbnails */}
      <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {images.map((img, index) => (
          <div 
            key={index} 
            onClick={() => setActiveImg(img)}
            className={`rounded-3 overflow-hidden cursor-pointer ${activeImg === img ? 'border border-2 border-primary' : 'opacity-75'}`}
            style={{ width: '120px', height: '80px', flexShrink: 0, cursor: 'pointer' }}
          >
            <img src={img} alt={`Thumbnail ${index}`} className="w-100 h-100 object-fit-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery_FU;