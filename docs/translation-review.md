# KisanMandi UI Translation Review (English / Hindi / Marathi)

This document lists the 40+ most visible user-facing strings across **Navigation**, **Common Actions & Buttons**, **Mandi Dashboard**, **Order Statuses**, **Units**, and **Marketplace & Farmer Portal**.

### Translation Principles Applied
1. **Simple, spoken farmer language** tailored for agricultural communities across Maharashtra.
2. **Natural loanwords kept**: Familiar loanwords used daily in farming and commerce (e.g. "Order", "Cart", "Login", "Mandi", "Quintal", "Kg", "Stock") are preserved in Devanagari script or natural terminology rather than archaic Sanskritized phrases.
3. **Consistent numeral formatting**: Numbers retain Latin digits (`1, 2, 3...`) across dates and prices for clarity, while month and state/district names reflect the selected locale.

---

## 40 Most Visible UI Strings

| # | Translation Key | English (Source of Truth) | Hindi (हिन्दी) | Marathi (मराठी) | Context / Placement |
|---|-----------------|---------------------------|---------------|-----------------|---------------------|
| 1 | `nav.home` | Home | होम | होम | Header navigation |
| 2 | `nav.browse` | Buy Produce | सब्जियां व फसल खरीदें | शेतमाल खरेदी करा | Header navigation |
| 3 | `nav.mandi_rates` | Mandi Rates | मंडी भाव | बाजारभाव | Header navigation |
| 4 | `nav.cart` | Cart | कार्ट | कार्ट | Header navigation |
| 5 | `nav.login` | Login | लॉगिन | लॉगिन | Header & Auth |
| 6 | `nav.register` | Register | रजिस्टर करें | नोंदणी करा | Header & Auth |
| 7 | `nav.my_orders` | My Orders | मेरे ऑर्डर | माझ्या ऑर्डर्स | User dropdown |
| 8 | `nav.dashboard` | Dashboard | डैशबोर्ड | डॅशबोर्ड | User navigation |
| 9 | `nav.my_products` | My Products | मेरी फसलें | माझा शेतमाल | Farmer sidebar |
| 10 | `nav.incoming_orders` | Incoming Orders | नए ग्राहक ऑर्डर | आलेल्या ऑर्डर्स | Farmer sidebar |
| 11 | `products.add_to_cart` | Add to Cart | कार्ट में जोड़ें | कार्टमध्ये जोडा | Product cards / details |
| 12 | `products.in_stock` | In Stock | स्टॉक में उपलब्ध | शिल्लक उपलब्ध | Product availability |
| 13 | `products.out_of_stock` | Out of Stock | स्टॉक समाप्त | संपले आहे | Product availability |
| 14 | `products.near_me` | Near Me | मेरे पास | माझ्या जवळ | Geolocation filter |
| 15 | `products.distance_away` | {{distance}} away | {{distance}} दूर | {{distance}} अंतरावर | Location badge |
| 16 | `cart.title` | Your Shopping Cart | आपका शॉपिंग कार्ट | तुमचे खरेदी कार्ट | Cart page header |
| 17 | `cart.subtotal` | Subtotal | कुल योग | एकूण रक्कम | Order calculation |
| 18 | `checkout.place_order` | Confirm & Place Order | ऑर्डर पक्की करें | ऑर्डर कन्फर्म करा | Checkout button |
| 19 | `checkout.pay_on_delivery` | Pay when your order arrives | सामान मिलने पर भुगतान (COD) | डिलिव्हरी मिळाल्यावर पैसे द्या (COD) | Payment option |
| 20 | `orders.track_order` | Track Order | ऑर्डर ट्रैक करें | ऑर्डर ट्रॅक करा | Orders list action |
| 21 | `orders.timeline_placed` | Order Placed | ऑर्डर दर्ज हुई | ऑर्डर नोंदवली | Order timeline |
| 22 | `orders.timeline_packed` | Harvest Packed | फसल पैक हुई | शेतमाल पॅक झाला | Order timeline |
| 23 | `orders.timeline_out_for_delivery` | Out for Delivery | डिलीवरी के लिए निकली | डिलिव्हरीसाठी निघाली | Order timeline |
| 24 | `orders.timeline_delivered` | Delivered | सफलतापूर्वक डिलीवर | पोहोचवले (डिलिव्हर झाले) | Order timeline |
| 25 | `mandi.title` | Mandi Rates Today | आज का मंडी भाव | आजचे बाजारभाव (मंडी भाव) | Mandi dashboard title |
| 26 | `mandi.subtitle` | Official APMC daily market prices across Maharashtra | महाराष्ट्र की प्रमुख APMC मंडियों के ताज़ा सरकारी भाव | महाराष्ट्रातील प्रमुख APMC बाजार समित्यांचे ताजे सरकारी दर | Mandi subtitle |
| 27 | `mandi.select_commodity` | Select Crop / Commodity | फसल / जिंस चुनें | शेतमाल / पीक निवडा | Mandi filter dropdown |
| 28 | `mandi.modal_price` | Modal Rate | औसत भाव (मोडल) | सर्वसाधारण भाव (मोडल) | Mandi price card |
| 29 | `mandi.min_price` | Min Rate | न्यूनतम भाव | किमान भाव | Mandi price card |
| 30 | `mandi.max_price` | Max Rate | अधिकतम भाव | कमाल भाव | Mandi price card |
| 31 | `mandi.per_quintal` | per Quintal | प्रति क्विंटल | प्रति क्विंटल | Mandi rate unit |
| 32 | `mandi.per_kg` | per Kg | प्रति किलो | प्रति किलो | Mandi rate unit |
| 33 | `mandi.trend_title` | 7-Day Price Trend | पिछले 7 दिनों के भाव | मागील ७ दिवसांचे बाजारभाव | Price chart header |
| 34 | `farmer.dashboard_title` | Farmer Dashboard | किसान डैशबोर्ड | शेतकरी डॅशबोर्ड | Farmer portal title |
| 35 | `farmer.total_earnings` | Total Earnings | कुल कमाई | एकूण कमाई | Farmer stats |
| 36 | `farmer.pending_payouts` | Pending Payouts | बाकी भुगतान | बाकी पेमेंट | Farmer stats |
| 37 | `farmer.add_new_product` | Add New Product | नई फसल जोड़ें | नवीन शेतमाल जोडा | Farmer inventory |
| 38 | `farmer.earnings_analytics` | Earnings & Analytics | कमाई और हिसाब | कमाई आणि हिशोब | Farmer analytics |
| 39 | `status.PLACED` | Placed | ऑर्डर दर्ज | ऑर्डर नोंदवली | Status badge |
| 40 | `status.ACCEPTED` | Accepted | स्वीकृत | स्वीकृत | Status badge |
| 41 | `status.PACKED` | Packed | पैक हुआ | पॅक झाले | Status badge |
| 42 | `status.OUT_FOR_DELIVERY` | Out for Delivery | डिलीवरी पर | डिलिव्हरीवर | Status badge |
| 43 | `status.DELIVERED` | Delivered | डिलीवर हुआ | डिलिव्हर झाले | Status badge |
| 44 | `status.CANCELLED` | Cancelled | रद्द हुआ | रद्द झाले | Status badge |
| 45 | `units.KG` | kg | किलो | किलो | Product unit |
| 46 | `units.QUINTAL` | quintal | क्विंटल | क्विंटल | Product unit |
| 47 | `units.DOZEN` | dozen | दर्जन | डझन | Product unit |
| 48 | `common.save` | Save | सुरक्षित करें | जतन करा (सेव्ह) | Form buttons |
| 49 | `common.cancel` | Cancel | रद्द करें | रद्द करा | Dialog buttons |
| 50 | `common.retry` | Try Again | पुनः प्रयास करें | पुन्हा प्रयत्न करा | Error state button |

---

## Technical Integration Details
- **Google Fonts**: `Noto Sans Devanagari` (weights 400, 500, 600, 700) loaded in `index.html` and configured in `index.css`.
- **Dynamic Language Detection**: Browser detects `localStorage.getItem('kisanmandi_lang')` first, falling back to browser navigator language (`en-US`, `mr-IN`, `hi-IN`).
- **Real-Time Language Switcher**: Seamless language toggle component (`LanguageSwitcher.jsx`) accessible across desktop header, mobile navigation drawer, and login/register pages.
- **Automated Key Validation**: CI script `npm run i18n:check` strictly enforces key equality between `en.json`, `hi.json`, and `mr.json`.
