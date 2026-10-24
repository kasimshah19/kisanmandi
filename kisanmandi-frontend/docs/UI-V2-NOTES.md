# KisanMandi UI v2 Summary & Reference Guide

This document summarizes the comprehensive **UI v2 overhaul** of KisanMandi across Parts 1 to 4: Design Principles, Component Architecture, Theming & Typography, Accessibility & Assistive Features (Speech, Voice, Text Size), Feature Detection, and String Review.

---

## 1. Design Principles Used

1. **Phone-First Agricultural Usability**:
   - Designed for rural users and smallholder farmers who may have limited literacy or digital exposure.
   - Large touch targets (minimum 48px to 56px, up to 72px for primary role and navigation tiles).
   - Phone-first layouts with fixed sticky bottom navigation on mobile (`pb-[calc(0.5rem+env(safe-area-inset-bottom))]`) and spacious desktop sidebars.

2. **One Question Per Screen (Progressive Disclosure)**:
   - Complex workflows like **Add Product** are split into a clear 4-step wizard:
     1. Photo of produce (camera/gallery with automatic client compression)
     2. Crop name & Category (visual tiles + voice input)
     3. Unit, Price & Stock (preset chips, PriceInput, NumberStepper, live Mandi price guidance)
     4. Preview & Publish (exact customer card preview before going live)
   - State is preserved when navigating backward and forward.

3. **Plain Spoken Language (Zero Jargon)**:
   - Technical, financial, and bureaucratic terminology was systematically replaced across English, Hindi, and Marathi:
     - `COD` / `Payment: COD` → *Pay cash when you receive* / *सामान मिलने पर नकद दें*
     - `APMC Mandi` → *Government Mandi* / *मंडी* / *सरकारी बाजार समिती*
     - `Modal Price` / `Avg Modal` → *Average Market Price* / *औसत मंडी भाव* / *सरासरी बाजारभाव*
     - `Min` / `Max` → *Lowest* / *Highest* / *सबसे कम* / *सबसे ज़्यादा*
     - `Delivered GMV` → *Delivered Order Sales*
     - `Pincode` → *Pin code* / *पिन कोड*
     - `Unauthorized` → *You cannot open this page* / *यह पेज खोलने की अनुमति नहीं है*
     - `Insufficient stock` → *Not enough stock available* / *पर्याप्त स्टॉक नहीं है*

4. **Dual-Unit Price Transparency**:
   - Both wholesale (₹ / quintal = 100 kg) and household retail (₹ / kg) prices are clearly displayed side-by-side so farmers and customers understand market equivalency without mental math.

5. **Clarity Over Complexity (Mandi Simple View)**:
   - Default view for Mandi Rates is **Simple View**: crop selection chips, a prominent today's price card with a spoken readout (`ListenButton`), simple Lowest/Highest cards, top 3 markets, and a zero-dependency SVG trend sparkline.
   - Full charting and multi-column tables are preserved in **Detailed View** with lazy-loaded Recharts.

---

## 2. Components Created & Enhanced Across UI v2

