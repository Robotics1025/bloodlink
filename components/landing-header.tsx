"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Calendar } from "lucide-react"

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={`z-50 transition-all duration-300 overflow-x-hidden ${
        isScrolled 
          ? "fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-md animate-in slide-in-from-top-4" 
          : "absolute top-12 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8"
      }`}
    >
      <div className={`mx-auto flex items-stretch justify-between transition-all duration-300 ${
        isScrolled 
          ? "max-w-7xl h-[70px]" 
          : "max-w-7xl bg-white shadow-2xl h-[85px] rounded-sm"
      }`}>
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-2 group ${isScrolled ? "pl-4" : "pl-8"}`}>
          <div className="w-10 h-10 rounded-full bg-[#e13a48] flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-extrabold text-[28px] text-[#0a1c35] tracking-tight">
            Blood<span className="font-light">Link</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-[#0a1c35]">
          {[["Home","/"],["Services","#services"],["Emergency","#emergency"],["Blood Drives","#drives"],["Blog","#news"],["Contact","#contact"]].map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-[#e13a48] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#e13a48] hover:after:w-full after:transition-all py-1">
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-stretch">
          <div className="hidden sm:flex items-center gap-6 pr-10 border-r border-slate-100">
            <Link href="/login" className="text-[15px] font-bold text-[#0a1c35] hover:text-[#e13a48] transition-colors">
              Sign In
            </Link>
          </div>
          
          {/* CTA Button with expanding background and floating icon */}
          <Link 
            href="/register/hospital" 
            className={`relative flex items-center justify-center text-white font-bold pl-12 pr-10 transition-colors group z-10 ${
              isScrolled ? "bg-[#e13a48]" : "bg-[#e13a48] rounded-r-sm"
            }`}
          >
            {/* The expanding background for sticky state (expands infinitely to the right) */}
            {isScrolled && (
              <div className="absolute top-0 bottom-0 left-0 w-[50vw] bg-[#e13a48] -z-10 group-hover:bg-[#c9303d] transition-colors" />
            )}
            
            {/* Normal background color for hover state (when not expanding) */}
            {!isScrolled && (
              <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 rounded-r-sm transition-colors pointer-events-none" />
            )}
            
            {/* The Floating Icon (Half inside, half outside) */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0a1c35] border-[4px] border-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-4 h-4 text-white" />
            </div>

            <span className="relative z-10 uppercase tracking-wide">REGISTER</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
