const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// Color replacements
content = content.replace(/text-red-600/g, 'text-[#e13a48]');
content = content.replace(/bg-red-600/g, 'bg-[#e13a48]');
content = content.replace(/border-red-600/g, 'border-[#e13a48]');
content = content.replace(/bg-red-700/g, 'bg-[#c9303d]');
content = content.replace(/hover:bg-red-700/g, 'hover:bg-[#c9303d]');
content = content.replace(/hover:text-red-600/g, 'hover:text-[#e13a48]');
content = content.replace(/text-slate-900/g, 'text-[#0a1c35]');
content = content.replace(/bg-slate-900/g, 'bg-[#0a1c35]');
content = content.replace(/bg-slate-50/g, 'bg-[#f7f9fb]');
content = content.replace(/shadow-red-200/g, 'shadow-[#e13a48]/20');

// Replace Hero and Header
const heroRegex = /\{\/\* ── TOP UTILITY BAR ── \*\/\}.*?\{\/\* ── SERVICE CARDS \(overlap hero, exactly like Cardioly\) ── \*\/\}/s;

const newHero = `
      {/* ── HERO & HEADER (Unified full-screen like Cardioly) ── */}
      <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden pb-32">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1920&q=80"
          alt="Blood donation hero"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        {/* Dark navy overlay */}
        <div className="absolute inset-0 bg-[#0a1c35]/70" />

        {/* ── TOP UTILITY BAR (Overlay) ── */}
        <div className="absolute top-0 left-0 right-0 border-b border-white/20 hidden lg:block z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12 text-[13px] text-white/90">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#e13a48]">Book Online</span>
              <span className="text-white/50">→</span>
              <span>You can request blood donation in 24 hours</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white" />
                <strong>Phone : (+254) 800-BLOOD-00</strong>
              </span>
              <div className="flex items-center gap-4">
                {["f", "X", "in", "yt"].map((s) => (
                  <span key={s} className="hover:text-[#e13a48] cursor-pointer transition-colors font-bold">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── NAVBAR (Floating white box) ── */}
        <header className="absolute top-12 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-white shadow-2xl flex items-stretch justify-between h-[85px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 pl-8 group">
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
              <div className="hidden sm:flex items-center gap-6 pr-8 border-r border-slate-100">
                <Link href="/login" className="text-[15px] font-bold text-[#0a1c35] hover:text-[#e13a48] transition-colors">
                  Sign In
                </Link>
              </div>
              <Link href="/register/hospital" className="flex items-center justify-center bg-[#e13a48] hover:bg-[#c9303d] text-white font-bold px-10 transition-colors">
                Make Appointment
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO CONTENT ── */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block bg-[#e13a48] text-white text-[12px] font-bold tracking-[4px] uppercase px-6 py-2 rounded mb-8">
            Commit to be fit
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-extrabold text-white leading-[1.1] tracking-tight mb-12">
            Healthy Habits Are Your<br />
            Heart&apos;s Desire
          </h1>
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
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 hidden md:flex">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#0a1c35] shadow" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/50 border border-white" />
        </div>
      </section>

      {/* ── SERVICE CARDS (overlap hero, exactly like Cardioly) ── */}`;

content = content.replace(heroRegex, newHero);


// Replace Service Cards
const cardsRegex = /\{\/\* ── SERVICE CARDS.*?\}\)\}\s+<\/div>\s+<\/div>\s+<\/section>/s;

const newCards = `{/* ── SERVICE CARDS (overlap hero, exactly like Cardioly) ── */}
      <section id="services" className="relative z-20 -mt-28 pb-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
                label: "BLOOD DONATION",
                title: "Register as Donor",
                Icon: Syringe,
                href: "/register/donor",
              },
              {
                img: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80",
                label: "SAVING LIVES",
                title: "Emergency Requests",
                Icon: Ambulance,
                href: "#emergency",
              },
              {
                img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80",
                label: "GREAT CARE",
                title: "Community Drives",
                Icon: HandHeart,
                href: "#drives",
              },
            ].map(({ img, label, title, Icon, href }) => (
              <div key={title} className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden group hover:-translate-y-2 transition-transform duration-500 rounded-sm">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-[#0a1c35]/10 group-hover:bg-transparent transition-colors" />
                  <Link
                    href={href}
                    className="absolute bottom-0 right-8 translate-y-1/2 w-[72px] h-[72px] rounded-full bg-[#e13a48] group-hover:bg-[#c9303d] flex items-center justify-center shadow-lg transition-colors z-10"
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </Link>
                </div>
                <div className="px-10 pt-10 pb-8 bg-white">
                  <p className="text-[#e13a48] text-[11px] font-bold tracking-[3px] uppercase mb-2">{label}</p>
                  <h3 className="text-2xl font-extrabold text-[#0a1c35] group-hover:text-[#e13a48] transition-colors">
                    <Link href={href}>{title}</Link>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>`;

content = content.replace(cardsRegex, newCards);


// Replace How We Work (Timeline to match Cardioly)
const howRegex = /\{\/\* ── HOW WE WORK \(4 steps\) ── \*\/\}.*?\{\/\* ── BLOOD DRIVES ── \*\/\}/s;

