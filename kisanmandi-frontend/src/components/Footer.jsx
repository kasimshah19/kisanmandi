import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, ArrowUp, Video, Mail } from 'lucide-react';
import { SITE_NAME, GITHUB_URL, LINKEDIN_URL, DEMO_VIDEO_URL, CONTACT_EMAIL } from '../config/site';
import { useServerStatus } from '../context/ServerStatusContext';

export default function Footer() {
  const { t } = useTranslation();
  const { isWaking, isOffline } = useServerStatus();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#052e16] text-gray-200 mt-auto border-t border-green-900/60">
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-white font-extrabold text-2xl tracking-tight">
              <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-5 h-5" />
              </span>
              <span>{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-green-100/75 leading-relaxed">
              {t('footer.brand_desc')}
            </p>
            {/* Optional external social links if set in site.js */}
            <div className="flex items-center gap-3 pt-2">
              {GITHUB_URL && (
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub Repository"
                  className="w-8 h-8 rounded-lg bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              )}
              {LINKEDIN_URL && (
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn Profile"
                  className="w-8 h-8 rounded-lg bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
              {DEMO_VIDEO_URL && (
                <a
                  href={DEMO_VIDEO_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Watch Demo Video"
                  className="w-8 h-8 rounded-lg bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Video size={16} />
                </a>
              )}
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  aria-label="Contact Email"
                  className="w-8 h-8 rounded-lg bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Mail size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-300">
              {t('footer.col_marketplace', 'Marketplace')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-green-100/80 hover:text-white transition-colors">
                  {t('nav.browse', 'Buy Produce')}
                </Link>
              </li>
              <li>
                <Link to="/mandi" className="text-green-100/80 hover:text-white transition-colors">
                  {t('nav.mandi_rates', 'Mandi Rates')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-green-100/80 hover:text-white transition-colors">
                  {t('footer.nearby_farmers', 'Nearby Farmers')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-green-100/80 hover:text-white transition-colors">
                  {t('footer.create_buyer_acc', 'Create Buyer Account')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-300">
              {t('footer.col_farmers', 'For Farmers')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register?role=FARMER" className="text-green-100/80 hover:text-white transition-colors">
                  {t('footer.sell_on_kisanmandi', 'Sell on KisanMandi')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-green-100/80 hover:text-white transition-colors">
                  {t('footer.farmer_login', 'Farmer Sign In')}
                </Link>
              </li>
              <li>
                <Link to="/mandi" className="text-green-100/80 hover:text-white transition-colors">
                  {t('footer.mandi_benchmarks', 'Check Mandi Benchmarks')}
                </Link>
              </li>
            </ul>
          </div>

          {/* About / Data note */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-300">
              {t('footer.col_transparency', 'Transparency')}
            </h3>
            <p className="text-xs text-green-100/75 leading-relaxed">
              {t('footer.data_source_disclaimer', 'Mandi price data is synced daily from Agmarknet via data.gov.in (Open Government Data). Wholesale mandi prices represent market modal rates.')}
            </p>
            <div className="pt-2 text-xs text-green-200/90 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-400' : (isWaking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')}`} />
              <span>
                {isOffline
                  ? t('footer.status_offline', 'Offline')
                  : isWaking
                  ? t('footer.status_waking', 'Server is waking up...')
                  : t('footer.status_normal', 'All systems operational')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-green-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-green-200/70">
          <div>
            &copy; {new Date().getFullYear()} {SITE_NAME}. {t('footer.built_with', 'Built with React, Spring Boot and MySQL.')}
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-900/50 hover:bg-green-800 text-green-200 hover:text-white transition-colors min-h-[36px]"
          >
            <span>{t('footer.back_to_top', 'Back to top')}</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
