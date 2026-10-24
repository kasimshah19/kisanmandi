import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  SITE_NAME,
  GITHUB_URL,
  LINKEDIN_URL,
  DEMO_VIDEO_URL,
} from '../../config/site';
import {
  Sparkles,
  ShoppingBag,
  Tractor,
  ShieldCheck,
  CheckCircle2,
  Video,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

function GitHubIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export default function About() {
  useDocumentTitle('About KisanMandi | Architecture & Overview');
  const { t } = useTranslation();

  const creatorUrl = LINKEDIN_URL || GITHUB_URL || null;

  const techBadges = [
    'React 18',
    'Vite',
    'Tailwind CSS v4',
    'Spring Boot 3',
    'Spring Security with JWT',
    'MySQL 8',
    'Cloudinary',
    'data.gov.in API',
    'Docker',
    'GitHub Actions',
  ];

  const engineeringHighlights = [
    'Role-based access control (CUSTOMER, FARMER, ADMIN) enforced at both gateway and API endpoints',
    'Admin verification workflow ensuring only vetted farmers with valid documentation can list produce',
    'Atomic stock inventory management preventing overselling during concurrent order placement',
    'Formal order lifecycle state machine (PLACED → ACCEPTED → PACKED → OUT_FOR_DELIVERY → DELIVERED / CANCELLED)',
    'Automated scheduled Spring cron syncing daily wholesale mandi benchmark prices from data.gov.in',
    'Haversine trigonometric distance calculation for accurate nearby farmer discovery by district and coordinates',
    'Comprehensive multi-language UI (English, Hindi, Marathi) with dynamic text-scaling and Web Speech audio readouts',
    'Automated test suites across unit, integration, and security layers',
  ];

  const customerFeatures = [
    'Browse harvest by category, keyword, district, or nearby kilometer radius',
    'Compare farmer listing prices side by side with official government mandi benchmarks',
    'Cart and order placement with 100% Cash on Delivery (no digital payment required)',
    'Real-time order tracking timeline with live polling and delivery contact details',
    'Community reviews and star ratings on delivered produce',
  ];

  const farmerFeatures = [
    'Free farmer account registration with land verification documentation',
    'Quick crop listing in simple steps with quantity in kg or quintal and photo upload',
    'Live mandi market price reference while creating and editing produce prices',
    'Incoming order management with clear action states (accept, pack, dispatch)',
    'Transparent sales earnings overview and customer feedback tracking',
  ];

  const adminFeatures = [
    'Review pending farmer applications and verify submitted agricultural proof documents',
    'Inspect automated daily Agmarknet synchronization logs and manual sync triggers',
    'Manage agricultural produce categories and global taxonomy',
    'Full oversight over platform users, products, orders, and customer reviews',
  ];

  return (
    <div className="w-full pb-16">
      <PageHeader
        breadcrumbs={[
          { label: t('nav.home', 'Home'), to: '/' },
          { label: t('nav.about', 'About') },
        ]}
        title="About KisanMandi"
        subtitle="A direct farmer-to-customer marketplace and live Mandi rate tracker built for real-world agricultural commerce in Maharashtra."
      />

      <div className="page-container max-w-5xl mt-8 space-y-12">
        {/* Mission & Problem Statement */}
        <section aria-labelledby="mission-heading">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#064e3b] text-white p-8 sm:p-12 overflow-hidden shadow-lg border border-green-800/40">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-xs font-bold text-green-200">
                <Sparkles size={14} className="text-amber-300" />
                <span>The Mission</span>
              </div>
              <h2 id="mission-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Direct trade between farmers and households, guided by transparent market prices.
              </h2>
              <p className="text-sm sm:text-base text-green-100/90 leading-relaxed">
                Smallholder farmers often sell their hard-earned harvests through layered distribution chains with little visibility into prevailing market rates, while urban families pay inflated rates for produce that spent days in transit.
              </p>
              <p className="text-sm sm:text-base text-green-100/90 leading-relaxed">
                KisanMandi provides a clean, accessible platform where growers set their own selling prices with live government mandi benchmark context, and household customers receive farm-fresh produce with 100% Cash on Delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Prominent Creator Banner */}
        <section aria-labelledby="creator-heading">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-green-800">
                Creator & Architecture
              </span>
              <h3 id="creator-heading" className="text-xl sm:text-2xl font-extrabold text-stone-900">
                Designed &amp; Built by{' '}
                {creatorUrl ? (
                  <a
                    href={creatorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:text-amber-800 underline underline-offset-4 decoration-amber-400 transition-colors"
                  >
                    Kasim Shah
                  </a>
                ) : (
                  <span className="text-amber-700">Kasim Shah</span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Full-stack software engineer specializing in resilient web applications, accessible design systems, and robust API architectures.
              </p>
            </div>

            {/* Non-empty links from config/site.js */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 flex-wrap">
              {GITHUB_URL && (
                <Button
                  as="a"
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="md"
                  leftIcon={<GitHubIcon size={16} />}
                >
                  GitHub
                </Button>
              )}
              {LINKEDIN_URL && (
                <Button
                  as="a"
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="md"
                  leftIcon={<LinkedInIcon size={16} />}
                >
                  LinkedIn
                </Button>
              )}
              {DEMO_VIDEO_URL && (
                <Button
                  as="a"
                  href={DEMO_VIDEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="md"
                  leftIcon={<Video size={16} />}
                >
                  Demo Video
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Feature Grid: Customer / Farmer / Admin */}
        <section aria-labelledby="features-heading" className="space-y-6">
          <div className="space-y-1">
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              What You Can Do
            </h2>
            <p className="text-sm text-stone-600">
              Production features available in the platform, strictly verified from source code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Column */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">Customer</h3>
                  <span className="text-xs text-stone-500">Household Buyers</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                {customerFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Farmer Column */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Tractor size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">Farmer</h3>
                  <span className="text-xs text-stone-500">Verified Growers</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                {farmerFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Column */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">Admin</h3>
                  <span className="text-xs text-stone-500">Platform Operations</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                {adminFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Architecture & Stack */}
        <section aria-labelledby="architecture-heading" className="space-y-6">
          <div className="space-y-1">
            <h2 id="architecture-heading" className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              How It Is Built
            </h2>
            <p className="text-sm text-stone-600">
              Technology stack and system architecture powering the frontend client and backend services.
            </p>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-2">
            {techBadges.map((badge) => (
              <span
                key={badge}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 shadow-2xs"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Clean Inline SVG Architecture Diagram */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs overflow-x-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-6">
              System Architecture Flow
            </h3>

            <svg
              viewBox="0 0 760 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full min-w-[640px] h-auto"
              aria-label="KisanMandi Architecture Diagram: Browser talks to Spring Boot API, which interacts with MySQL, Cloudinary, and data.gov.in"
            >
              {/* Browser Node */}
              <rect x="20" y="70" width="160" height="80" rx="16" fill="#f0fdf4" stroke="#15803d" strokeWidth="2" />
              <text x="100" y="105" textAnchor="middle" fill="#14532d" fontSize="14" fontWeight="bold">Browser Client</text>
              <text x="100" y="125" textAnchor="middle" fill="#166534" fontSize="11">React 18 • Vite • Tailwind v4</text>

              {/* Arrow 1: Browser <-> API */}
              <path d="M180 110 H260" stroke="#059669" strokeWidth="2.5" strokeDasharray="4 4" />
              <polygon points="262,110 252,105 252,115" fill="#059669" />
              <text x="220" y="100" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="bold">REST / JWT</text>

              {/* Backend API Node */}
              <rect x="270" y="45" width="200" height="130" rx="18" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" />
              <text x="370" y="80" textAnchor="middle" fill="#064e3b" fontSize="15" fontWeight="bold">Spring Boot 3 API</text>
              <text x="370" y="102" textAnchor="middle" fill="#047857" fontSize="11">Spring Security 6 (RBAC)</text>
              <text x="370" y="122" textAnchor="middle" fill="#047857" fontSize="11">Spring Data JPA • Hibernate</text>
              <text x="370" y="145" textAnchor="middle" fill="#047857" fontSize="11">Scheduled Price Sync Cron</text>

              {/* Top Right: Cloudinary */}
              <path d="M470 85 Q 520 85 540 50" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
              <polygon points="542,48 534,54 542,58" fill="#0284c7" />
              <rect x="550" y="15" width="180" height="60" rx="14" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
              <text x="640" y="42" textAnchor="middle" fill="#075985" fontSize="13" fontWeight="bold">Cloudinary Storage</text>
              <text x="640" y="58" textAnchor="middle" fill="#0369a1" fontSize="10">Image &amp; Document Uploads</text>

              {/* Middle Right: MySQL Database */}
              <path d="M470 110 H540" stroke="#15803d" strokeWidth="2" />
              <polygon points="542,110 534,105 534,115" fill="#15803d" />
              <rect x="550" y="85" width="180" height="60" rx="14" fill="#fefce8" stroke="#ca8a04" strokeWidth="1.5" />
              <text x="640" y="112" textAnchor="middle" fill="#713f12" fontSize="13" fontWeight="bold">MySQL 8 Database</text>
              <text x="640" y="128" textAnchor="middle" fill="#854d0e" fontSize="10">Users • Products • Orders</text>

              {/* Bottom Right: data.gov.in Mandi Sync */}
              <path d="M470 140 Q 520 140 540 175" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
              <polygon points="542,177 534,171 542,167" fill="#d97706" />
              <rect x="550" y="155" width="180" height="60" rx="14" fill="#fffbeb" stroke="#d97706" strokeWidth="1.5" />
              <text x="640" y="182" textAnchor="middle" fill="#78350f" fontSize="13" fontWeight="bold">data.gov.in (OGD)</text>
              <text x="640" y="198" textAnchor="middle" fill="#92400e" fontSize="10">Agmarknet Daily Mandi Sync</text>
            </svg>
          </div>

          {/* Engineering Highlights */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold text-stone-900">
              Engineering Highlights
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-600">
              {engineeringHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span className="leading-snug">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
