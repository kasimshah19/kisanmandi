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

## Part 1 Redesign Strings (Home, Footer, Auth & Navigation)

| # | Translation Key | English (Source of Truth) | Hindi (हिन्दी) | Marathi (मराठी) | Context / Placement |
|---|-----------------|---------------------------|---------------|-----------------|---------------------|
| 1 | `home.hero_badge` | Direct Farm-to-Kitchen Marketplace | खेत से सीधा रसोई तक | थेट शेतातून स्वयंपाकघरापर्यंत | Hero top pill |
| 2 | `home.hero_title` | Fresh from the farm, | खेत से ताज़ा माल, | शेतातला ताजा माल, | Hero H1 line 1 |
| 3 | `home.hero_title_highlight` | fair price for all. | सबको सही दाम। | सर्वांसाठी योग्य भाव. | Hero H1 brand underline |
| 4 | `home.hero_subtitle` | Buy directly from local farmers at transparent rates. No middlemen, fresher produce, better farmer income, plus live mandi rates. | स्थानीय किसानों से सीधे पारदर्शी भाव में खरीदें। बिचौलियों का झंझट नहीं, ताज़ा उपज, बेहतर किसान आमदनी और रोज़ाना मंडी भाव। | स्थानिक शेतकऱ्यांकडून थेट पारदर्शक भावात खरेदी करा. दलालांशिवाय थेट व्यवहार, ताजा शेतमाल, अधिक शेतकरी नफा आणि दररोजचे थेट बाजारभाव. | Hero subtitle |
| 5 | `home.sell_cta_text` | I'm a farmer: sell on KisanMandi → | मैं किसान हूँ: फसल बेचें → | मी शेतकरी आहे: माल विका → | Hero secondary link |
| 6 | `home.trust_verified` | Verified Farmers | सत्यापित किसान | सत्यापित शेतकरी | Hero trust chip |
| 7 | `home.trust_cod` | Cash on Delivery | कैश ऑन डिलीवरी | कॅश ऑन डिलिव्हरी | Hero trust chip |
| 8 | `home.trust_languages` | Hindi & Marathi | हिन्दी और मराठी | मराठी व हिंदी | Hero trust chip |
| 9 | `home.trust_mandi` | Live Mandi Rates | ताज़ा मंडी भाव | थेट बाजारभाव | Hero trust chip |
| 10 | `home.mandi_section_title` | Today's Mandi Rates | आज के मंडी भाव | आजचे बाजारभाव | Mandi section title |
| 11 | `home.mandi_footnote` | Source: Agmarknet via data.gov.in. These are wholesale mandi rates; retail prices can be higher. | स्रोत: data.gov.in के माध्यम से Agmarknet। ये थोक मंडी भाव हैं; खुदरा भाव अलग हो सकते हैं। | स्रोत: data.gov.in द्वारे Agmarknet. हे घाऊक बाजारभाव आहेत; किरकोळ भाव थोडे जास्त असू शकतात. | Mandi rates footnote |
| 12 | `home.cta_band_title` | Selling your harvest? Skip the middleman. | अपनी फसल बेचना चाहते हैं? बिचौलियों को छोड़ें। | शेतमाल विकायचा आहे? मग दलालांशिवाय थेट विका. | Farmer CTA band headline |
| 13 | `home.cta_bullet1` | Set your own produce price per kg or quintal | प्रति किलो या क्विंटल अपनी तय कीमत खुद रखें | किलो किंवा क्विंटलचा भाव स्वतः ठरवा | Farmer CTA bullet 1 |
| 14 | `home.cta_bullet2` | Check today's live mandi rate while you list | फसल जोड़ते समय आज का ताज़ा मंडी भाव देखें | माल नोंदवताना आजचे थेट बाजारभाव तपासा | Farmer CTA bullet 2 |
| 15 | `home.cta_bullet3` | Get paid full amount cash on delivery | डिलीवरी पर पूरा भुगतान नकद पाएं | डिलिव्हरीच्या वेळी पूर्ण रोख रक्कम मिळवा | Farmer CTA bullet 3 |
| 16 | `home.cta_register_btn` | Register as a Farmer | किसान के रूप में जुड़ें | शेतकरी म्हणून नोंदणी करा | Farmer CTA button |
| 17 | `home.faq_title` | Frequently Asked Questions | अक्सर पूछे जाने वाले सवाल | वारंवार विचारले जाणारे प्रश्न | FAQ section heading |
| 18 | `home.final_cta_title` | Ready to eat fresh? | ताज़ा और शुद्ध खाने के लिए तैयार हैं? | ताजा शेतमाल चाखण्यासाठी तयार आहात? | Final CTA heading |
| 19 | `footer.data_source_disclaimer` | Mandi price data is synced daily from Agmarknet via data.gov.in (Open Government Data). Wholesale mandi prices represent market modal rates. | मंडी के भाव data.gov.in के माध्यम से Agmarknet से प्रतिदिन अपडेट किए जाते हैं। ये थोक मॉडल भाव हैं। | बाजारभाव data.gov.in द्वारे Agmarknet वरून दररोज अपडेट केले जातात. हे घाऊक सरासरी दर आहेत. | Footer data transparency |
| 20 | `footer.built_with` | Built with React, Spring Boot and MySQL. | React, Spring Boot और MySQL से निर्मित। | React, Spring Boot आणि MySQL द्वारे निर्मित. | Footer bottom bar |
| 21 | `auth.select_role` | I want to register as: | मैं इसके रूप में रजिस्टर करना चाहता हूँ: | मला नोंदणी करायची आहे: | Register role radio |
| 22 | `auth.password_strength` | Password strength | पासवर्ड की मजबूती | पासवर्डची ताकद | Register password hint |

