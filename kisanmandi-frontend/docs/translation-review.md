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

## UI v2 (Part 1 Foundation) New & Simplified Strings

| # | Translation Key | English (Source of Truth) | Hindi (हिन्दी) | Marathi (मराठी) | Context / Placement |
|---|-----------------|---------------------------|---------------|-----------------|---------------------|
| 51 | `common.items` | items | वस्तुएं | वस्तू | Generic item counter |
| 52 | `mandi.modal_price` | Most Common Price (Modal) | सबसे आम भाव (मोडल दर) | सर्वसाधारण भाव (मोडल दर) | Mandi Price Card |
| 53 | `mandi.min_price` | Lowest Price | न्यूनतम (कम से कम) भाव | किमान (कमीत कमी) दर | Mandi Price Card |
| 54 | `mandi.max_price` | Highest Price | अधिकतम (ज्यादा से ज्यादा) भाव | कमाल (जास्तीत जास्त) दर | Mandi Price Card |
| 55 | `mandi.data_source_note` | Prices synced daily from Agmarknet via data.gov.in (Open Government Data). | सरकारी डेटा Agmarknet (data.gov.in) से प्रतिदिन ताज़ा भाव प्राप्त होते हैं। | शासकीय Agmarknet (data.gov.in) द्वारे दररोज ताजे बाजारभाव अपडेट होतात. | Mandi Footer / Disclaimer |
| 56 | `welcome_modal.title` | Choose your language | अपनी भाषा चुनें | तुमची भाषा निवडा | First-visit language modal |
| 57 | `welcome_modal.subtitle` | Direct farm-to-kitchen marketplace for farmers and customers across Maharashtra | महाराष्ट्र के किसानों और ग्राहकों के लिए सबसे सरल मंडी | महाराष्ट्रातील शेतकरी आणि ग्राहकांसाठी थेट सोपी बाजारपेठ | Welcome modal subheader |
| 58 | `welcome_modal.continue_english` | Continue in English → | English में आगे बढ़ें → | English मध्ये पुढे जा → | Welcome modal skip |
| 59 | `text_size.label` | Text Size | अक्षर का आकार (Text Size) | अक्षरांचा आकार | Text size switcher |
| 60 | `text_size.normal` | Normal text size | सामान्य अक्षर आकार | सामान्य आकार | Text size option A |
| 61 | `text_size.large` | Large text size | बड़ा अक्षर आकार | मोठा आकार | Text size option A+ |
| 62 | `text_size.xlarge` | Largest text size | सबसे बड़ा अक्षर आकार | खूप मोठा आकार | Text size option A++ |
| 63 | `speech.listen` | Listen | सुनें | ऐका | Mandi & produce audio readout |
| 64 | `speech.stop` | Stop | रोकें | थांबवा | Active speech stop button |
| 65 | `speech.voice_search` | Search by voice | बोलकर खोजें | बोलून शोधा | Voice search button |
| 66 | `speech.listening` | Listening... speak now | सुन रहे हैं... बोलिए | ऐकत आहोत... आता बोला | Active speech recognition |
| 67 | `speech.mandi_rate_speech` | {{crop}} rate in {{market}}: ₹{{price}} per quintal | {{market}} में {{crop}} का भाव: ₹{{price}} प्रति क्विंटल | {{market}} मध्ये {{crop}} चा दर: ₹{{price}} प्रति क्विंटल | Audio synthesis string |
| 68 | `categories.vegetables` | Vegetables | सब्जियां | भाज्या | Agricultural category tile |
| 69 | `categories.fruits` | Fruits | ताज़ा फल | ताजी फळे | Agricultural category tile |
| 70 | `categories.grains` | Grains & Cereals | अनाज (गेहूं, चावल) | धान्य (गहू, तांदूळ) | Agricultural category tile |
| 71 | `categories.pulses` | Pulses & Dal | दालें और दलहन | डाळी व कडधान्ये | Agricultural category tile |
| 72 | `categories.dairy` | Dairy & Milk | दूध व डेयरी उत्पाद | दूध व दुग्धजन्य पदार्थ | Agricultural category tile |
| 73 | `categories.organic` | Organic & Herbs | जैविक व मसाले | सेंद्रिय व मसाले | Agricultural category tile |

### Part 2 Additions (About, Help, Navigation, Categories, Recruiter Demo)

| # | Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Context / Location |
|---|-----------------|---------------------|--------------------------|----------------------------|--------------------|
| 74 | `nav.help` | Help | सहायता | मदत | Header & Drawer Nav Link |
| 75 | `nav.about` | About | हमारे बारे में | आमच्याबद्दल | Header & Drawer Nav Link |
| 76 | `home.categories_title` | Browse by Crop Category | फसल की श्रेणी अनुसार देखें | शेतमालाच्या प्रकारानुसार निवडा | Home Category Tiles Section |
| 77 | `home.categories_subtitle` | Recognize by picture and tap to explore fresh local harvest | फोटो देखकर पहचानें और सीधे ताज़ा फसल चुनें | चित्र पाहून ओळखा आणि थेट शेतातून ताजी उत्पादने निवडा | Home Category Tiles Subtitle |
| 78 | `auth.demo_credentials_title` | Recruiter Quick Test (Tap to prefill) | परीक्षण के लिए डेमो अकाउंट (टैप करें) | चाचणीसाठी डेमो खाती (टॅप करा) | Login Page Demo Banner |
| 79 | `speech.listen_all` | Listen Rates | भाव सुनें | दर ऐका | Mandi Rates Section Header Audio |
| 80 | `about.page_title` | About KisanMandi | किसानमंडी के बारे में | किसानमंडीबद्दल | About Page Hero Heading |
| 81 | `about.page_subtitle` | A direct Kisan-to-Customer marketplace and live Mandi Rate Tracker designed for rural simplicity and engineering excellence. | सीधा किसान-से-ग्राहक बाज़ार और ताज़ा मंडी भाव ट्रैकर, ग्रामीण सरलता और तकनीकी उत्कृष्टता के लिए निर्मित। | शेतकऱ्यांपासून थेट ग्राहकांपर्यंत पोहोचवणारी बाजारपेठ आणि थेट बाजारभाव ट्रॅकर, ग्रामीण सुलभतेसाठी आणि तांत्रिक गुणवत्तेसाठी तयार केलेली. | About Page Subtitle |
| 82 | `help.page_title` | Help & How-To Guides | सहायता और निर्देश | मदत आणि मार्गदर्शन | Help Page Hero Heading |
| 83 | `help.page_subtitle` | Easy step-by-step guides for farmers and customers. Learn how to order, sell, and check mandi rates. | किसानों और ग्राहकों के लिए आसान चरणबद्ध मार्गदर्शिका। जानें कैसे खरीदें, बेचें और मंडी भाव देखें। | शेतकरी आणि ग्राहकांसाठी सोपी मार्गदर्शिका. खरेदी कशी करावी, शेतमाल कसा विकावा आणि बाजारभाव कसा पहावा ते शिका. | Help Page Subtitle |
| 84 | `help.cust_step_1_title` | 1. Choose Fresh Harvest | 1. ताज़ी फसल चुनें | १. ताजा शेतमाल निवडा | Customer Guide Step 1 |
| 85 | `help.cust_step_1_desc` | Browse by vegetables, fruits, or grains using large visual category tiles. Filter by distance to find farmers nearest to you. | सब्जियां, फल या अनाज के बड़े फोटो टाइल्स से फसल चुनें। अपने पास के किसान खोजने के लिए दूरी फ़िल्टर का उपयोग करें। | भाज्या, फळे किंवा धान्याच्या मोठ्या चित्रांवर टॅप करून माल निवडा. जवळचे शेतकरी शोधण्यासाठी अंतराचे फिल्टर वापरा. | Customer Guide Step 1 Description |
| 86 | `help.cust_step_2_title` | 2. Verify Fair Mandi Rate | 2. सरकारी मंडी भाव देखें | २. सरकारी बाजारभाव तपासा | Customer Guide Step 2 |
| 87 | `help.cust_step_2_desc` | Every product shows transparent pricing benchmarked against daily official Agmarknet wholesale rates. No inflated supermarket markups. | हर फसल का भाव सरकारी Agmarknet के दैनिक थोक भाव से जाँचा जा सकता है। कोई छुपा हुआ बिचौलिया शुल्क नहीं। | प्रत्येक शेतमालाचा भाव सरकारी Agmarknet च्या दैनंदिन घाऊक दराशी तपासता येतो. कोणतीही दलाली किंवा लपवलेला खर्च नाही. | Customer Guide Step 2 Description |
| 88 | `help.cust_step_3_title` | 3. Add to Cart & Enter Address | 3. कार्ट में जोड़ें और पता दर्ज करें | ३. कार्टमध्ये जोडा आणि पत्ता भरा | Customer Guide Step 3 |
| 89 | `help.cust_step_3_desc` | Select how many kilos you need and enter your doorstep delivery location. No complicated digital payment needed. | जितने किलो चाहिए चुनें और डिलीवरी का पता डालें। किसी ऑनलाइन बैंकिंग या कार्ड की ज़रूरत नहीं। | हवे तेवढे किलो निवडा आणि घरचा पत्ता टाका. कोणत्याही ऑनलाइन बँकिंग किंवा कार्डची गरज नाही. | Customer Guide Step 3 Description |
| 90 | `help.cust_step_4_title` | 4. Pay Cash at Doorstep | 4. घर पर नकद भुगतान करें | ४. दारात माल आल्यावर रोख पैसे द्या | Customer Guide Step 4 |
| 91 | `help.cust_step_4_desc` | Receive farm-fresh produce directly from the grower. Inspect the harvest first, then pay in cash (100% Cash on Delivery). | सीधे किसान से ताज़ा सामान प्राप्त करें। गुणवत्ता जांचें और फिर नकद पैसे दें (100% Cash on Delivery)। | शेतकऱ्याकडून थेट शेतातला ताजा माल मिळवा. माल तपासा आणि मग रोख पैसे द्या (१००% Cash on Delivery). | Customer Guide Step 4 Description |
| 92 | `help.farmer_step_1_title` | 1. Register in 1 Minute | 1. 1 मिनट में मुफ़्त पंजीकरण | १. १ मिनिटात मोफत नोंदणी | Farmer Guide Step 1 |
| 93 | `help.farmer_step_1_desc` | Create your free farmer profile using your mobile number and district in Maharashtra. Verified by admin for trustworthiness. | मोबाइल नंबर और महाराष्ट्र के अपने ज़िले के साथ किसान खाता बनाएं। विश्वसनीयता के लिए एडमिन द्वारा सत्यापित। | मोबाईल नंबर आणि महाराष्ट्रातील जिल्ह्यासह शेतकरी खाते तयार करा. सुरक्षिततेसाठी ॲडमिनद्वारे पडताळणी केली जाते. | Farmer Guide Step 1 Description |
| 94 | `help.farmer_step_2_title` | 2. Post Your Crop in 3 Questions | 2. 3 आसान सवालों में फसल पोस्ट करें | २. ३ सोप्या प्रश्नांत शेतमाल विका | Farmer Guide Step 2 |
| 95 | `help.farmer_step_2_desc` | Snap a photo of your vegetables or grain, enter the available quantity (in kg or quintal), and set your desired selling price. | फसल का फोटो खींचें, मात्रा (किलो या क्विंटल) डालें और अपना मनचाहा बेचने का भाव तय करें। | पिकाचा फोटो काढा, उपलब्ध प्रमाण (किलो किंवा क्विंटलमध्ये) टाका आणि आपला विक्री दर ठरवा. | Farmer Guide Step 2 Description |
| 96 | `help.farmer_step_3_title` | 3. Receive Customer Orders | 3. ग्राहकों से सीधे ऑर्डर पाएं | ३. ग्राहकांकडून थेट ऑर्डर्स मिळवा | Farmer Guide Step 3 |
| 97 | `help.farmer_step_3_desc` | Get direct order requests from conscious households and local buyers in your area. Zero middleman cuts or dalal fees. | अपने इलाके के परिवारों से सीधे ऑर्डर प्राप्त करें। बिना किसी दलाल या बिचौलिये के कमीशन के। | आपल्या भागातील स्थानिक कुटुंबांकडून थेट ऑर्डर्स मिळवा. दलालांची कोणतीही फी किंवा कमिशन नाही. | Farmer Guide Step 3 Description |
| 98 | `help.farmer_step_4_title` | 4. Handover & Collect Cash | 4. माल सौंपें और नकद पैसे लें | ४. माल पोहोचवा आणि रोख पैसे मिळवा | Farmer Guide Step 4 |
| 99 | `help.farmer_step_4_desc` | Hand over your produce at the agreed delivery point and collect full 100% cash payment on the spot. | ग्राहक को ताज़ा फसल सौंपें और मौके पर 100% नकद भुगतान प्राप्त करें। | ठरलेल्या ठिकाणी ग्राहकाला माल द्या आणि तिथेच १००% रोख रक्कम मिळवा. | Farmer Guide Step 4 Description |
| 100 | `help.faq_cod_q` | How do payments work? Do I need online banking? | भुगतान कैसे होता है? क्या ऑनलाइन बैंकिंग ज़रूरी है? | पैसे कसे दिले जातात? ऑनलाइन बँकिंग आवश्यक आहे का? | Help FAQ 1 |
| 101 | `help.faq_cod_a` | No online banking or card is needed! KisanMandi operates on 100% Cash on Delivery (COD). You only pay cash after the produce arrives at your doorstep. | बिल्कुल नहीं! किसानमंडी 100% कैश ऑन डिलीवरी (सामान मिलने पर नकद) पर चलती है। सामान घर पहुंचने और जांचने के बाद ही नकद भुगतान करें। | नाही, ऑनलाइन बँकिंग किंवा कार्डची मुळीच गरज नाही! किसानमंडी पूर्णपणे कॅश ऑन डिलिव्हरीवर चालते. माल घरपोच आल्यावरच रोख पैसे द्या. | Help FAQ 1 Answer |
| 102 | `help.faq_voice_q` | How does the "Listen / सुनें" button work? | "सुनें / Listen" बटन कैसे काम करता है? | "ऐका / Listen" बटण कसे चालते? | Help FAQ 2 |
| 103 | `help.faq_voice_a` | On modern phones, tapping the 🔊 "Listen" button reads today's mandi prices or product details out loud in Hindi, Marathi, or English. It helps users who prefer listening over reading. | 🔊 "सुनें" बटन दबाने पर आपका फोन आज के मंडी भाव या फसल का विवरण हिंदी या मराठी में बोलकर सुनाता है। | 🔊 "ऐका" बटण दाबल्यावर तुमचा फोन आजचे बाजारभाव किंवा मालाची माहिती मराठी किंवा हिंदीमध्ये मोठ्याने बोलून दाखवतो. | Help FAQ 2 Answer |
| 104 | `help.faq_size_q` | Can I make the text bigger if I have trouble reading? | क्या मैं अक्षरों को बड़ा कर सकता हूँ? | वाचायला सोपे जावे म्हणून अक्षरे मोठी करता येतात का? | Help FAQ 3 |
| 105 | `help.faq_size_a` | Yes! Tap the "A / A+ / A++" button in the top navigation bar to enlarge the text across the entire application instantly. | हाँ! ऊपर पट्टी में "A / A+ / A++" बटन दबाकर पूरे ऐप के अक्षरों को अपनी सुविधानुसार बड़ा कर सकते हैं। | होय! वरच्या पट्टीतील "A / A+ / A++" बटणावर टॅप करून संपूर्ण ॲपमधील अक्षरे हवी तितकी मोठी करू शकता. | Help FAQ 3 Answer |
| 106 | `help.faq_mandi_q` | Where do the Mandi rates come from? | मंडी भाव कहाँ से आते हैं? | बाजारभाव कुठून येतात? | Help FAQ 4 |
| 107 | `help.faq_mandi_a` | Wholesale mandi rates are synced daily from the official Government Agmarknet portal via data.gov.in (Open Government Data). They reflect real market modal rates across Maharashtra APMCs. | थोक मंडी भाव प्रतिदिन भारत सरकार के आधिकारिक Agmarknet (data.gov.in) पोर्टल से आते हैं। ये महाराष्ट्र की प्रमुख मंडियों के वास्तविक भाव हैं। | घाऊक बाजारभाव दररोज भारत सरकारच्या Agmarknet (data.gov.in) पोर्टलवरून घेतले जातात. हे महाराष्ट्रातील कृषी उत्पन्न बाजार समित्यांचे (APMC) अधिकृत दर आहेत. | Help FAQ 4 Answer |
| 108 | `help.faq_reg_q` | Is registration free for farmers? | क्या किसानों के लिए यह मुफ़्त है? | शेतकऱ्यांसाठी नोंदणी मोफत आहे का? | Help FAQ 5 |
| 109 | `help.faq_reg_a` | Yes, KisanMandi is 100% free for farmers. There are no registration fees, listing fees, or commission deductions on your sales. | हाँ, किसानमंडी किसानों के लिए 100% मुफ़्त है। कोई रजिस्ट्रेशन फीस, लिस्टिंग फीस या बिक्री पर कमीशन नहीं लिया जाता। | होय, किसानमंडी शेतकऱ्यांसाठी १००% मोफत आहे. नोंदणी, माल दाखवणे किंवा विक्रीवर कोणतेही कमिशन आकारले जात नाही. | Help FAQ 5 Answer |

