import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  BarChart3,
  PlayCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Droplets,
  Zap,
  Activity,
  GraduationCap,
  Bus,
  Layers
} from 'lucide-react';
import { useCivic, NavigationTab } from '../../context/CivicContext';
import { DOMAIN_THEME } from '../../constants/theme';

export const LandingPage: React.FC = () => {
  const { setActiveTab, records } = useCivic();
  const [activeModal, setActiveModal] = useState<'about' | 'contact' | 'learnMore' | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth mouse-follow parallax effect respecting prefers-reduced-motion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute live complaint counts from existing context records
  const roadsCount = records.filter(r => r.category === 'Roads').length;
  const waterCount = records.filter(r => r.category === 'Water Supply').length;
  const electricityCount = records.filter(r => r.category === 'Electricity').length;
  const healthcareCount = records.filter(r => r.category === 'Healthcare').length;
  const educationCount = records.filter(r => r.category === 'Education').length;
  const transitCount = records.filter(r => r.category === 'Transportation').length;
  const drainageCount = records.filter(r => r.category === 'Drainage / Sewage').length;

  const navigateTo = (tab: NavigationTab) => {
    setActiveTab(tab);
  };

  const navigateToCategory = (_catName: string) => {
    setActiveTab('complaint-explorer');
  };

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[100svh] bg-[#FBF7EF] text-[#182820] font-sans selection:bg-[#073D32]/20 selection:text-[#073D32] flex flex-col m-0 p-0 overflow-x-hidden relative"
    >
      {/* 
        ========================================================================
        HERO SECTION: SINGLE, CLEARLY DEFINED CONTAINER (Edge-to-Edge)
        Fills 100% viewport width, min-h-[100svh], zero outer margins or cards.
        The spotless background artwork renders the citizens (left), government
        building & skyline (bottom), and laptop analytics (right) with zero baked-in
        text. Exactly ONE set of controls and text exists in HTML.
        ========================================================================
      */}
      <section className="relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#FBF7EF]">
        {/* 
          --------------------------------------------------------------------
          LAYER 1: BACKGROUND ARTWORK
          Spotless illustration background: citizens on left, government
          building at bottom, laptop analytics on right. Center and top
          contain clean warm ivory with ZERO duplicate text or ghosting.
          --------------------------------------------------------------------
        */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none select-none transition-transform duration-500 ease-out z-0"
          style={{
            transform: `translate3d(${mousePos.x * -6}px, ${mousePos.y * -6}px, 0)`
          }}
        >
          <img
            src="/assets/civicsense_hero_clean.png"
            alt="CivicSense Citizen Engagement and Analytics Illustration"
            className="w-full h-full object-cover object-bottom"
            loading="eager"
          />
        </div>

        {/* 
          --------------------------------------------------------------------
          LAYER 2: EXACTLY ONE TOP NAVIGATION BAR (Single Header)
          --------------------------------------------------------------------
        */}
        <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 py-4 sm:py-5 flex items-center justify-between">
          {/* Exactly ONE CivicSense Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1 group text-left focus:outline-none"
            title="CivicSense - Home"
          >
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#073D32] font-serif">
                Civic
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#E85A24] font-serif">
                Sense
              </span>
              <svg
                className="w-5 h-5 -mt-3 -ml-0.5 text-[#15966A] fill-current transform rotate-12 transition-transform group-hover:rotate-45"
                viewBox="0 0 24 24"
              >
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[#182820]">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[#073D32] font-bold border-b-2 border-[#073D32] pb-0.5 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => setActiveModal('about')}
              className="text-[#182820]/80 hover:text-[#073D32] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => navigateTo('complaint-analysis')}
              className="text-[#182820]/80 hover:text-[#073D32] transition-colors cursor-pointer"
            >
              Analysis
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="text-[#182820]/80 hover:text-[#073D32] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigateTo('insights')}
              className="text-[#182820]/80 hover:text-[#073D32] transition-colors cursor-pointer"
            >
              Insights
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="text-[#182820]/80 hover:text-[#073D32] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('dashboard')}
              className="bg-[#073D32] hover:bg-[#0c4e40] text-[#FFFDF8] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 
          --------------------------------------------------------------------
          LAYER 3: HERO CENTER CONTENT (Clean Vertical Flow, No Overlaps)
          Exactly ONE Heading, Subtitle, 6 Icons, Tagline, and CTA Buttons.
          Structured in a stable, centered column with no negative margins
          or conflicting transforms.
          --------------------------------------------------------------------
        */}
        <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center px-4 py-3 sm:py-6">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">
            {/* 1. Exactly ONE Large CivicSense Hero Heading */}
            <div className="relative inline-block select-none">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight font-serif leading-none">
                <span className="text-[#073D32]">Civic</span>
                <span className="text-[#E85A24]">Sense</span>
              </h1>
              {/* Reference leaf accent resting above the letter S */}
              <div className="absolute -top-3 sm:-top-5 left-[48%] -translate-x-1/2 pointer-events-none">
                <svg className="w-6 h-6 sm:w-9 sm:h-9 text-[#15966A] fill-current transform -rotate-12" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
              </div>
            </div>

            {/* 2. Exactly ONE Subtitle */}
            <div className="mt-3 sm:mt-5 inline-flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full bg-[#FFFDF8] border border-[#E7E0D3] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#15966A] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-[#182820]">
                Government Grievance & Public Sentiment Analysis System
              </span>
            </div>

            {/* 3. Exactly ONE Row of Six Public-Service Icons */}
            <div className="relative w-full max-w-lg mt-6 sm:mt-7 mb-2 py-1">
              {/* Connecting Horizontal Line */}
              <div className="absolute top-[22px] sm:top-[26px] left-6 right-6 h-[2px] bg-[#E7E0D3] -translate-y-1/2 z-0" />

              <div className="relative z-10 flex items-center justify-between px-2 sm:px-4">
                {[
                  { id: 'roads', name: 'Roads', count: roadsCount, bg: 'bg-[#15966A]', hover: 'hover:ring-[#15966A]', icon: Layers },
                  { id: 'water', name: 'Water Supply', count: waterCount, bg: 'bg-[#0EA5E9]', hover: 'hover:ring-[#0EA5E9]', icon: Droplets },
                  { id: 'electricity', name: 'Electricity', count: electricityCount, bg: 'bg-[#F2B544]', hover: 'hover:ring-[#F2B544]', icon: Zap },
                  { id: 'healthcare', name: 'Healthcare', count: healthcareCount, bg: 'bg-[#F16B5B]', hover: 'hover:ring-[#F16B5B]', icon: Activity },
                  { id: 'education', name: 'Education', count: educationCount, bg: 'bg-[#8B5CF6]', hover: 'hover:ring-[#8B5CF6]', icon: GraduationCap },
                  { id: 'transport', name: 'Transportation', count: transitCount, bg: 'bg-[#14B8A6]', hover: 'hover:ring-[#14B8A6]', icon: Bus }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center group cursor-pointer"
                      onClick={() => navigateToCategory(item.name)}
                      onMouseEnter={() => setActiveTooltip(item.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full ${item.bg} text-white flex items-center justify-center shadow-md transform transition-all duration-200 group-hover:scale-115 group-hover:ring-4 ${item.hover}/40 group-active:scale-95`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="mt-1.5 text-[10px] sm:text-xs font-bold text-[#182820] opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Tooltip on Category Hover */}
              {activeTooltip && (
                <div className="absolute left-1/2 -top-10 -translate-x-1/2 z-30 pointer-events-none bg-[#182820] text-white px-3.5 py-1.5 rounded-lg text-xs shadow-xl backdrop-blur-xs flex items-center gap-2 border border-stone-700/60 animate-in fade-in duration-150 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-[#15966A] animate-pulse" />
                  <span>
                    {activeTooltip === 'roads' && `Roads: ${roadsCount} Grievances • Potholes & Surfacing`}
                    {activeTooltip === 'water' && `Water Supply: ${waterCount} Grievances • Pipeline & Pressure`}
                    {activeTooltip === 'electricity' && `Electricity: ${electricityCount} Grievances • Power Outages & Grid`}
                    {activeTooltip === 'healthcare' && `Healthcare: ${healthcareCount} Grievances • Clinics & Emergency`}
                    {activeTooltip === 'education' && `Education: ${educationCount} Grievances • School Facilities`}
                    {activeTooltip === 'transport' && `Transportation: ${transitCount} Grievances • Bus & Transit Lines`}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Exactly ONE Tagline */}
            <p className="mt-5 sm:mt-6 text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-[#182820]/90 select-none">
              FROM CITIZEN VOICES TO ACTIONABLE INSIGHTS
            </p>

            {/* 5. Exactly ONE Pair of CTA Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigateTo('dashboard')}
                className="bg-[#073D32] hover:bg-[#0c4e40] text-[#FFFDF8] font-bold text-sm sm:text-base px-8 py-3 rounded-full flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-[#15966A]" />
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={() => setActiveModal('learnMore')}
                className="bg-[#FFFDF8] hover:bg-white text-[#182820] font-bold text-sm sm:text-base px-7 py-3 rounded-full border-2 border-[#182820] flex items-center gap-2 shadow-xs hover:shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-[#E85A24]" />
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>

        {/* 
          --------------------------------------------------------------------
          LAYER 4: SUBTLE INTERACTIVE HOTSPOTS FOR LAPTOP ANALYTICS & CITIZENS
          Overlay hotspots allow users to directly click analytics cards on the
          laptop or citizen bubbles on the left, without rendering any duplicate
          text over the artwork.
          --------------------------------------------------------------------
        */}
        {/* Left Citizen Voice Hotspot Area */}
        <div
          className="hidden lg:block absolute left-[2%] top-[25%] w-[24%] h-[55%] z-20 cursor-pointer"
          title="Citizen Voices: Click to analyze complaints"
          onClick={() => navigateTo('complaint-analysis')}
        />

        {/* Right Laptop Hotspot Area */}
        <div
          className="hidden xl:block absolute right-[4%] bottom-[6%] w-[36%] h-[42%] z-20 pointer-events-auto"
        >
          <div className="relative w-full h-full">
            <button
              onClick={() => navigateTo('complaint-explorer')}
              className="absolute left-[3%] top-[10%] w-[26%] h-[36%] rounded-xl hover:bg-[#15966A]/10 transition-colors cursor-pointer group"
              title="Click to view all complaints in Explorer"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-0 bg-[#073D32] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity">
                Total Grievances (80) →
              </div>
            </button>

            <button
              onClick={() => navigateTo('sentiment-analysis')}
              className="absolute left-[32%] top-[10%] w-[30%] h-[38%] rounded-xl hover:bg-[#E85A24]/10 transition-colors cursor-pointer group"
              title="Click to view Sentiment Analysis"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-0 bg-[#073D32] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity">
                Sentiment Polarity Breakdown →
              </div>
            </button>

            <button
              onClick={() => navigateTo('trend-analysis')}
              className="absolute left-[3%] top-[50%] w-[45%] h-[46%] rounded-xl hover:bg-[#15966A]/10 transition-colors cursor-pointer group"
              title="Click to view Complaint Trends"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-0 bg-[#073D32] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity">
                Temporal Trends & Volume →
              </div>
            </button>

            <button
              onClick={() => navigateTo('model-evaluation')}
              className="absolute left-[52%] top-[50%] w-[46%] h-[46%] rounded-xl hover:bg-[#F2B544]/10 transition-colors cursor-pointer group"
              title="Click to inspect Model Accuracy & Confusion Matrix"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-0 bg-[#073D32] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity">
                Top Complaint Domains & Rankings →
              </div>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-20 pb-3 sm:pb-4 text-center">
          <button
            onClick={() => {
              const el = document.getElementById('civicsense-capabilities');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#182820]/70 hover:text-[#073D32] transition-colors cursor-pointer"
          >
            <span>Scroll for System Highlights</span>
            <span className="text-base animate-bounce">↓</span>
          </button>
        </div>
      </section>

      {/* 
        ========================================================================
        BELOW-HERO SECTION: 8 Public-Service Domains & System Capabilities
        ========================================================================
      */}
      <section id="civicsense-capabilities" className="w-full bg-[#FBF7EF] py-16 px-6 sm:px-10 lg:px-16 border-t border-[#E7E0D3]">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFF2E6] text-[#073D32] text-xs font-bold border border-[#A3E0C0]">
              <Sparkles className="w-3.5 h-3.5 text-[#15966A]" />
              <span>Civic Intelligence Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#182820] font-serif">
              Eight Dedicated Public-Service Domains
            </h2>
            <p className="text-sm text-[#687568] leading-relaxed">
              Every citizen complaint is categorized using Scikit-learn TF-IDF Vectorization and Logistic Regression with calibrated confidence and real-time sentiment polarity scoring.
            </p>
          </div>

          {/* 8 Category Domain Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Roads', count: roadsCount, theme: DOMAIN_THEME['Roads'], desc: 'Potholes, road resurfacing, hazards & traffic signage' },
              { name: 'Water Supply', count: waterCount, theme: DOMAIN_THEME['Water Supply'], desc: 'Low pipeline pressure, contaminated water & meter issues' },
              { name: 'Electricity', count: electricityCount, theme: DOMAIN_THEME['Electricity'], desc: 'Blackouts, transformer sparks, surges & streetlight failures' },
              { name: 'Healthcare', count: healthcareCount, theme: DOMAIN_THEME['Healthcare'], desc: 'Primary health centers, medicines & sanitation standards' },
              { name: 'Education', count: educationCount, theme: DOMAIN_THEME['Education'], desc: 'Civic school infrastructure, teaching staff & facilities' },
              { name: 'Transportation', count: transitCount, theme: DOMAIN_THEME['Transportation'], desc: 'Bus route irregularities, depot delays & metro transit' },
              { name: 'Drainage / Sewage', count: drainageCount, theme: DOMAIN_THEME['Drainage / Sewage'], desc: 'Choked drains, sewage line leaks & road waterlogging' },
              { name: 'Other Services', count: records.filter(r => r.category === 'Other Public Services').length, theme: DOMAIN_THEME['Other Public Services'], desc: 'Parks, municipal licenses, building permits & general services' }
            ].map(cat => (
              <div
                key={cat.name}
                onClick={() => navigateTo('complaint-explorer')}
                className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E7E0D3] shadow-xs hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs"
                    style={{ backgroundColor: cat.theme.bg, color: cat.theme.text }}
                  >
                    {cat.name.slice(0, 2)}
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5EFE6] text-[#182820]">
                    {cat.count} Logged
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#182820] group-hover:text-[#073D32] transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-[#687568] leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Machine Learning Pipeline Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#073D32] to-[#0c4e40] text-[#FFFDF8] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#15966A]">
                Machine Learning Pipeline
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif">
                TF-IDF + Logistic Regression
              </h3>
              <p className="text-xs sm:text-sm text-[#DFF2E6]/90 max-w-xl leading-relaxed">
                Single primary algorithm pipeline generating category confidence across all 8 domains and separately trained sentiment polarity classification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => navigateTo('complaint-analysis')}
                className="bg-[#E85A24] hover:bg-[#d44e1c] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Test Live Classifier
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="bg-[#FFFDF8] hover:bg-white text-[#073D32] font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Open Analytics Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        ABOUT MODAL
        ========================================================================
      */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182820]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E7E0D3] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#687568] hover:text-[#182820] rounded-full hover:bg-[#F5EFE6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#DFF2E6] flex items-center justify-center text-[#073D32]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#182820]">About CivicSense</h3>
                <p className="text-xs text-[#687568]">Government Grievance & Public Sentiment Analysis System</p>
              </div>
            </div>

            <p className="text-sm text-[#182820]/80 leading-relaxed mb-4">
              CivicSense is a public administration intelligence platform designed to ingest unstructured citizen feedback and convert it into prioritized departmental tasks. Built with Python, Scikit-learn, TF-IDF Vectorization, and Logistic Regression.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2.5 text-xs text-[#182820] bg-[#FBF7EF] p-3.5 rounded-xl border border-[#E7E0D3]">
                <CheckCircle2 className="w-4 h-4 text-[#15966A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Eight Discrete Public Domains:</span> Dedicated models recognizing Roads, Water Supply, Electricity, Healthcare, Education, Transportation, Drainage / Sewage, and Other Services.
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#182820] bg-[#FBF7EF] p-3.5 rounded-xl border border-[#E7E0D3]">
                <CheckCircle2 className="w-4 h-4 text-[#15966A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Logistic Regression Backbone:</span> Direct single-algorithm pipeline without fragile dual-model selectors.
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#182820] bg-[#FBF7EF] p-3.5 rounded-xl border border-[#E7E0D3]">
                <CheckCircle2 className="w-4 h-4 text-[#15966A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Multi-Class Sentiment Analysis:</span> Continuously tracks positive, neutral, and distressed citizen sentiment to direct emergency response.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-[#687568] hover:bg-[#F5EFE6] rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  navigateTo('dashboard');
                }}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#073D32] hover:bg-[#0c4e40] rounded-full transition-colors shadow-xs cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        CONTACT MODAL
        ========================================================================
      */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182820]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E7E0D3] relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#687568] hover:text-[#182820] rounded-full hover:bg-[#F5EFE6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FCE7D7] flex items-center justify-center text-[#E85A24]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#182820]">Civic Grievance Liaison</h3>
                <p className="text-xs text-[#687568]">Municipal Redressal & Support Coordination</p>
              </div>
            </div>

            <p className="text-xs text-[#687568] mb-4 leading-relaxed">
              Civic liaison officers and citizens can connect directly with the central dispatch bureau for critical public service issues.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3.5 bg-[#FBF7EF] rounded-2xl border border-[#E7E0D3] text-xs">
                <Phone className="w-4 h-4 text-[#15966A] shrink-0" />
                <div>
                  <div className="font-bold text-[#182820]">Toll-Free Grievance Helpline</div>
                  <div className="text-[#687568]">1800-CIVIC-SENSE (1800-24842-73673)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#FBF7EF] rounded-2xl border border-[#E7E0D3] text-xs">
                <Mail className="w-4 h-4 text-[#15966A] shrink-0" />
                <div>
                  <div className="font-bold text-[#182820]">Official Municipal Redressal Inbox</div>
                  <div className="text-[#687568]">grievances@civicsense.gov.in</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#FBF7EF] rounded-2xl border border-[#E7E0D3] text-xs">
                <MapPin className="w-4 h-4 text-[#15966A] shrink-0" />
                <div>
                  <div className="font-bold text-[#182820]">City Municipal Corporation</div>
                  <div className="text-[#687568]">Department of Public Redressal, Central Civic Secretariat</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#073D32] hover:bg-[#0c4e40] rounded-full transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        LEARN MORE MODAL
        ========================================================================
      */}
      {activeModal === 'learnMore' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182820]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E7E0D3] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#687568] hover:text-[#182820] rounded-full hover:bg-[#F5EFE6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#DFF2E6] flex items-center justify-center text-[#073D32]">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#182820]">Machine Learning Architecture</h3>
                <p className="text-xs text-[#687568]">End-to-End Civic Text Analytics</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-[#182820] leading-relaxed mb-6">
              <div className="p-4 bg-[#FBF7EF] rounded-2xl border border-[#E7E0D3]">
                <div className="font-bold text-[#182820] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#073D32] text-white flex items-center justify-center text-[10px]">1</span>
                  Natural Language Preprocessing & Sanitization
                </div>
                <p className="text-[#687568] pl-7">
                  Lowercasing, punctuation stripping, stopword removal, and regular expression cleansing of raw citizen submissions.
                </p>
              </div>

              <div className="p-4 bg-[#FBF7EF] rounded-2xl border border-[#E7E0D3]">
                <div className="font-bold text-[#182820] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#073D32] text-white flex items-center justify-center text-[10px]">2</span>
                  TF-IDF Feature Extraction
                </div>
                <p className="text-[#687568] pl-7">
                  Extracts unigrams and bigrams with inverse document frequency weighting to capture domain-critical tokens (e.g. "overflowing sewage", "pothole", "voltage fluctuation").
                </p>
              </div>

              <div className="p-4 bg-[#FBF7EF] rounded-2xl border border-[#E7E0D3]">
                <div className="font-bold text-[#182820] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#073D32] text-white flex items-center justify-center text-[10px]">3</span>
                  Logistic Regression Classification (8 Domains)
                </div>
                <p className="text-[#687568] pl-7">
                  Outputs multi-class probabilities for Roads, Water Supply, Electricity, Healthcare, Education, Transportation, Drainage / Sewage, and Other Services.
                </p>
              </div>

              <div className="p-4 bg-[#FBF7EF] rounded-2xl border border-[#E7E0D3]">
                <div className="font-bold text-[#182820] mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#073D32] text-white flex items-center justify-center text-[10px]">4</span>
                  Polarity & Urgency Scoring
                </div>
                <p className="text-[#687568] pl-7">
                  Separately trained sentiment model evaluates Positive, Neutral, and Negative polarity to prioritize emergency interventions.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-[#687568] hover:bg-[#F5EFE6] rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  navigateTo('model-evaluation');
                }}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#073D32] hover:bg-[#0c4e40] rounded-full transition-colors shadow-xs cursor-pointer"
              >
                View Model Validation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
