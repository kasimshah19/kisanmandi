import React from 'react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../ui/SectionHeader';
import Accordion from '../ui/Accordion';

export default function FaqSection() {
  const { t } = useTranslation();

  const faqItems = [
    {
      id: 'faq-1',
      title: t('home.faq_q1'),
      content: t('home.faq_a1'),
    },
    {
      id: 'faq-2',
      title: t('home.faq_q2'),
      content: t('home.faq_a2'),
    },
    {
      id: 'faq-3',
      title: t('home.faq_q3'),
      content: t('home.faq_a3'),
    },
    {
      id: 'faq-4',
      title: t('home.faq_q4'),
      content: t('home.faq_a4'),
    },
    {
      id: 'faq-5',
      title: t('home.faq_q5'),
      content: t('home.faq_a5'),
    },
    {
      id: 'faq-6',
      title: t('home.faq_q6'),
      content: t('home.faq_a6'),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-neutral-200/60">
      <div className="page-container max-w-4xl">
        <SectionHeader
          eyebrow={t('home.faq_eyebrow')}
          title={t('home.faq_title')}
          subtitle={t('home.faq_subtitle')}
          align="center"
        />

        <Accordion items={faqItems} defaultOpenId="faq-1" />
      </div>
    </section>
  );
}