---

## UI v2 Part 1: Plain-Language Copy Pass (Jargon Removal & Order Status Next Steps)

| # | Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Context / Improvement |
|---|-----------------|---------------------|--------------------------|----------------------------|-----------------------|
| 110 | `common.unauthorized_title` | You cannot open this page | यह पेज खोलने की अनुमति नहीं है | हे पेज उघडता येत नाही | Error state: plain wording |
| 111 | `common.unauthorized_desc` | You do not have permission to view this page. Please log in with the correct account. | आपके पास यह पेज देखने की अनुमति नहीं है। कृपया सही खाते से लॉगिन करें। | हे पेज पाहण्याची परवानगी नाही. कृपया योग्य खात्यातून लॉगिन करा. | Error state guidance |
| 112 | `home.trust_cod` | Pay cash when you receive | सामान मिलने पर नकद दें | माल मिळाल्यावर रोख पैसे द्या | Trust badge: replaces "COD" |
| 113 | `cart.proceed_to_checkout` | Place order | ऑर्डर भेजें | ऑर्डर पूर्ण करा | Cart CTA: replaces "Proceed to Checkout" |
| 114 | `cart.cod_notice` | Pay cash when you receive. You pay each farmer directly upon receiving your fresh produce. | सामान मिलने पर नकद दें। ताज़ा फसल मिलने पर आप सीधे किसान को भुगतान करते हैं। | माल मिळाल्यावर रोख पैसे द्या. शेतमाल हातात आल्यावर थेट शेतकऱ्याला पैसे द्या. | Cart reassurance |
| 115 | `checkout.title` | Place order | ऑर्डर भेजें | ऑर्डर पूर्ण करा | Checkout Header: replaces "Order Checkout" |
| 116 | `checkout.cash_on_delivery` | Pay cash when you receive | सामान मिलने पर नकद दें | माल मिळाल्यावर रोख पैसे द्या | Payment choice: replaces "Cash on Delivery (COD)" |
| 117 | `customer.addresses_desc` | Manage your home and farm delivery addresses. | घर और खेत के डिलीवरी पते संभालें। | घर आणि शेताचे डिलिव्हरी पत्ते व्यवस्थापित करा. | Addresses description |
| 118 | `addresses.pincode` | Pin code | पिन कोड | पिन कोड | Input label: replaces "Pincode" |
| 119 | `addresses.no_addresses_desc` | Add a delivery address to place orders quickly. | जल्दी ऑर्डर भेजने के लिए डिलीवरी का पता जोड़ें। | पटकन ऑर्डर नोंदवण्यासाठी डिलिव्हरी पत्ता जोडा. | Empty addresses |
| 120 | `products.filter_by_pincode` | Pin code | पिन कोड | पिन कोड | Filter input: replaces "PIN Code" |
| 121 | `products.location_denied_help` | Location access was denied. You can still search by district or Pin code. | स्थान की अनुमति नहीं मिली। आप ज़िला या पिन कोड लिखकर भी खोज सकते हैं। | स्थान परवानगी नाकारली गेली. तरीही आपण जिल्हा किंवा पिन कोड टाकून शोधू शकता. | Geolocation error fix |
| 122 | `products.insufficient_stock` | Not enough stock | पर्याप्त स्टॉक नहीं है | पुरेसा साठा शिल्लक नाही | Stock warning |
| 123 | `errors.insufficient_stock` | Not enough stock available. Please reduce quantity. | पर्याप्त स्टॉक उपलब्ध नहीं है। कृपया मात्रा कम करें। | पुरेसा साठा उपलब्ध नाही. कृपया प्रमाण कमी करा. | Form validation message |
| 124 | `errors.unauthorized` | You cannot open this page. Please log in again. | यह पेज खोलने की अनुमति नहीं है। कृपया दोबारा लॉगिन करें। | हे पेज उघडता येत नाही. कृपया पुन्हा लॉगिन करा. | Auth expiration message |
| 125 | `mandi.modal_price` | Most common price | सबसे आम भाव | नेहमीचा भाव | APMC Price: replaces "Modal Price" |
| 126 | `mandi.min_price` | Lowest price | सबसे कम भाव | कमीत कमी भाव | APMC Price: replaces "Min Price" |
| 127 | `mandi.max_price` | Highest price | सबसे ज़्यादा भाव | जास्तीत जास्त भाव | APMC Price: replaces "Max Price" |
| 128 | `mandi.per_quintal` | per quintal (100 kg) | प्रति क्विंटल (१०० किलो) | प्रति क्विंटल (१०० किलो) | Unit clarification: explains quintal |
| 129 | `units.QUINTAL` | quintal (100 kg) | क्विंटल (१०० किलो) | क्विंटल (१०० किलो) | Unit badge: explains quintal |
| 130 | `farmer.profile_pending_msg` | Waiting for admin to check your details | एडमिन द्वारा जांच बाकी है | ॲडमिन तपासणी सुरू आहे | Registration status: replaces "Approval pending" |
| 131 | `status.placed.next` | Order sent. Waiting for the farmer to accept | ऑर्डर भेजी गई। किसान द्वारा स्वीकारने का इंतज़ार है | ऑर्डर पाठवली. शेतकरी स्वीकारण्याची वाट पाहत आहोत | Order timeline: What happens next |
| 132 | `status.accepted.next` | Farmer accepted your order | किसान ने आपकी ऑर्डर स्वीकार कर ली है | शेतकऱ्याने तुमची ऑर्डर स्वीकारली आहे | Order timeline: What happens next |
| 133 | `status.packed.next` | Your order is being packed | आपकी फसल ताज़ा पैक की जा रही है | तुमची ऑर्डर ताजी पॅक केली जात आहे | Order timeline: What happens next |
| 134 | `status.out_for_delivery.next` | On the way to you | ऑर्डर आपके पते पर निकल चुकी है | ऑर्डर तुमच्या पत्त्यावर निघाली आहे | Order timeline: What happens next |
| 135 | `status.delivered.next` | Delivered. Please rate the farmer | सामान मिल गया। कृपया किसान को रेटिंग दें | माल मिळाला. कृपया शेतकऱ्याला रेटिंग द्या | Order timeline: What happens next |
| 136 | `status.rejected.next` | Farmer could not take this order | किसान यह ऑर्डर नहीं ले पाए | शेतकरी ही ऑर्डर पूर्ण करू शकले नाहीत | Order timeline: What happens next |
| 137 | `status.cancelled.next` | Order cancelled | ऑर्डर रद्द कर दी गई है | ऑर्डर रद्द करण्यात आली आहे | Order timeline: What happens next |

