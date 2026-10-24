import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
  Leaf,
  Layers,
  Database,
  ShieldCheck,
  TrendingUp,
  Volume2,
  ExternalLink,
  Code2,
  Cpu,
  Play,
  CheckCircle2,
  ArrowRight,
  User,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { GITHUB_URL, DEMO_VIDEO_URL } from '../../config/site';

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

export default function About() {
  useDocumentTitle('About KisanMandi | Architecture, Tech Stack & Recruiter Overview');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTestLogin = (email, password) => {
    navigate('/login', { state: { prefillEmail: email, prefillPassword: password } });
  };

  const techStack = [
    {
      category: 'Frontend Client',
      icon: Code2,
      badge: 'React 18 & Tailwind v4',
      items: [
        'Vite + React JS SPA with role-based protected routing',
        'Tailwind CSS v4 with custom @theme agricultural tokens',
        'Multi-lingual i18n (English, हिन्दी, मराठी) with zero missing keys',
        'Native Web Speech API for voice synthesis and voice search',
        'Responsive mobile-first touch UX (min 48px/56px targets)',
      ],
    },
    {
      category: 'Backend & Security',
      icon: Cpu,
      badge: 'Spring Boot 3 & JWT',
      items: [
        'Spring Boot REST architecture with Java 17',
        'Spring Security 6 stateless authentication with JWT claims',
        'Multi-tenant RBAC: CUSTOMER, FARMER, and ADMIN enforcement',
        'Transactional business logic with custom domain exceptions',
        'Robust global validation and centralized error formatting',
      ],
    },
    {
      category: 'Database & Mandi Sync',
      icon: Database,
      badge: 'MySQL 8 & OGD Sync',
      items: [
        'Relational schema: Users, Products, Categories, Orders, MandiRates',
        'Automated scheduled cron fetching daily prices from data.gov.in',
        'Agmarknet market modal rate aggregation across Maharashtra',
        'Optimized query caching and index optimization',
        'Cloudinary secure image upload pipeline',
      ],
    },
  ];

  const demoAccounts = [
    {
      role: 'Customer',
      icon: ShoppingBag,
      color: 'blue',
      email: 'amit@test.com',
      password: 'password123',
      description: 'Browse fresh harvests, test search and geolocation near-me, add to cart, and place cash-on-delivery orders.',
    },
    {
      role: 'Farmer',
      icon: Leaf,
      color: 'green',
      email: 'ramesh@test.com',
      password: 'password123',
      description: 'View incoming customer orders, manage crop inventory, upload produce photos, and check live mandi rate comparisons.',
    },
    {
      role: 'Admin',
      icon: ShieldCheck,
      color: 'amber',
      email: 'admin@kisanmandi.com',
      password: 'Admin@123',
      description: 'Review and verify pending farmer registrations, inspect daily Agmarknet sync logs, and manage platform categories.',
    },
  ];

  return (
    <div className="w-full pb-16">
      <PageHeader
        breadcrumbs={[
          { label: t('nav.home', 'Home'), to: '/' },
          { label: t('nav.about', 'About') },
        ]}
        title={t('about.page_title', 'About KisanMandi')}
        subtitle={t(
          'about.page_subtitle',
          'A direct Kisan-to-Customer marketplace and live Mandi Rate Tracker designed for rural simplicity and engineering excellence.'
        )}
      />

      <div className="page-container mt-8 space-y-12">
        {/* Project Mission Banner */}
        <section aria-labelledby="mission-heading">
          <div className="relative rounded-3xl bg-gradient-to-br from-green-900 via-green-800 to-green-950 text-white p-8 sm:p-12 overflow-hidden shadow-lg border border-green-700/50">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-700/60 border border-green-500/40 text-xs font-semibold text-green-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                <span>Mission & Social Impact</span>
              </div>
              <h2 id="mission-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Empowering farmers across Maharashtra with direct market access and real-time wholesale price intelligence.
              </h2>
              <p className="text-sm sm:text-base text-green-100/90 leading-relaxed">
                Traditional agricultural supply chains take up to 40-50% in middleman commissions before crops reach urban kitchens.
                KisanMandi bridges this gap: farmers list their produce at fair prices, customers receive farm-fresh harvest with 100% Cash on Delivery,
                and everyone has transparent access to official Agmarknet APMC mandi prices.
              </p>
            </div>
          </div>
        </section>

        {/* Creator & Links Section */}
        <section aria-labelledby="creator-heading">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-green-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
                KS
              </div>
              <div>
                <h3 id="creator-heading" className="text-xl font-bold text-gray-900">
                  Designed & Built by Kasim Shah
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Full-Stack Software Engineer • Production Architecture & Design Systems
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="success">Production Ready</Badge>
                  <Badge variant="neutral">Open Source Monorepo</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {GITHUB_URL && (
                <Button
                  as="a"
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  leftIcon={<GitHubIcon size={18} />}
                  className="flex-1 md:flex-initial"
                >
                  GitHub Repo
                </Button>
              )}
              {DEMO_VIDEO_URL && (
                <Button
                  as="a"
                  href={DEMO_VIDEO_URL}
                  target="_blank"
                  rel="noreferrer"
                  variant="primary"
                  leftIcon={<Play size={18} />}
                  className="flex-1 md:flex-initial"
                >
                  Watch Demo
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Recruiter Quick Test Roles (Try Demo) */}
        <section aria-labelledby="demo-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 id="demo-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
                Try Demo Accounts (Instant Test)
              </h2>
              <p className="text-sm text-gray-600">
                Recruiter quick-start: click any role below to pre-fill credentials and test without creating an account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoAccounts.map((demo) => {
              const Icon = demo.icon;
              return (
                <Card key={demo.role} hover className="flex flex-col justify-between p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 font-bold text-lg text-gray-900">
                        <span className="w-8 h-8 rounded-lg bg-green-100 text-green-800 flex items-center justify-center shrink-0">
                          <Icon size={18} />
                        </span>
                        <span>{demo.role}</span>
                      </div>
                      <Badge variant={demo.color === 'blue' ? 'info' : demo.color === 'amber' ? 'warning' : 'success'}>
                        Test Role
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {demo.description}
                    </p>

                    <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1 font-mono border border-gray-200">
                      <div><span className="text-gray-500 font-sans">Email: </span>{demo.email}</div>
                      <div><span className="text-gray-500 font-sans">Password: </span>{demo.password}</div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      rightIcon={<ArrowRight size={16} />}
                      onClick={() => handleTestLogin(demo.email, demo.password)}
                    >
                      Login as {demo.role}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Tech Stack Breakdown */}
        <section aria-labelledby="tech-heading" className="space-y-4">
          <div className="space-y-1">
            <h2 id="tech-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
              Technical Architecture & Stack
            </h2>
            <p className="text-sm text-gray-600">
              Engineered with clean separation of concerns, high accessibility, and resilient performance on slow 3G networks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {techStack.map((stack) => {
              const Icon = stack.icon;
              return (
                <Card key={stack.category} className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center shrink-0">
                        <Icon size={20} />
                      </span>
                      <h3 className="font-bold text-gray-900 text-base">{stack.category}</h3>
                    </div>
                    <Badge variant="neutral">{stack.badge}</Badge>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600">
                    {stack.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Key Features & Low-Literacy Farmer UX */}
        <section aria-labelledby="features-heading" className="bg-amber-50/60 rounded-3xl p-6 sm:p-10 border border-amber-200/80 space-y-6">
          <div className="space-y-2 max-w-2xl">
            <h2 id="features-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
              Low-Literacy & Farmer-First UX Philosophy
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Designed specifically for low-end Android smartphones, slow network conditions, and rural agricultural communities where complex ecommerce interfaces fail:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-amber-200/60 space-y-2">
              <span className="text-2xl" role="img" aria-hidden="true">🔊</span>
              <h4 className="font-bold text-gray-900 text-sm">Audio Assistance</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                One-tap voice readout reads mandi rates and produce details out loud in Hindi and Marathi.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/60 space-y-2">
              <span className="text-2xl" role="img" aria-hidden="true">🔤</span>
              <h4 className="font-bold text-gray-900 text-sm">A / A+ / A++ Text Scale</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Instant root font-scaling allows elderly farmers to enlarge text across the whole platform without breaking layout.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/60 space-y-2">
              <span className="text-2xl" role="img" aria-hidden="true">🍅</span>
              <h4 className="font-bold text-gray-900 text-sm">Recognize, Don't Read</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Large visual category tiles (Sabzi, Fal, Anaaj, Dudh) with icons + words together on every primary action.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/60 space-y-2">
              <span className="text-2xl" role="img" aria-hidden="true">🤝</span>
              <h4 className="font-bold text-gray-900 text-sm">100% Cash on Delivery</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                No complex digital wallets or OTP stress required: pay in cash only when fresh produce arrives at your doorstep.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
