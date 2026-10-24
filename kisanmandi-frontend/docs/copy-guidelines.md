# KisanMandi Plain-Language Copy Guidelines (v2)

These guidelines govern all user-facing copy across KisanMandi for public, customer, and farmer pages. Our users include farmers and rural consumers in Maharashtra with varying literacy levels, operating on mobile devices in outdoor sunlight.

---

## 10 Core Rules for Plain-Language Copy

1. **Everyday Spoken Words Over Technical Jargon**: Use words farmers and shoppers use at local mandis. Never use e-commerce or tech jargon (e.g. "Checkout", "COD", "Modal", "Auth").
2. **One Action, One Sentence**: Keep sentences short (under 12 words where possible). State the single primary action clearly.
3. **Action-Oriented Verbs**: Start button labels with the direct verb ("Buy", "Call", "Place order", "Add produce") rather than abstract terms.
4. **Transparent Units and Weights**: Always clarify unfamiliar or regional units (e.g., write `quintal (100 kg)` rather than bare `quintal`).
5. **Always State "What Happens Next"**: Every order status, form submission, and waiting state must clearly tell the user what to expect next.
6. **Blameless & Constructive Errors**: Never blame the user ("Invalid input") or give dead ends ("404", "Unauthorized"). Always state the problem plainly and provide the immediate fix ("Please enter a 10-digit mobile number").
7. **Natural Multilingual Loanwords**: In Hindi and Marathi, write commonly recognized spoken terms phonetically in Devanagari (e.g. `ऑर्डर`, `पिन कोड`, `लॉगिन`, `मोबाइल`) rather than obscure classical Sanskrit/formal words that confuse rural readers.
8. **Rupee First**: Display currency as `₹` with tabular numbers (`₹45 / kg`), not abbreviations like `INR` or `Rs.`.
9. **Visual Accompaniment**: Pair critical status pills and call-to-action buttons with an emoji or SVG icon to assist non-readers.
10. **Reassurance in Financial States**: When money or delivery is involved, clearly state guarantees (e.g., "Pay cash only when you receive your fresh harvest").

---

## Jargon Replacement Table (Before & After)

| Technical / Jargon (Before) | English Plain (After) | Hindi Spoken (हिन्दी) | Marathi Spoken (मराठी) | Context |
| :--- | :--- | :--- | :--- | :--- |
| **COD / Cash on Delivery** | Pay cash when you receive | सामान मिलने पर नकद दें | माल मिळाल्यावर रोख पैसे द्या | Payment methods & Cart |
| **Checkout** | Place order | ऑर्डर भेजें | ऑर्डर पूर्ण करा | Cart & Navigation |
| **Modal Price** | Most common price | सबसे आम भाव | नेहमीचा भाव | APMC Mandi Rates |
| **Min / Max Price** | Lowest price / Highest price | सबसे कम भाव / सबसे ज़्यादा भाव | कमीत कमी भाव / जास्तीत जास्त भाव | APMC Mandi Rates |
| **Quintal** | quintal (100 kg) | क्विंटल (१०० किलो) | क्विंटल (१०० किलो) | Agricultural Units |
| **Pincode / PIN** | Pin code | पिन कोड | पिन कोड | Address & Location |
| **Approval Pending** | Waiting for admin to check your details | एडमिन द्वारा जांच बाकी है | ॲडमिन तपासणी सुरू आहे | Farmer Registration |
| **Unauthorized / 403** | You cannot open this page | यह पेज खोलने की अनुमति नहीं है | हे पेज उघडता येत नाही | Auth & Access error |
| **Insufficient Stock** | Not enough stock available | पर्याप्त स्टॉक नहीं है | पुरेसा साठा शिल्लक नाही | Product Detail & Cart |
| **Authentication Failed** | Mobile number or password did not match | मोबाइल नंबर या पासवर्ड सही नहीं है | मोबाईल नंबर किंवा पासवर्ड जुळला नाही | Login Form |

---

## Order Status "What Happens Next" Definitions

| Status Key | Status Label (EN / HI / MR) | What Happens Next Line (`status.<key>.next`) |
| :--- | :--- | :--- |
| **PLACED** | Placed / ऑर्डर दर्ज / ऑर्डर नोंदवली | Order sent. Waiting for the farmer to accept / किसान द्वारा ऑर्डर स्वीकारने का इंतज़ार है / शेतकरी ऑर्डर स्वीकारण्याची वाट पाहत आहोत |
| **ACCEPTED** | Accepted / स्वीकृत / स्वीकृत | Farmer accepted your order / किसान ने आपकी ऑर्डर स्वीकार कर ली है / शेतकऱ्याने तुमची ऑर्डर स्वीकारली आहे |
| **PACKED** | Packed / पैक हुआ / पॅक झाले | Your order is being packed / आपकी फसल ताज़ा पैक की जा रही है / शेतमाल ताजेपणी पॅक केला जात आहे |
| **OUT_FOR_DELIVERY** | On the way / डिलीवरी पर / डिलिव्हरीवर | On the way to your address / ऑर्डर आपके पते पर निकल चुकी है / ऑर्डर तुमच्या पत्त्यावर निघाली आहे |
| **DELIVERED** | Delivered / डिलीवर हुआ / डिलिव्हर झाले | Delivered. Please rate the farmer / सामान मिल गया। कृपया किसान को रेटिंग दें / माल मिळाला. कृपया शेतकऱ्याला रेटिंग द्या |
| **REJECTED** | Could not accept / स्वीकार नहीं हुआ / स्वीकारता आले नाही | Farmer could not take this order / किसान यह ऑर्डर नहीं ले पाए / शेतकरी ही ऑर्डर पूर्ण करू शकले नाहीत |
| **CANCELLED** | Cancelled / रद्द हुआ / रद्द झाले | Order cancelled / ऑर्डर रद्द कर दी गई है / ऑर्डर रद्द करण्यात आली आहे |