---

## UI v2 Part 4: Farmer Area, Mandi Simple View, Admin Polish & Final Copy Sweep

### 1. Farmer Layout & Navigation (`DashboardLayout.jsx`)

| Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Placement / UX Improvement |
|-----------------|---------------------|--------------------------|----------------------------|----------------------------|
| `farmer_nav.home` | Home | होम | होम | Bottom Navigation Item 1 |
| `farmer_nav.orders` | Orders | ऑर्डर्स | ऑर्डर्स | Bottom Navigation Item 2 with live pending badge |
| `farmer_nav.products` | Products | फसलें | शेतमाल | Bottom Navigation Item 3 |
| `farmer_nav.mandi` | Mandi Rates | मंडी भाव | बाजारभाव | Bottom Navigation Item 4 |
| `farmer_nav.more` | More | अन्य | अधिक | Bottom Navigation Item 5 (opens mobile drawer) |
| `farmer_nav.drawer_title` | More Options | अन्य विकल्प | अधिक पर्याय | Mobile BottomSheet drawer title |
| `farmer_nav.profile` | Farm Profile | खेत की जानकारी | शेती प्रोफाइल | Mobile drawer & sidebar link |
| `farmer_nav.earnings` | Earnings | कमाई | कमाई व हिशोब | Mobile drawer & sidebar link |
| `farmer_nav.reviews` | Customer Reviews | ग्राहकों की राय | ग्राहकांचे अभिप्राय | Mobile drawer & sidebar link |

