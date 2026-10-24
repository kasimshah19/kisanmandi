import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.resolve(__dirname, '../src/locales');

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));
const mr = JSON.parse(fs.readFileSync(path.join(localesDir, 'mr.json'), 'utf8'));

// Updates for English
en.common.unauthorized_title = 'You cannot open this page';
en.common.unauthorized_desc = 'You do not have permission to view this page. Please log in with the correct account.';
en.home.trust_cod = 'Pay cash when you receive';
en.cart.proceed_to_checkout = 'Place order';
en.cart.cod_notice = 'Pay cash when you receive. You pay each farmer directly upon receiving your fresh produce.';
en.checkout.title = 'Place order';
en.checkout.cash_on_delivery = 'Pay cash when you receive';
en.checkout.cod_badge = 'Pay cash when you receive';
en.customer.addresses_desc = 'Manage your home and farm delivery addresses.';
en.addresses.pincode = 'Pin code';
en.addresses.no_addresses_desc = 'Add a delivery address to place orders quickly.';
en.products.filter_by_pincode = 'Pin code';
en.products.location_denied_help = 'Location access was denied. You can still search by district or Pin code.';
en.products.insufficient_stock = 'Not enough stock';
en.errors.insufficient_stock = 'Not enough stock available. Please reduce quantity.';
en.errors.unauthorized = 'You cannot open this page. Please log in again.';
en.mandi.modal_price = 'Most common price';
en.mandi.min_price = 'Lowest price';
en.mandi.max_price = 'Highest price';
en.mandi.per_quintal = 'per quintal (100 kg)';
en.mandi.quintal_unit = 'quintal (100 kg)';
en.units.QUINTAL = 'quintal';
en.farmer.profile_pending_msg = 'Waiting for admin to check your details';

en.status = {
  ...en.status,
  PLACED: 'Placed',
  ACCEPTED: 'Accepted',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REJECTED: 'Could not accept',
  placed: { next: 'Order sent. Waiting for the farmer to accept' },
  accepted: { next: 'Farmer accepted your order' },
  packed: { next: 'Your order is being packed' },
  out_for_delivery: { next: 'On the way to you' },
  delivered: { next: 'Delivered. Please rate the farmer' },
  rejected: { next: 'Farmer could not take this order' },
  cancelled: { next: 'Order cancelled' },
  PLACED_next: 'Order sent. Waiting for the farmer to accept',
  ACCEPTED_next: 'Farmer accepted your order',
  PACKED_next: 'Your order is being packed',
  OUT_FOR_DELIVERY_next: 'On the way to you',
  DELIVERED_next: 'Delivered. Please rate the farmer',
  REJECTED_next: 'Farmer could not take this order',
  CANCELLED_next: 'Order cancelled',
};

// Updates for Hindi
hi.common.unauthorized_title = 'यह पेज खोलने की अनुमति नहीं है';
hi.common.unauthorized_desc = 'आपके पास यह पेज देखने की अनुमति नहीं है। कृपया सही खाते से लॉगिन करें।';
hi.home.trust_cod = 'सामान मिलने पर नकद दें';
hi.cart.proceed_to_checkout = 'ऑर्डर भेजें';
hi.cart.cod_notice = 'सामान मिलने पर नकद दें। ताज़ा फसल मिलने पर आप सीधे किसान को भुगतान करते हैं।';
hi.checkout.title = 'ऑर्डर भेजें';
hi.checkout.cash_on_delivery = 'सामान मिलने पर नकद दें';
hi.checkout.cod_badge = 'सामान मिलने पर नकद दें';
hi.customer.addresses_desc = 'घर और खेत के डिलीवरी पते संभालें।';
hi.addresses.pincode = 'पिन कोड';
hi.addresses.no_addresses_desc = 'जल्दी ऑर्डर भेजने के लिए डिलीवरी का पता जोड़ें।';
hi.products.filter_by_pincode = 'पिन कोड';
hi.products.location_denied_help = 'स्थान की अनुमति नहीं मिली। आप ज़िला या पिन कोड लिखकर भी खोज सकते हैं।';
hi.products.insufficient_stock = 'पर्याप्त स्टॉक नहीं है';
hi.errors.insufficient_stock = 'पर्याप्त स्टॉक उपलब्ध नहीं है। कृपया मात्रा कम करें।';
hi.errors.unauthorized = 'यह पेज खोलने की अनुमति नहीं है। कृपया दोबारा लॉगिन करें।';
hi.mandi.modal_price = 'सबसे आम भाव';
hi.mandi.min_price = 'सबसे कम भाव';
hi.mandi.max_price = 'सबसे ज़्यादा भाव';
hi.mandi.per_quintal = 'प्रति क्विंटल (१०० किलो)';
hi.mandi.quintal_unit = 'क्विंटल (१०० किलो)';
hi.units.QUINTAL = 'क्विंटल';
hi.farmer.profile_pending_msg = 'एडमिन द्वारा जांच बाकी है';

