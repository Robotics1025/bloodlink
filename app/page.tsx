import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LandingHeader } from "@/components/landing-header"
import { HeroCarousel } from "@/components/hero-carousel"
import {
  Heart, Droplet, Bell, MapPin, Clock, Users, CheckCircle,
  ArrowRight, Phone, Shield, Zap, Globe, Calendar, Activity,
  UserPlus, Search, ChevronRight, Syringe, Building2,
  AlertCircle, Ambulance, FlaskConical, HandHeart, Mail,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      
      {/* ── HERO & HEADER (Unified full-screen like Cardioly) ── */}
      <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden pb-32">
        {/* ── TOP UTILITY BAR (Overlay) ── */}
        <div className="absolute top-0 left-0 right-0 border-b border-white/20 hidden lg:block z-50 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12 text-[13px] text-white/90">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#e13a48]">Book Online</span>
              <span className="text-white/50">→</span>
              <span>You can request blood donation in 24 hours</span>
            </div>
            <div className="flex items-center gap-8 pointer-events-auto">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white" />
                <strong>Phone : (+256) 800-BLOOD-00</strong>
              </span>
              <div className="flex items-center gap-4">
                {["f", "X", "in", "yt"].map((s) => (
                  <span key={s} className="hover:text-[#e13a48] cursor-pointer transition-colors font-bold">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── NAVBAR (Sticky client component) ── */}
        <LandingHeader />

        {/* ── CAROUSEL (Animated Background & Content) ── */}
        <HeroCarousel />
      </section>

      {/* ── SERVICE CARDS (overlap hero, exactly like Cardioly) ── */}
      <section id="services" className="relative z-20 -mt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                img: "/blood_donation_1.png",
                label: "BLOOD DONATION",
                title: "Register as Donor",
                Icon: Syringe,
                href: "/register/donor",
              },
              {
                img: "/emergency_blood_2.png",
                label: "SAVING LIVES",
                title: "Emergency Requests",
                Icon: Ambulance,
                href: "#emergency",
              },
              {
                img: "/community_drive_3.png",
                label: "GREAT CARE",
                title: "Community Drives",
                Icon: HandHeart,
                href: "#drives",
              },

              // comment
            ].map(({ img, label, title, Icon, href }) => (
              <div key={title} className="group relative">
                {/* Image Container */}
                <div className="relative h-64 sm:h-72 w-full rounded-[2.5rem] z-10">
                  <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                    <Image
                      src={img}
                      alt={title}
                      fill
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-[#0a1c35]/10 group-hover:bg-transparent transition-colors" />
                  </div>
                  {/* Floating Icon (Half inside, half outside) */}
                  <Link
                    href={href}
                    className="absolute -bottom-8 right-8 w-16 h-16 rounded-full bg-[#e13a48] group-hover:bg-[#c9303d] flex items-center justify-center shadow-[0_10px_20px_rgba(225,58,72,0.3)] transition-all z-20 group-hover:-translate-y-1"
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </Link>
                </div>
                {/* Text Content */}
                <div className="pt-12 pb-4 px-4 bg-transparent">
                  <p className="text-[#e13a48] text-[11px] font-bold tracking-[3px] uppercase mb-2">{label}</p>
                  <h3 className="text-[22px] font-extrabold text-[#0a1c35] group-hover:text-[#e13a48] transition-colors">
                    <Link href={href}>{title}</Link>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS — What You Get ── */}
      <section className="py-24 bg-[#f7f9fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#e13a48] text-xs font-bold tracking-[4px] uppercase italic mb-3">— Why Join BloodLink —</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a1c35]">What You Get From BloodLink</h2>
            <div className="w-12 h-1 bg-[#e13a48] mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 text-sm mt-4 max-w-lg mx-auto">Whether you are a hospital in need of blood or a donor saving lives — BloodLink empowers you with the right tools.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Hospitals */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm group hover:shadow-xl transition-shadow duration-500">
              <div className="h-2 bg-[#e13a48]" />
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#fef2f2] flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 text-[#e13a48]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0a1c35]">For Hospitals</h3>
                    <p className="text-xs font-medium text-slate-500">Partner with us to save more lives</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: AlertCircle, text: "Post emergency blood requests that reach donors instantly" },
                    { icon: Activity,    text: "Real-time inventory dashboard to track blood stock levels" },
                    { icon: Users,       text: "Access a pool of verified, ready-to-donate community members" },
                    { icon: Calendar,    text: "Organize & manage blood drives with appointment booking" },
                    { icon: Shield,      text: "Dedicated admin support and priority emergency handling" },
                    { icon: Globe,       text: "Nationwide hospital network for cross-facility coordination" },
                  ].map(({ icon: Ic, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#fef2f2] flex items-center justify-center shrink-0 mt-0.5">
                        <Ic className="w-4 h-4 text-[#e13a48]" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/register/hospital">
                  <Button className="w-full bg-[#e13a48] hover:bg-[#c9303d] text-white font-bold py-6 rounded-xl">
                    <Building2 className="w-4 h-4 mr-2" />Register Your Hospital
                  </Button>
                </Link>
              </div>
            </div>

            {/* Donors */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm group hover:shadow-xl transition-shadow duration-500">
              <div className="h-2 bg-[#0a1c35]" />
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Heart className="w-7 h-7 text-[#0a1c35]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0a1c35]">For Donors</h3>
                    <p className="text-xs font-medium text-slate-500">Every donation makes a difference</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: Droplet,  text: "Register your blood group and get matched with patients in need" },
                    { icon: Bell,     text: "Receive real-time emergency alerts when your blood type is needed" },
                    { icon: Clock,    text: "Track your full donation history and next eligibility date" },
                    { icon: Calendar, text: "Book appointments at community blood drives near you" },
                    { icon: Heart,    text: "Get health reminders and tips for safe, regular donation" },
                    { icon: Zap,      text: "Earn recognition badges and contribute to Uganda's blood supply" },
                  ].map(({ icon: Ic, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Ic className="w-4 h-4 text-[#0a1c35]" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/register/donor">
                  <Button className="w-full bg-[#0a1c35] hover:bg-slate-800 text-white font-bold py-6 rounded-xl">
                    <Heart className="w-4 h-4 mr-2" />Become a Donor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWS / BLOG ── */}
      <section id="news" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#e13a48] text-xs font-bold tracking-[4px] uppercase italic mb-3">— Read Our Blog —</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a1c35]">Featured News and Advice</h2>
            <div className="w-12 h-1 bg-[#e13a48] mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 text-sm mt-4 max-w-xl mx-auto">Tips, health advice, and updates from the BloodLink network to keep donors and hospitals informed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {[
              { date: "MAY 10, 2026",   author: "ADMIN", comments: "2 COMMENTS", title: "Why Blood Donation Matters More Than Ever",      excerpt: "Blood shortages are a global crisis. Learn how regular donations can prevent critical shortages at your local hospital.", img: "/blog_donation.png" },
              { date: "APRIL 28, 2026", author: "ADMIN", comments: "5 COMMENTS", title: "Health Benefits of Donating Blood Regularly",     excerpt: "Beyond saving lives, donating blood has measurable health benefits — from cardiovascular improvements to iron regulation.", img: "/blog_health.png" },
              { date: "APRIL 15, 2026", author: "ADMIN", comments: "0 COMMENTS", title: "How Tech Is Revolutionising Blood Supply Chains", excerpt: "Real-time matching, live dashboards, and community alerts are changing the way blood reaches patients.", img: "/blog_tech.png" },
            ].map((post) => (
              <div key={post.title} className="flex flex-col items-center text-center group">
                {/* Blog image with specific border radius */}
                <div className="relative w-full h-56 overflow-hidden rounded-b-[2.5rem] mb-6">
                  <Image src={post.img} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                  
                  {/* Date Badge */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#e13a48] text-white text-[10px] font-bold tracking-widest px-6 py-2">
                    {post.date}
                  </div>
                </div>
                
                {/* Meta data */}
                <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-[#e13a48] uppercase tracking-wider mb-4">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 fill-[#e13a48]" /> {post.author}</span>
                  <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 fill-[#e13a48]" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> {post.comments}</span>
                </div>
                
                {/* Title */}
                <h3 className="font-extrabold text-[#0a1c35] text-xl leading-tight mb-4 px-4 hover:text-[#e13a48] transition-colors cursor-pointer">{post.title}</h3>
                
                {/* Excerpt */}
                <p className="text-[13px] text-slate-400 leading-relaxed mb-6 px-6">{post.excerpt}</p>
                
                {/* Read More button */}
                <button className="flex items-center gap-2 text-sm font-bold text-[#0a1c35] hover:text-[#e13a48] transition-colors group/btn">
                  <div className="w-5 h-5 rounded-full bg-[#e13a48] flex items-center justify-center group-hover/btn:bg-[#c9303d] transition-colors">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  Read more
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-[#e13a48] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Droplet className="w-14 h-14 text-white/80 fill-white/20 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to Save a Life?</h2>
          <p className="text-red-100 text-lg mb-8 max-w-lg mx-auto">Join thousands of donors and hospitals already using BloodLink to save lives every day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/donor">
              <Button size="lg" className="bg-white text-[#e13a48] hover:bg-slate-100 hover:text-[#c9303d] font-bold px-10 py-6 shadow-xl w-full sm:w-auto transition-all">
                <Heart className="w-5 h-5 mr-2" />Become a Donor
              </Button>
            </Link>
            <Link href="/register/hospital">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#e13a48] font-bold px-10 py-6 w-full sm:w-auto transition-all">
                <Building2 className="w-5 h-5 mr-2" />Register Hospital
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a1c35] text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-full bg-[#e13a48] flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-white fill-white" />
                </div>
                <p className="font-extrabold text-white text-lg">Blood<span className="text-red-500">Link</span></p>
              </div>
              <p className="text-sm leading-relaxed mb-6">Connecting donors and hospitals in real time for faster, smarter emergency blood coordination.</p>
              <div className="flex items-center gap-2">
                {[Heart, Globe, Bell].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Information</h4>
              <ul className="space-y-3 text-sm">
                {[["How It Works","#how-it-works"],["Emergency","#emergency"],["Blood Drives","#drives"],["Services","#services"],["Register","#contact"]].map(([l,h]) => (
                  <li key={l}><Link href={h} className="flex items-center gap-2 hover:text-red-400 transition-colors"><ChevronRight className="w-3.5 h-3.5 text-[#e13a48]" />{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Latest news */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Latest News</h4>
              <ul className="space-y-4 text-sm">
                {[{t:"Why Blood Donation Matters",d:"May 10, 2026"},{t:"Health Benefits of Donating",d:"April 28, 2026"},{t:"Tech & Blood Supply Chains",d:"April 15, 2026"}].map(({t,d}) => (
                  <li key={t} className="border-b border-slate-800 pb-3 last:border-0">
                    <p className="text-xs text-red-500 mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" />{d}</p>
                    <p className="hover:text-red-400 transition-colors cursor-pointer leading-snug">{t}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hours + Contact */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Opening Hours</h4>
              <ul className="space-y-2 text-sm mb-6">
                {[["Mon – Fri","8:00 – 20:00"],["Saturday","9:00 – 17:00"],["Sunday","Emergency Only"]].map(([d,t]) => (
                  <li key={d} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                    <span>{d}</span><span className="text-white font-medium">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-red-500" />+256 (800) BLOOD-00</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-red-500" />help@bloodlink.org</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 BloodLink System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {["FAQ","About Us","Contact Us"].map((l) => <Link key={l} href="#" className="hover:text-red-400 transition-colors">{l}</Link>)}
            </div>
            <div className="flex items-center gap-1 text-slate-500">Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> to save lives</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