### 2. Farmer Dashboard ("Today") (`FarmerDashboard.jsx`)

| Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Placement / UX Improvement |
|-----------------|---------------------|--------------------------|----------------------------|----------------------------|
| `farmer_dash.greeting` | Namaste, {{name}}! | नमस्ते, {{name}} जी! | नमस्ते, {{name}}! | Friendly spoken farmer greeting |
| `farmer_dash.today_summary` | You have {{orders}} new orders and ₹{{earnings}} earned today. | आज आपके {{orders}} नए ऑर्डर हैं और ₹{{earnings}} की कमाई हुई है। | आज तुमच्याकडे {{orders}} नवीन ऑर्डर्स आहेत आणि ₹{{earnings}} कमाई झाली आहे. | Daily summary with `ListenButton` audio readout |
| `farmer_dash.checklist_title` | Get Ready to Sell | फसल बेचने के लिए ये 4 कदम पूरे करें | शेतमाल विकण्यासाठी ही ४ पावले पूर्ण करा | Unapproved farmer onboarding checklist title |
| `farmer_dash.step_details` | 1. Fill your farm details | १. अपने खेत की जानकारी भरें | १. शेताचा सविस्तर पत्ता भरा | Step 1 state (Done / To do) |
| `farmer_dash.step_doc` | 2. Upload your farm paper (7/12) | २. खेत का कागज़ (7/12) अपलोड करें | २. शेतीचा पुरावा (७/१२ किंवा दाखला) जोडा | Step 2 state (Done / To do) |
| `farmer_dash.step_wait` | 3. Wait for admin to check | ३. एडमिन की मंज़ूरी का इंतज़ार करें | ३. ॲडमिन तपासणीची वाट पाहा | Step 3 state (Done / Waiting) |
| `farmer_dash.step_product` | 4. Add your first crop | ४. अपनी पहली फसल जोड़ें | ४. तुमचा पहिला शेतमाल जोडा | Step 4 state (Done / To do) |
| `farmer_dash.rejection_fix` | Your documents need attention. Please fix and send again. | आपके दस्तावेज़ में सुधार की आवश्यकता है। कृपया ठीक करके दोबारा भेजें। | कागदपत्रांमध्ये सुधारणा आवश्यक आहे. कृपया दुरुस्त करून पुन्हा पाठवा. | Plain words rejection banner with 1 big CTA button |
| `farmer_dash.tile_orders` | New Orders | नए ऑर्डर | नवीन ऑर्डर्स | Big 72px tappable tile 1 |
| `farmer_dash.tile_earnings` | Today's Earnings | आज की कमाई | आजची कमाई | Big 72px tappable tile 2 |
| `farmer_dash.tile_products` | My Products | मेरी फसलें | माझा शेतमाल | Big 72px tappable tile 3 |
| `farmer_dash.tile_rates` | Today's Mandi Rates | आज के मंडी भाव | आजचे बाजारभाव | Big 72px tappable tile 4 |
| `farmer_dash.low_stock_alert` | {{name}}: only {{stock}} {{unit}} left | {{name}}: केवल {{stock}} {{unit}} बचा है | {{name}}: फक्त {{stock}} {{unit}} शिल्लक आहे | Plain-language low stock alert card |
| `farmer_dash.add_stock_btn` | Add stock | स्टॉक बढ़ाएं | साठा वाढवा | 1-click CTA on low-stock item |

