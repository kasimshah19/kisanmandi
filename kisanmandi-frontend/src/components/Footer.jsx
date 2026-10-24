import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, ArrowUp, Video, Mail, Code2, Heart } from 'lucide-react';
import { SITE_NAME, GITHUB_URL, LINKEDIN_URL, DEMO_VIDEO_URL, CONTACT_EMAIL } from '../config/site';
import { useServerStatus } from '../context/ServerStatusContext';

export default function Footer() {
  const { t } = useTranslation();
  const { isWaking, isOffline } = useServerStatus?.() || { isWaking: false, isOffline: false };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const creatorUrl = LINKEDIN_URL || GITHUB_URL || null;

  return (
    <footer className="bg-gradient-to-b from-[#052e16] to-[#021d0d] text-stone-200 mt-auto border-t border-green-900/60">
      <div className="page-container py-12 md:py-16">
        {/* Top area columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand & Friendly Statement */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-white font-extrabold text-2xl tracking-tight"
            >
              <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-5 h-5" />
              </span>
              <span>{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-green-100/80 leading-relaxed">
              {t(
                'footer.brand_desc',
                'Direct farm-to-kitchen marketplace connecting farmers and households across Maharashtra at fair prices.'
              )}
            </p>

            {/* Optional external links: only shown when non-empty */}
            <div className="flex items-center gap-3 pt-1">
              {GITHUB_URL && (
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Repository"
                  className="w-9 h-9 rounded-xl bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </a>
              )}
              {LINKEDIN_URL && (
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="w-9 h-9 rounded-xl bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
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
                  rel="noopener noreferrer"
                  aria-label="Watch Demo Video"
                  className="w-9 h-9 rounded-xl bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                >
                  <Video size={16} />
                </a>
              )}
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  aria-label="Contact Email"
                  className="w-9 h-9 rounded-xl bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                >
                  <Mail size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Buy */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-300">
              {t('footer.col_buy', 'Buy')}
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to="/products"
                  className="inline-flex items-center text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                >
                  {t('nav.browse', 'Browse produce')}
                </Link>
              </li>
              <li>
                <Link
                  to="/mandi"
                  className="inline-flex items-center text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                >
                  {t('nav.mandi_rates', 'Mandi rates')}
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="inline-flex items-center text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                >
                  {t('nav.help', 'Help')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Sell */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-300">
              {t('footer.col_sell', 'Sell')}
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to="/register?role=FARMER"
                  className="inline-flex items-center text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                >
                  {t('footer.become_seller', 'Become a seller')}
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                >
                  {t('footer.farmer_login', 'Farmer login')}
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="inline-flex items-center text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                >
                  {t('footer.how_to_sell', 'How to sell')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Project & Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-300">
              {t('footer.col_project', 'Project')}
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to="/about"
                  className="inline-flex items-center text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                >
                  {t('footer.about_project', 'About this project')}
                </Link>
              </li>
              {GITHUB_URL && (
                <li>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                  >
                    <span>GitHub Repository</span>
                  </a>
                </li>
              )}
              {DEMO_VIDEO_URL && (
                <li>
                  <a
                    href={DEMO_VIDEO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-green-100/85 hover:text-white transition-colors min-h-[44px] py-2"
                  >
                    <span>Demo Video</span>
                  </a>
                </li>
              )}
            </ul>

            {/* Service Status Dot */}
            <div className="pt-2 text-xs text-green-200/90 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOffline
                    ? 'bg-red-400'
                    : isWaking
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
                aria-hidden="true"
              />
              <span>
                {isOffline
                  ? t('footer.status_offline', 'Offline')
                  : isWaking
                  ? t('footer.status_waking', 'Server is waking up...')
                  : t('footer.status_normal', 'All systems normal')}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: CENTERED ON EVERY SCREEN SIZE */}
        <div className="mt-12 pt-8 border-t border-green-900/60 flex flex-col items-center justify-center text-center relative">
          <div className="space-y-2 max-w-xl mx-auto px-4">
            {/* Line 1 */}
            <p className="text-xs sm:text-sm text-green-200/80">
              &copy; {new Date().getFullYear()} {SITE_NAME}
            </p>

            {/* Line 2: Prominent Creator Credit in EXACT English wording across all languages */}
            <p className="text-sm sm:text-base font-medium text-white flex items-center justify-center gap-1.5 flex-wrap">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" aria-hidden="true" />
              <span>Designed &amp; Built by</span>{' '}
              {creatorUrl ? (
                <a
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4 decoration-amber-400/60 transition-colors"
                >
                  Kasim Shah
                </a>
              ) : (
                <strong className="font-semibold text-amber-300">Kasim Shah</strong>
              )}
            </p>

            {/* Line 3: Mandi Data Source */}
            <p className="text-xs text-green-200/60">
              Mandi data: Agmarknet via data.gov.in (Open Government Data)
            </p>
          </div>

          {/* Back to Top button: Right on desktop, Centered below on mobile */}
          <div className="mt-4 md:mt-0 md:absolute md:right-0 md:top-8">
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-900/60 hover:bg-green-800 text-green-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-green-400 outline-none"
            >
              <span>{t('footer.back_to_top', 'Back to top')}</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
