"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function RestaurantDetailsClient({ images }: { images: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video w-full bg-muted rounded-3xl flex flex-col items-center justify-center border-2 border-dashed">
        <p className="text-muted-foreground font-medium">This restaurant doesn't have any photos yet.</p>
      </div>
    );
  }

  const next = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-6">
      {/* Ana Büyük Görsel Alanı */}
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl group shadow-2xl border-4 border-white bg-black/95 flex items-center justify-center">
        {/* ARKA PLAN BULANIKLIĞI (Opsiyonel: Boşluklar çok sırıtmasın diye arkada flu bir versiyon) */}
        <div className="absolute inset-0 opacity-30 blur-2xl scale-110">
           <Image
            src={images[activeIndex].url}
            alt=""
            fill
            className="object-cover"
          />
        </div>

        {/* ASIL FOTOĞRAF: object-contain sayesinde bozulmadan görünür */}
        <div className="relative w-full h-full flex items-center justify-center z-10">
          <Image
            src={images[activeIndex].url}
            alt="Restaurant view"
            fill
            priority
            className="object-contain transition-all duration-500 ease-in-out"
          />
        </div>
        
        {/* Navigasyon Okları */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95 text-white hover:text-primary z-20"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95 text-white hover:text-primary z-20"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail (Küçük Resim) Önizleme Şeridi */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto py-2 px-1 no-scrollbar justify-center md:justify-start">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 transform bg-black border-2 ${
                activeIndex === idx 
                  ? "ring-4 ring-primary scale-110 z-10 shadow-lg border-white" 
                  : "opacity-50 hover:opacity-100 hover:scale-105 border-transparent"
              }`}
            >
              <Image src={img.url} alt="preview" fill className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}