### 3. Add & Edit Product Wizard (`ProductForm.jsx`)

| Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Placement / UX Improvement |
|-----------------|---------------------|--------------------------|----------------------------|----------------------------|
| `wizard.step_counter` | Step {{current}} of {{total}} | कदम {{current}} / {{total}} | पायरी {{current}} पैकी {{total}} | Stepper indicator above question |
| `wizard.step1_title` | Take a photo of your produce | अपनी ताज़ा फसल का फोटो लें | तुमच्या शेतमालाचा फोटो काढा | Step 1 photo picker with camera/gallery |
| `wizard.step2_title` | What are you selling? | आप क्या बेचना चाहते हैं? | तुम्ही काय विकत आहात? | Step 2 produce name & category choice |
| `wizard.step3_title` | Price and quantity | भाव और उपलब्ध मात्रा तय करें | दर आणि उपलब्ध साठा ठरवा | Step 3 unit chips, PriceInput, NumberStepper |
| `wizard.step4_title` | Check and publish | जांचें और ग्राहकों को दिखाएं | तपासा आणि ग्राहकांसाठी उपलब्ध करा | Step 4 customer preview card & publish |
| `wizard.mandi_hint` | Today's government mandi rate for {{crop}}: ₹{{min}} to ₹{{max}} per quintal (about ₹{{kg}} per kg). Shop prices are usually higher. | {{crop}} का आज का सरकारी मंडी भाव: ₹{{min}} से ₹{{max}} प्रति क्विंटल (लगभग ₹{{kg}} प्रति किलो)। दुकानों में भाव इससे अधिक रहता है। | {{crop}} चा आजचा बाजारभाव: ₹{{min}} ते ₹{{max}} प्रति क्विंटल (साधारण ₹{{kg}} प्रति किलो). दुकानातील दर यापेक्षा जास्त असतात. | Clear green guidance card |
| `wizard.success_title` | Your product is live! | आपकी फसल ग्राहकों को दिखने लगी है! | तुमचा शेतमाल ग्राहकांना दिसू लागला आहे! | Wizard live celebration card |
| `wizard.add_another` | Add another product | दूसरी फसल जोड़ें | आणखी शेतमाल जोडा | Success screen action 1 |
| `wizard.view_products` | See my products | मेरी फसलें देखें | माझा शेतमाल पहा | Success screen action 2 |

