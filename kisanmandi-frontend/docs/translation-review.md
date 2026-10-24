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

## Technical Integration Details
- **Google Fonts**: `Noto Sans Devanagari` (weights 400, 500, 600, 700) loaded in `index.html` and configured in `index.css`.
- **Dynamic Language Detection**: Browser detects `localStorage.getItem('kisanmandi_lang')` first, falling back to browser navigator language (`en-US`, `mr-IN`, `hi-IN`).
- **Real-Time Language Switcher**: Seamless language toggle component (`LanguageSwitcher.jsx`) accessible across desktop header, mobile navigation drawer, and login/register pages.
- **Automated Key Validation**: CI script `npm run i18n:check` strictly enforces key equality between `en.json`, `hi.json`, and `mr.json`.