---

## Part 2 Redesign Strings (Marketplace, Cart, Checkout, Orders & Dashboard)

| # | Translation Key | English (Source of Truth) | Hindi (हिन्दी) | Marathi (मराठी) | Context / Placement |
|---|-----------------|---------------------------|---------------|-----------------|---------------------|
| 1 | `products.low_stock_hint` | Only {{count}} {{unit}} left | सिर्फ {{count}} {{unit}} बचा है | फक्त {{count}} {{unit}} शिल्लक | ProductCard & Detail |
| 2 | `products.new_rating` | New | नया | नवीन | ProductCard & Detail |
| 3 | `products.filter_sheet_title` | Filters | फ़िल्टर | फिल्टर | Browse mobile sheet & desktop sidebar |
| 4 | `products.apply_filters` | Apply Filters | फ़िल्टर लागू करें | फिल्टर लावा | Mobile filter sheet footer |
| 5 | `products.results_summary` | Showing {{shown}} of {{total}} products | कुल {{total}} में से {{shown}} उत्पाद दिखा रहे हैं | एकूण {{total}} पैकी {{shown}} माल दिसत आहे | Browse products summary bar |
| 6 | `products.near_me_title` | Near Me | मेरे नज़दीक | माझ्या जवळ | Near me card heading |
| 7 | `products.near_me_desc` | Get fresh produce from nearby farms | अपने आसपास के खेतों से ताज़ी उपज पाएं | तुमच्या परिसरातील शेतांतून ताजी फळे आणि भाज्या मिळवा | Near me card description |
| 8 | `products.nearby_farmers_heading` | Nearby Local Farmers | नज़दीकी स्थानीय किसान | जवळचे स्थानिक शेतकरी | Browse nearby farmers snap row |
| 9 | `products.location_permission_asking` | Requesting location permission... | लोकेशन की अनुमति मांगी जा रही है... | स्थानाची परवानगी मागितली जात आहे... | Geolocation detection state |
| 10 | `products.location_denied_help` | Location access denied. You can still search by district or pincode. | लोकेशन की अनुमति नहीं मिली। आप ज़िला या पिन कोड डालकर भी खोज सकते हैं। | स्थानाची परवानगी मिळाली नाही. आपण जिल्हा किंवा पिनकोड टाकूनही शोधू शकता. | Geolocation denied help |
| 11 | `products.view_farm_reviews` | View Farm & Reviews | खेत और समीक्षाएं देखें | शेत आणि प्रतिक्रिया पहा | Product detail farmer link |
| 12 | `products.about_farmer` | About the Farmer | किसान के बारे में | शेतकऱ्याबद्दल माहिती | Product detail lower section |
| 13 | `products.reviews_and_ratings` | Reviews & Ratings | समीक्षाएं और रेटिंग | अभिप्राय आणि रेटिंग | Product detail review section |
| 14 | `cart.produce_from_farm` | Produce from {{farm}} | {{farm}} की उपज | {{farm}} ची उत्पादने | Cart farmer group header |
| 15 | `cart.village_prefix` | Village: {{village}} | गाँव: {{village}} | गाव: {{village}} | Cart & Detail village tag |
| 16 | `cart.cod_notice` | Cash on delivery only. Pay cash directly to the farmer upon delivery. | सिर्फ कैश ऑन डिलीवरी। सामान मिलने पर सीधे किसान को नकद भुगतान करें। | केवळ कॅश ऑन डिलिव्हरी. माल मिळाल्यावर थेट शेतकऱ्याला रोख रक्कम द्या. | Cart & Checkout summary note |
| 17 | `cart.separate_orders_notice` | Items from different farmers will arrive in separate deliveries. | अलग-अलग किसानों का सामान अलग-अलग डिलीवरी में आएगा। | वेगवेगळ्या शेतकऱ्यांचा माल स्वतंत्र डिलिव्हरीमध्ये येईल. | Cart & Checkout separate shipment note |
| 18 | `checkout.step_address` | Address | पता | पत्ता | Checkout 3-step indicator 1 |
| 19 | `checkout.step_payment` | Payment | भुगतान | पेमेंट | Checkout 3-step indicator 2 |
| 20 | `checkout.step_review` | Review | जाँचें | पडताळणी | Checkout 3-step indicator 3 |
| 21 | `checkout.cod_badge` | Cash on Delivery | कैश ऑन डिलीवरी | कॅश ऑन डिलिव्हरी | Checkout payment badge |
| 22 | `checkout.cod_explanation` | Pay cash after inspecting your fresh produce upon delivery. | उपज मिलने और जांचने के बाद नकद भुगतान करें। | शेतमाल मिळाल्यावर आणि तपासल्यानंतर रोख रक्कम द्या. | Checkout payment explanation |
| 23 | `orders.order_id_km` | KM-{{id}} | KM-{{id}} | KM-{{id}} | MyOrders & Detail order ID format |
| 24 | `orders.filter_by_status` | Filter by status | स्थिति अनुसार देखें | स्थितीनुसार पहा | MyOrders status tabs |
| 25 | `customer.recent_orders_title` | Recent Orders | हाल के ऑर्डर | अलीकडील ऑर्डर्स | Dashboard recent orders heading |
| 26 | `customer.no_recent_orders` | No orders placed yet. | अभी तक कोई ऑर्डर नहीं दिया गया है। | अद्याप कोणतीही ऑर्डर दिलेली नाही. | Dashboard empty orders note |
| 27 | `customer.pending_reviews_title` | Pending Reviews | लंबित समीक्षाएं | प्रलंबित अभिप्राय | Dashboard reviews heading |
| 28 | `customer.no_pending_reviews` | No pending reviews. Thank you for rating local farmers! | कोई लंबित समीक्षा नहीं है। किसानों को रेटिंग देने के लिए धन्यवाद! | कोणताही प्रलंबित अभिप्राय नाही. शेतकऱ्यांना रेटिंग दिल्याबद्दल धन्यवाद! | Dashboard empty reviews note |
| 29 | `customer.cart_tile_title` | Shopping Cart | मेरी टोकरी | माझी टोपली | Dashboard quick action tile |
| 30 | `customer.cart_tile_desc` | {{count}} fresh produce items | {{count}} ताज़ी चीज़ें टोकरी में हैं | {{count}} ताज्या वस्तू टोपलीत आहेत | Dashboard cart tile subtitle |