### 4. My Products (`MyProducts.jsx`)

| Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Placement / UX Improvement |
|-----------------|---------------------|--------------------------|----------------------------|----------------------------|
| `my_products.status_visible` | Showing to customers | ग्राहकों को दिख रहा है | ग्राहकांना दिसत आहे | Green StatusPill |
| `my_products.status_hidden` | Hidden by you | आपने छिपा रखा है | तुम्ही लपवले आहे | Neutral StatusPill |
| `my_products.status_admin_hidden` | Hidden by admin | एडमिन द्वारा रोका गया | ॲडमिनने थांबवले आहे | Amber StatusPill with reason |
| `my_products.quick_stock_save` | Save | सुरक्षित करें | सेव्ह करा | Inline NumberStepper stock update |
| `my_products.delete_confirm_title` | Delete this product? You cannot undo this. | क्या आप इस फसल को हटाना चाहते हैं? यह वापस नहीं आएगी। | हा शेतमाल कायमचा काढून टाकायचा का? हे पूर्ववत करता येणार नाही. | Plain words delete confirm modal |
| `my_products.delete_yes` | Yes, delete | हां, हटा दें | होय, काढून टाका | Primary destructive action |
| `my_products.delete_no` | No, keep it | नहीं, रहने दें | नाही, राहू द्या | Secondary safe action |

### 5. Incoming Orders (`FarmerOrders.jsx`)

| Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Placement / UX Improvement |
|-----------------|---------------------|--------------------------|----------------------------|----------------------------|
| `farmer_orders.tab_new` | New | नए | नवीन | Sticky filter pill with live count |
| `farmer_orders.tab_progress` | In progress | चालू | चालू | Sticky filter pill with live count |
| `farmer_orders.tab_done` | Done | पूरे हुए | पूर्ण झालेले | Sticky filter pill with live count |
| `farmer_orders.call_customer` | Call customer | ग्राहक को फोन करें | ग्राहकाला कॉल करा | Prominent green `tel:` button |
| `farmer_orders.collect_cash` | Collect cash: ₹{{amount}} | नकद लें: ₹{{amount}} | रोख रक्कम घ्या: ₹{{amount}} | High-contrast cash collection box |
| `farmer_orders.action_accept` | Accept order | ऑर्डर स्वीकारें | ऑर्डर स्वीकारा | Big primary action 1 |
| `farmer_orders.action_decline` | Cannot take it | अभी नहीं ले सकते | सध्या शक्य नाही | Rejection with plain reason modal |
| `farmer_orders.action_pack` | Pack harvest | फसल पैक करें | शेतमाल पॅक करा | Big primary action 2 |
| `farmer_orders.action_dispatch` | Out for delivery | डिलीवरी पर भेजें | डिलिव्हरीसाठी पाठवा | Big primary action 3 |
| `farmer_orders.action_delivered` | Delivered: I got the cash | डिलीवर हुआ: नकद पैसे मिल गए | डिलिव्हर झाले: रोख पैसे मिळाले | Big primary action 4 with confirm dialog |

