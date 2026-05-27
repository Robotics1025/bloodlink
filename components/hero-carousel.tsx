"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1920&q=80",
    badge: "Save Lives Today",
    title: "Every Drop Counts,\nBe A Hero Today",
  },
  {
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1920&q=80",
    badge: "Give Blood",
    title: "Give The Gift Of Life\nTo Those In Need",
  }
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Background images */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt="Hero background"
              fill
              className="object-cover object-center"
              priority={index === 0}
              unoptimized
            />
            <div className="absolute inset-0 bg-[#0a1c35]/70" />
          </div>
        ))}
      </div>

      {/* ── HERO CONTENT ── */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-24">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-100 translate-y-0 relative"
                : "opacity-0 translate-y-8 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="inline-block bg-[#e13a48] text-white text-[12px] font-bold tracking-[4px] uppercase px-6 py-2 rounded mb-8">
              {slide.badge}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-extrabold text-white leading-[1.1] tracking-tight mb-12 whitespace-pre-line">
              {slide.title}
            </h1>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="#how-it-works">
            <Button size="lg" className="bg-white text-[#0a1c35] hover:bg-[#0a1c35] hover:text-white font-bold px-10 py-7 uppercase tracking-wider text-[13px] rounded-none transition-all duration-300">
              READMORE
            </Button>
          </Link>
          <Link href="#contact">
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-[#e13a48] hover:border-[#e13a48] font-bold px-10 py-7 uppercase tracking-wider text-[13px] rounded-none bg-transparent transition-all duration-300">
              CONTACT US
            </Button>
          </Link>
        </div>
      </div>

      {/* Slider dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 hidden md:flex z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all border shadow ${
              index === currentSlide 
                ? "bg-white border-[#0a1c35] scale-125" 
                : "bg-black/50 border-white hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}
