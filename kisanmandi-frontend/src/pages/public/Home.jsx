import React, { useState, useCallback } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Reveal from '../../components/ui/Reveal';
import HeroSection from '../../components/home/HeroSection';
import PriceTicker from '../../components/home/PriceTicker';
import CategoryTilesSection from '../../components/home/CategoryTilesSection';
import MandiRatesSection from '../../components/home/MandiRatesSection';
import HowItWorksSection from '../../components/home/HowItWorksSection';
import FreshArrivalsSection from '../../components/home/FreshArrivalsSection';
import WhyKisanMandiSection from '../../components/home/WhyKisanMandiSection';
import FarmerCtaSection from '../../components/home/FarmerCtaSection';
import FaqSection from '../../components/home/FaqSection';
import FinalCtaSection from '../../components/home/FinalCtaSection';

export default function Home() {
  useDocumentTitle('KisanMandi | Direct Farm-to-Kitchen Marketplace & Live Mandi Rates');

  // Shared state: when fresh arrivals or mandi rates load, pass sample to Hero preview
  const [latestProduct, setLatestProduct] = useState(null);
  const [topMandi, setTopMandi] = useState(null);

  const handleLatestProduct = useCallback((product) => {
    setLatestProduct(product);
  }, []);

  const handleTopMandi = useCallback((mandi) => {
    setTopMandi(mandi);
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero: Text and CTAs render immediately */}
      <HeroSection latestProduct={latestProduct} topMandi={topMandi} />

      {/* 2. Live Mandi Price Ticker Marquee */}
      <PriceTicker />

      {/* 3. Visual Agricultural Category Showcase */}
      <Reveal>
        <CategoryTilesSection />
      </Reveal>

      {/* 3. Today's Mandi Rates Strip (with audio 'Listen / सुनें' button) */}
      <Reveal>
        <MandiRatesSection onRatesLoaded={handleTopMandi} />
      </Reveal>

      {/* 3. How It Works (accessible tabs: buyers / farmers) */}
      <Reveal>
        <HowItWorksSection />
      </Reveal>

      {/* 4. Fresh Arrivals (8 newest products, hides if zero products or API down) */}
      <Reveal>
        <FreshArrivalsSection onLatestProductLoaded={handleLatestProduct} />
      </Reveal>

      {/* 5. Why KisanMandi (6 balanced feature cards) */}
      <Reveal>
        <WhyKisanMandiSection />
      </Reveal>

      {/* 6. Farmer CTA Band (full-width dark green gradient, truthful bullets) */}
      <Reveal>
        <FarmerCtaSection />
      </Reveal>

      {/* 7. FAQ (6 truthful questions in accessible Accordion) */}
      <Reveal>
        <FaqSection />
      </Reveal>

      {/* 8. Final Call to Action */}
      <Reveal>
        <FinalCtaSection />
      </Reveal>
    </div>
  );
}