hi.status = {
  ...hi.status,
  PLACED: 'ऑर्डर दर्ज',
  ACCEPTED: 'स्वीकृत',
  PACKED: 'पैक हुआ',
  OUT_FOR_DELIVERY: 'डिलीवरी पर',
  DELIVERED: 'डिलीवर हुआ',
  CANCELLED: 'रद्द हुआ',
  REJECTED: 'स्वीकार नहीं हुआ',
  placed: { next: 'ऑर्डर भेजी गई। किसान द्वारा स्वीकारने का इंतज़ार है' },
  accepted: { next: 'किसान ने आपकी ऑर्डर स्वीकार कर ली है' },
  packed: { next: 'आपकी फसल ताज़ा पैक की जा रही है' },
  out_for_delivery: { next: 'ऑर्डर आपके पते पर निकल चुकी है' },
  delivered: { next: 'सामान मिल गया। कृपया किसान को रेटिंग दें' },
  rejected: { next: 'किसान यह ऑर्डर नहीं ले पाए' },
  cancelled: { next: 'ऑर्डर रद्द कर दी गई है' },
  PLACED_next: 'ऑर्डर भेजी गई। किसान द्वारा स्वीकारने का इंतज़ार है',
  ACCEPTED_next: 'किसान ने आपकी ऑर्डर स्वीकार कर ली है',
  PACKED_next: 'आपकी फसल ताज़ा पैक की जा रही है',
  OUT_FOR_DELIVERY_next: 'ऑर्डर आपके पते पर निकल चुकी है',
  DELIVERED_next: 'सामान मिल गया। कृपया किसान को रेटिंग दें',
  REJECTED_next: 'किसान यह ऑर्डर नहीं ले पाए',
  CANCELLED_next: 'ऑर्डर रद्द कर दी गई है',
};

// Updates for Marathi
mr.common.unauthorized_title = 'हे पेज उघडता येत नाही';
mr.common.unauthorized_desc = 'हे पेज पाहण्याची परवानगी नाही. कृपया योग्य खात्यातून लॉगिन करा.';
mr.home.trust_cod = 'माल मिळाल्यावर रोख पैसे द्या';
mr.cart.proceed_to_checkout = 'ऑर्डर पूर्ण करा';
mr.cart.cod_notice = 'माल मिळाल्यावर रोख पैसे द्या. शेतमाल हातात आल्यावर थेट शेतकऱ्याला पैसे द्या.';
mr.checkout.title = 'ऑर्डर पूर्ण करा';
mr.checkout.cash_on_delivery = 'माल मिळाल्यावर रोख पैसे द्या';
mr.checkout.cod_badge = 'माल मिळाल्यावर रोख पैसे द्या';
mr.customer.addresses_desc = 'घर आणि शेताचे डिलिव्हरी पत्ते व्यवस्थापित करा.';
mr.addresses.pincode = 'पिन कोड';
mr.addresses.no_addresses_desc = 'पटकन ऑर्डर नोंदवण्यासाठी डिलिव्हरी पत्ता जोडा.';
mr.products.filter_by_pincode = 'पिन कोड';
mr.products.location_denied_help = 'स्थान परवानगी नाकारली गेली. तरीही आपण जिल्हा किंवा पिन कोड टाकून शोधू शकता.';
mr.products.insufficient_stock = 'पुरेसा साठा शिल्लक नाही';
mr.errors.insufficient_stock = 'पुरेसा साठा उपलब्ध नाही. कृपया प्रमाण कमी करा.';
mr.errors.unauthorized = 'हे पेज उघडता येत नाही. कृपया पुन्हा लॉगिन करा.';
mr.mandi.modal_price = 'नेहमीचा भाव';
mr.mandi.min_price = 'कमीत कमी भाव';
mr.mandi.max_price = 'जास्तीत जास्त भाव';
mr.mandi.per_quintal = 'प्रति क्विंटल (१०० किलो)';
mr.mandi.quintal_unit = 'क्विंटल (१०० किलो)';
mr.units.QUINTAL = 'क्विंटल';
mr.farmer.profile_pending_msg = 'ॲडमिन तपासणी सुरू आहे';

mr.status = {
  ...mr.status,
  PLACED: 'ऑर्डर नोंदवली',
  ACCEPTED: 'स्वीकृत',
  PACKED: 'पॅक झाले',
  OUT_FOR_DELIVERY: 'डिलिव्हरीवर',
  DELIVERED: 'डिलिव्हर झाले',
  CANCELLED: 'रद्द झाले',
  REJECTED: 'स्वीकारता आले नाही',
  placed: { next: 'ऑर्डर पाठवली. शेतकरी स्वीकारण्याची वाट पाहत आहोत' },
  accepted: { next: 'शेतकऱ्याने तुमची ऑर्डर स्वीकारली आहे' },
  packed: { next: 'तुमची ऑर्डर ताजी पॅक केली जात आहे' },
  out_for_delivery: { next: 'ऑर्डर तुमच्या पत्त्यावर निघाली आहे' },
  delivered: { next: 'माल मिळाला. कृपया शेतकऱ्याला रेटिंग द्या' },
  rejected: { next: 'शेतकरी ही ऑर्डर पूर्ण करू शकले नाहीत' },
  cancelled: { next: 'ऑर्डर रद्द करण्यात आली आहे' },
  PLACED_next: 'ऑर्डर पाठवली. शेतकरी स्वीकारण्याची वाट पाहत आहोत',
  ACCEPTED_next: 'शेतकऱ्याने तुमची ऑर्डर स्वीकारली आहे',
  PACKED_next: 'तुमची ऑर्डर ताजी पॅक केली जात आहे',
  OUT_FOR_DELIVERY_next: 'ऑर्डर तुमच्या पत्त्यावर निघाली आहे',
  DELIVERED_next: 'माल मिळाला. कृपया शेतकऱ्याला रेटिंग द्या',
  REJECTED_next: 'शेतकरी ही ऑर्डर पूर्ण करू शकले नाहीत',
  CANCELLED_next: 'ऑर्डर रद्द करण्यात आली आहे',
};

fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(localesDir, 'hi.json'), JSON.stringify(hi, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(localesDir, 'mr.json'), JSON.stringify(mr, null, 2) + '\n', 'utf8');

console.log('✅ Applied plain-language copy pass to en.json, hi.json, and mr.json successfully.');