### Core Primitives & Design System (`src/components/ui/`)
- `Button.jsx`: Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`, `subtle`), sizes (`sm`, `md`, `lg`, `xl`), full loading spinner states.
- `Card.jsx`: Surface cards with border tokens and subtle shadows.
- `Badge.jsx` / `StatusPill.jsx`: Accessible status pills for orders, products, and verification states.
- `Input.jsx` / `Select.jsx`: High-contrast form controls with clear focus rings.
- `PriceInput.jsx`: Currency input with integrated Rupee symbol and accessible label binding.
- `NumberStepper.jsx`: Large `+` and `-` buttons for effortless mobile quantity adjustments.
- `CategoryIcon.jsx` / `CommodityIcon.jsx`: Semantic emoji-based fallback icons for crops and categories.
- `Accordion.jsx`: Clean expandable panels for FAQs and disclosure.
- `StatCard.jsx`: Big metric cards with safe numeric formatting (guaranteed never to render `NaN`).

### Accessibility & Multilingual Controls
- `LanguageSwitcher.jsx`: Desktop dropdown and mobile button grid supporting English, हिन्दी, मराठी.
- `LanguageWelcomeModal.jsx`: First-visit welcome modal with 3 large 72px buttons for instant language choice.
- `TextSizeControl.jsx`: Triple-A text scaling selector (`A`, `A+`, `A++`) setting `data-text-size` on root document.
- `ListenButton.jsx`: Spoken audio readout button reading prices, order statuses, or produce descriptions.
- `VoiceSearchButton.jsx`: Voice input microphone button with live recording pulse and speech-to-text transcription.
- `PhotoPicker.jsx`: Mobile camera & file picker with preview and image compression.
- `BottomSheet.jsx`: Native-feeling slide-up drawer for mobile filters, drawers, and order details.
- `ConfirmDialog.jsx`: Plain-words confirmation modal for deletions and cancellations.

### Farmer & Mandi Experiences
- `DashboardLayout.jsx`: Desktop navigation with user card + Mobile 4-item bottom navigation bar with Orders badge + "More" drawer.
- `FarmerDashboard.jsx`: Friendly greeting, computed onboarding checklist (4 steps) with single next action, big tappable stat tiles, low-stock alerts, 30-day earnings chart.
- `ProductForm.jsx`: 4-Step wizard for adding produce + streamlined single-page form for editing produce.
- `MyProducts.jsx`: Big product cards, inline stock updates, status pills, plain-words delete dialog.
- `FarmerOrders.jsx`: Sticky pill tabs with counts, large customer name, direct `Call` button (`tel:`), highlighted cash collection, step-by-step order actions.
- `MandiDashboard.jsx`: Segmented Simple/Detailed toggle with localStorage persistence; Simple View sparklines; Detailed View lazy-loaded Recharts.

---

## 3. How to Change Colors & Fonts

### Colors (Tailwind CSS v4 `@theme` in `src/index.css`)
All colors are defined as CSS tokens in `src/index.css`:
```css
@theme {
  --color-primary-50:  #f0fdf4;
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;  /* KisanMandi Brand Green */
  --color-primary-700: #15803d;
  --color-primary-800: #166534;
  --color-primary-900: #14532d;
  --color-primary-950: #052e16;

  --color-accent-400:  #fbbf24;  /* Harvest Gold / Warm Amber */
  --color-accent-500:  #f59e0b;
  --color-accent-600:  #d97706;
}
```
To adjust brand colors:
1. Update `--color-primary-*` values in `src/index.css`.
2. Update `--color-accent-*` values for highlights and badges.
3. The rest of the interface will automatically inherit the revised theme tokens.

### Typography (`index.html` & `src/index.css`)
- **Display Headings**: `Plus Jakarta Sans` (weights 600, 700, 800)
- **Body & Controls**: `Inter` (weights 400, 500, 600)
- **Devanagari (Hindi & Marathi)**: `Noto Sans Devanagari` (weights 400, 500, 600, 700)
- **Numerals & Metrics**: `font-mono tabular-nums` for rock-solid tabular data alignment.

Fonts are preconnected and loaded from Google Fonts in `index.html`. To change font families:
1. Replace the Google Fonts `<link>` tag in `index.html`.
2. Update `font-family` declarations in `src/index.css` under the `@theme` or root styles.

---

## 4. How Listen, Voice Search, and Text Size Work

### Listen (`ListenButton.jsx` & `src/hooks/useSpeechSynthesis.js`)
- Utilizes the browser's standard `window.speechSynthesis` API.
- Detects the current active app language (`en`, `hi`, `mr`) and matches the best available system voice (`hi-IN`, `mr-IN`, `en-IN`, or `en-US`).
- Strips special markdown or currency symbols (`₹` → "rupees" / "रुपये") for natural phonetic reading.
- Renders an animated sound wave icon while speaking and allows instant cancellation on re-tap or component unmount.
- If speech synthesis is unsupported by the client device/browser, the button gracefully hides itself with zero errors.

### Voice Search (`VoiceSearchButton.jsx`)
- Utilizes the standard `webkitSpeechRecognition` or `SpeechRecognition` API.
- Sets `recognition.lang` to `hi-IN`, `mr-IN`, or `en-IN` matching the user's selected language.
- Shows a glowing microphone pulse during recording.
- Emits the recognized transcript string directly into the parent search input's change handler, automatically triggering existing debounced search queries.
- If speech recognition is unsupported or microphone permission is denied, the button hides cleanly without breaking layout.

### Text Size Scaling (`TextSizeControl.jsx`)
- Modifies the `data-text-size` attribute on the root `<html>` element (`normal`, `large`, `xlarge`).
- Controlled via CSS variables:
  - `normal`: base font size `16px` (scale 1.0)
  - `large`: base font size `18px` (scale 1.125)
  - `xlarge`: base font size `20px` (scale 1.25)
- Persists user selection in `localStorage` under `kisanmandi_text_size` with a safe `try/catch` wrapper.
- All rem-based spacing and typography scale proportionally across every screen.

---

## 5. Feature Detection Matrix

| Feature | Detection Method | Fallback Behavior |
|---------|------------------|-------------------|
| **Text-to-Speech** | `'speechSynthesis' in window` | `ListenButton` is omitted from DOM. |
| **Voice Recognition** | `'webkitSpeechRecognition' in window \|\| 'SpeechRecognition' in window` | `VoiceSearchButton` is omitted from DOM. |
| **Geolocation** | `'geolocation' in navigator` | "Near Me" button opens manual District filter. |
| **Camera / File Upload** | `<input type="file" accept="image/*" capture="environment">` | Standard file browser picker. |
| **Safe Area Insets** | `env(safe-area-inset-bottom)` | Fallback 0.5rem padding. |
| **LocalStorage** | `try { localStorage.setItem(...) } catch (e) {}` | In-memory component state fallback. |
| **Charts** | `React.lazy` + `<Suspense>` | Simple View renders lightweight inline SVG sparkline; Recharts only loaded on Demand. |

---

## 6. String Review & Localization Index

All user-facing strings are 100% localized and validated across **English (`en.json`)**, **Hindi (`hi.json`)**, and **Marathi (`mr.json`)**.

For the exhaustive line-by-line review of all 140+ user-facing strings grouped by page and feature, see:
👉 [docs/translation-review.md](file:///c:/Users/kasim/Downloads/KisanMandi/kisanmandi-frontend/docs/translation-review.md)

Key translation files:
- Source of truth: `src/locales/en.json` (686 keys)
- Hindi spoken translation: `src/locales/hi.json` (686 keys)
- Marathi spoken translation: `src/locales/mr.json` (686 keys)
- Parity validation script: `npm run i18n:check`