### 6. Mandi Dashboard: Simple View & Detailed View (`MandiDashboard.jsx`)

| Translation Key | English (`en.json`) | Hindi Spoken (`hi.json`) | Marathi Spoken (`mr.json`) | Placement / UX Improvement |
|-----------------|---------------------|--------------------------|----------------------------|----------------------------|
| `mandi_view.simple` | Simple view | आसान दृश्य | सोपे दृश्य | Segmented toggle option 1 (Default, persisted) |
| `mandi_view.detailed` | Detailed view | विस्तृत दृश्य | सविस्तर दृश्य | Segmented toggle option 2 (Lazy loads Recharts) |
| `mandi_simple.pick_crop` | Pick your crop | अपनी फसल चुनें | तुमचे पीक निवडा | Horizontal commodity chips with `CommodityIcon` |
| `mandi_simple.today_rate` | Today's rate | आज का भाव | आजचा भाव | Big 48px price card heading |
| `mandi_simple.per_quintal_kg` | ₹{{quintal}} per quintal (100 kg) • about ₹{{kg}} per kg | ₹{{quintal}} प्रति क्विंटल (१०० किलो) • लगभग ₹{{kg}} प्रति किलो | ₹{{quintal}} प्रति क्विंटल (१०० किलो) • साधारण ₹{{kg}} प्रति किलो | Dual unit pricing in large type |
| `mandi_simple.price_up` | ₹{{diff}} more than yesterday | कल से ₹{{diff}} अधिक | कालपेक्षा ₹{{diff}} जास्त | Plain trend indicator with green arrow |
| `mandi_simple.price_down` | ₹{{diff}} less than yesterday | कल से ₹{{diff}} कम | कालपेक्षा ₹{{diff}} कमी | Plain trend indicator with red arrow |
| `mandi_simple.lowest_price` | Lowest price | सबसे कम भाव | सर्वात कमी भाव | Small stat card 1 |
| `mandi_simple.highest_price` | Highest price | सबसे ज़्यादा भाव | सर्वात जास्त भाव | Small stat card 2 |
| `mandi_simple.top_markets` | Best markets today | आज सबसे अच्छे भाव वाली मंडियां | आजचे सर्वाधिक दरांचे बाजार | Top 3 market rows |
| `mandi_simple.change_place` | Change place | स्थान बदलें | जागा बदला | Opens District/Market BottomSheet |
| `mandi_simple.more_crops` | Find more crops | अन्य फसलें खोजें | इतर पिके शोधा | Search modal with `VoiceSearchButton` |

### 7. Admin Area & Global Jargon Cleanup

| Old Jargon / Technical String | Plain-Language Replacement | English | Hindi | Marathi | Location |
|--------------------------------|----------------------------|---------|-------|---------|----------|
| `COD` / `Payment: COD` | Pay cash on delivery | Pay cash on delivery | नकद भुगतान (कैश ऑन डिलीवरी) | कॅश ऑन डिलिव्हरी (रोख पैसे) | Checkout, Orders, FAQs |
| `APMC Mandi` | Mandi / Government Mandi | Government Mandi | सरकारी मंडी | शासकीय बाजार समिती | Mandi pages, Home, About |
| `Modal Price` / `Avg Modal` | Average Market Price | Average Market Price | औसत मंडी भाव | सरासरी बाजारभाव | Mandi table & cards |
| `Min` / `Max` | Lowest / Highest | Lowest / Highest | सबसे कम / सबसे ज़्यादा | सर्वात कमी / सर्वात जास्त | Mandi table columns |
| `Delivered GMV` | Delivered Order Sales | Delivered Order Sales | पूरी हुई कुल बिक्री | यशस्वी एकूण विक्री | Admin Dashboard StatCard |
| `Pincode` | Pin code | Pin code | पिन कोड | पिन कोड | Address forms & filters |
| `Unauthorized` | You cannot open this page | You cannot open this page | यह पेज खोलने की अनुमति नहीं है | हे पेज उघडता येत नाही | Auth guard error page |
| `Insufficient stock` | Not enough stock available | Not enough stock available | पर्याप्त स्टॉक उपलब्ध नहीं है | पुरेसा साठा उपलब्ध नाही | Cart warning & toasts |