const newHow = `{/* ── HOW WE WORK (4 steps) ── */}
      <section id="how-it-works" className="py-24 bg-[#f7f9fb] relative overflow-hidden">
        {/* Background EKG watermark */}
        <Activity className="absolute text-[#e13a48]/5 w-[800px] h-[800px] -right-[200px] -bottom-[200px] pointer-events-none" strokeWidth={0.5} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-4">
            <p className="text-[#e13a48] text-[12px] font-bold tracking-[4px] uppercase">— Working Process —</p>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0a1c35] tracking-tight">How We Work?</h2>
            <div className="w-16 h-[3px] bg-[#e13a48] mx-auto mt-6" />
          </div>
          
          <div className="relative">
            {/* Heartbeat connector line (desktop) */}
            <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-[#e13a48]/30" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { num: "01", Icon: UserPlus,  title: "Appointment",   desc: "Register online as a donor or hospital partner and set your availability." },
                { num: "02", Icon: Search,    title: "Smart Match",   desc: "Our system instantly matches blood requests with compatible nearby donors." },
                { num: "03", Icon: HandHeart, title: "Donate Blood",  desc: "Receive your alert, head to the location, and donate to save a life." },
                { num: "04", Icon: Heart,     title: "Enjoy Life",    desc: "Your donation saves a patient — track your impact via your dashboard." },
              ].map(({ num, Icon, title, desc }) => (
                <div key={num} className="relative z-10 text-center group">
                  <div className="w-[84px] h-[84px] rounded-full bg-white group-hover:bg-[#e13a48] text-[#e13a48] group-hover:text-white flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(225,58,72,0.15)] transition-all duration-300 relative border-2 border-[#f7f9fb] group-hover:scale-110">
                    <Icon className="w-9 h-9" />
                    {/* Badge */}
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#0a1c35] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {num}
                    </div>
                  </div>
                  <h4 className="text-[22px] font-extrabold text-[#0a1c35] mb-3 group-hover:text-[#e13a48] transition-colors">{title}</h4>
                  <p className="text-[15px] text-slate-500 leading-relaxed px-2">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOOD DRIVES ── */}`;

content = content.replace(howRegex, newHow);


// Replace Appointment + Call Section (Full bleed red background, floating card)
const apptRegex = /\{\/\* ── APPOINTMENT \+ CALL ── \*\/\}.*?\{\/\* ── HOW WE WORK/s;

const newAppt = `{/* ── APPOINTMENT + CALL ── */}
      <section className="relative py-28 bg-[#e13a48] overflow-visible">
        {/* Dotted map background pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#ffffff_2px,_transparent_2px)] bg-[size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text content */}
            <div id="emergency" className="text-white">
              <p className="text-white/80 text-[12px] font-bold tracking-[4px] uppercase mb-4">— Have any Question? —</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 tracking-tight">Book an Appointment</h2>
              <div className="w-16 h-[3px] bg-white mb-10" />
              <p className="text-white/90 text-lg leading-relaxed mb-8">
                BloodLink ensures that when an emergency strikes, hospitals have immediate access to compatible blood donors. 
                Register today to become a part of the rapid-response network saving lives daily.
              </p>
              
              <div className="space-y-4">
                {[
                  { text: "Instant donor matching based on location and blood group" },
                  { text: "Priority alert system for critical emergency requests" },
                  { text: "24/7 dedicated support for hospital administrators" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-white font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Floating navy card */}
            <div id="contact" className="relative">
              <div className="absolute inset-0 bg-[#0a1c35] transform translate-x-4 translate-y-4 -z-10" />
              <div className="bg-[#0a1c35] p-10 sm:p-12 text-white shadow-2xl relative z-10 border-t-4 border-[#e13a48]">
                <h3 className="text-[28px] font-extrabold mb-8 text-center tracking-tight">Make An Appointment</h3>
                <div className="space-y-5">
                  <input type="text"  placeholder="Your Full Name"      className="w-full bg-[#142a47] border border-white/10 text-white placeholder:text-white/50 px-5 py-4 text-[15px] focus:outline-none focus:border-[#e13a48] transition-colors rounded-sm" />
                  <input type="email" placeholder="Email Address"        className="w-full bg-[#142a47] border border-white/10 text-white placeholder:text-white/50 px-5 py-4 text-[15px] focus:outline-none focus:border-[#e13a48] transition-colors rounded-sm" />
                  <input type="tel"   placeholder="Phone Number"         className="w-full bg-[#142a47] border border-white/10 text-white placeholder:text-white/50 px-5 py-4 text-[15px] focus:outline-none focus:border-[#e13a48] transition-colors rounded-sm" />
                  <select className="w-full bg-[#142a47] border border-white/10 text-white/80 px-5 py-4 text-[15px] focus:outline-none focus:border-[#e13a48] transition-colors rounded-sm appearance-none">
                    <option>Select Blood Group</option>
                    {["A+","A−","B+","B−","AB+","AB−","O+","O−"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                  <Link href="/register/donor" className="block pt-2">
                    <Button className="w-full bg-[#e13a48] hover:bg-[#c9303d] text-white font-bold py-7 text-[14px] uppercase tracking-wider rounded-sm transition-all duration-300 hover:shadow-[0_5px_15px_rgba(225,58,72,0.4)]">
                      Submit Request
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK`;

content = content.replace(apptRegex, newAppt);


// Write it back
fs.writeFileSync('app/page.tsx', content);