---

## Part 3 Redesign Strings (Farmer Studio, Mandi Analytics & Operations)

| # | Translation Key | English (Source of Truth) | Hindi (हिन्दी) | Marathi (मराठी) | Context / Placement |
|---|-----------------|---------------------------|---------------|-----------------|---------------------|
| 1 | `farmer.dashboard_title` | Farmer Dashboard | किसान डैशबोर्ड | शेतकरी डॅशबोर्ड | Farmer PageHeader |
| 2 | `farmer.dashboard_subtitle` | Manage your crops, track incoming orders, and review earnings | अपनी फसलें प्रबंधित करें, ऑर्डर ट्रैक करें और कमाई देखें | आपल्या पिकांचे नियोजन करा, ऑर्डर्स तपासा आणि उत्पन्न पहा | Farmer subtitle |
| 3 | `farmer.total_sales` | Total Orders | कुल ऑर्डर | एकूण ऑर्डर्स | Farmer StatCard |
| 4 | `farmer.total_earnings` | Total Earnings | कुल कमाई | एकूण कमाई | Farmer StatCard |
| 5 | `farmer.active_products` | Listed Produce | सूचीबद्ध फसलें | नोंदवलेला शेतमाल | Farmer StatCard |
| 6 | `farmer.pending_orders` | Pending Orders | लंबित ऑर्डर | प्रलंबित ऑर्डर्स | Farmer StatCard |
| 7 | `farmer.manage_products` | Manage Products | फसल प्रबंधन | शेतमाल व्यवस्थापन | Sidebar & Header |
| 8 | `farmer.add_new_product` | Add New Product | नई फसल जोड़ें | नवीन शेतमाल जोडा | Button & Sidebar |
| 9 | `farmer.my_profile` | Farmer Profile | किसान प्रोफ़ाइल | शेतकरी प्रोफाइल | Sidebar & Header |
| 10 | `farmer.sales_trend` | Sales Trend | बिक्री का रुझान | विक्रीचा कल | 30-day chart title |
| 11 | `farmer.monthly_sales` | Monthly Sales | मासिक बिक्री | मासिक विक्री | Earnings chart title |
| 12 | `farmer.profile_approved_msg` | Your profile is approved | आपकी प्रोफ़ाइल स्वीकृत है | आपली प्रोफाइल मंजूर आहे | Status card |
| 13 | `farmer.profile_pending_msg` | Waiting for admin approval | व्यवस्थापक अनुमोदन की प्रतीक्षा है | ॲडमिन मंजुरीची प्रतीक्षा आहे | Status card |
| 14 | `farmer.profile_not_submitted_msg` | Complete your profile to start selling | फसलें बेचने के लिए अपनी प्रोफ़ाइल पूरी करें | विक्री सुरू करण्यासाठी आपली प्रोफाइल पूर्ण करा | Status card |
| 15 | `farmer.profile_rejected_msg` | Your profile was rejected. Please fix issues and resubmit. | आपकी प्रोफ़ाइल अस्वीकृत कर दी गई थी। कृपया सुधार कर पुनः जमा करें। | आपली प्रोफाइल नाकारण्यात आली. कृपया त्रुटी दूर करून पुन्हा सादर करा. | Status card |
| 16 | `farmer.use_current_location` | Use my current location | मेरा वर्तमान स्थान उपयोग करें | माझे सध्याचे स्थान वापरा | Profile GPS button |
| 17 | `farmer.farm_document` | Farm Document * | खेत दस्तावेज * | शेतजमीन कागदपत्र * | Profile upload section |
| 18 | `farmer.farm_doc_hint` | Upload a photo of your 7/12 utara or any farm proof. Please do not upload Aadhaar. | अपने 7/12 उतारा या किसी भी कृषि प्रमाण की फोटो अपलोड करें। कृपया आधार कार्ड अपलोड न करें। | आपल्या ७/१२ उतारा किंवा शेतजमिनीच्या दाखल्याचा फोटो अपलोड करा. कृपया आधार कार्ड अपलोड करू नका. | Profile upload hint |
| 19 | `mandi.title` | Mandi Rates Today | आज का मंडी भाव | आजचे बाजारभाव (मंडी भाव) | Mandi PageHeader |
| 20 | `mandi.subtitle` | Official APMC daily market prices across Maharashtra | महाराष्ट्र की प्रमुख APMC मंडियों के ताज़ा सरकारी भाव | महाराष्ट्रातील प्रमुख APMC बाजार समित्यांचे ताजे सरकारी दर | Mandi subtitle |
| 21 | `mandi.data_as_of` | Data as of {{date}} | {{date}} तक का डेटा | {{date}} पर्यंतचा डेटा | Mandi PageHeader badge |
| 22 | `mandi.source_credit` | Source: Agmarknet via data.gov.in | स्रोत: data.gov.in के माध्यम से Agmarknet | स्रोत: data.gov.in द्वारे Agmarknet | Mandi footnote |
| 23 | `mandi.price_trend_for` | Price Trend: {{commodity}} | भाव रुझान: {{commodity}} | बाजारभाव कल: {{commodity}} | Trend chart title |
| 24 | `mandi.top_markets_for` | Top Markets: {{commodity}} | प्रमुख मंडियां: {{commodity}} | प्रमुख बाजार समित्या: {{commodity}} | Compare chart title |
| 25 | `mandi.toggle_quintal` | ₹/Quintal | ₹/क्विंटल | ₹/क्विंटल | Unit segmented switch |
| 26 | `mandi.toggle_kg` | ₹/Kg | ₹/किलो | ₹/किलो | Unit segmented switch |
| 27 | `status.APPROVED` | Approved | स्वीकृत | मंजूर | Status badge |
| 28 | `status.REJECTED` | Rejected | अस्वीकृत | नाकारले | Status badge |
| 29 | `status.PENDING` | Pending | लंबित | प्रलंबित | Status badge |
| 30 | `status.NOT_SUBMITTED` | Not Submitted | जमा नहीं हुआ | सबमिट केलेले नाही | Status badge |

---

## Technical Integration Details
- **Google Fonts**: `Noto Sans Devanagari` (weights 400, 500, 600, 700) loaded in `index.html` and configured in `index.css`.
- **Devanagari Leading**: All translated blocks use `leading-normal` or `leading-relaxed` to prevent any vowel/matra clipping.
- **Dynamic Language Detection**: Browser detects `localStorage.getItem('kisanmandi_lang')` first, falling back to browser navigator language (`en-US`, `mr-IN`, `hi-IN`).
- **Real-Time Language Switcher**: Seamless language toggle component (`LanguageSwitcher.jsx`) accessible across desktop header, mobile navigation drawer, and login/register pages.
- **Automated Key Validation**: CI script `npm run i18n:check` strictly enforces key equality between `en.json`, `hi.json`, and `mr.json`.

