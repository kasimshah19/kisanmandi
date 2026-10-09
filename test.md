# KisanMandi Phase 3 - Testing Checklist

This document contains the step-by-step instructions to test the Phase 3 frontend implementation of KisanMandi.

## 1. Bina login ke browse + filters, refresh
- **Steps:** 
  1. Open an incognito window or log out.
  2. Go to `http://localhost:5173/products`.
  3. Apply a District (e.g., Lucknow) and Pincode (e.g., 425408) filter, and change the Sort option.
  4. Notice the URL updates (e.g., `?district=lucknow&pincode=425408&sort=priceAsc`).
  5. Refresh the page.
- **Expected:** The filter panel stays open (or keeps the values), and the URL filters remain applied. Empty state "No products found" shows if no products match.
- **Status:** ✅ Passed (Fixed panel toggle state on load).

## 2. Logged out "Add to Cart"
- **Steps:**
  1. While logged out, click on a product to open its Detail page.
  2. Click "Add to Cart".
  3. You are redirected to `/login`.
  4. Log in using a Customer account.
- **Expected:** After login, you are redirected *back* to the exact same product detail page, not the dashboard.
- **Status:** ✅ Passed (Fixed `Login.jsx` to respect `location.state.from`).

## 3. 2 farmers ke products, checkout (Multi-Farmer Order)
- **Preparation (Creating 2nd Farmer):**
  1. Log out of your customer account.
  2. Go to Register. Create a new user (e.g., Raju Kisan, `raju@example.com`, role: **FARMER**).
  3. Complete the farmer profile (Farm Name, Village, District).
  4. Go to Farmer Dashboard -> Products -> "Add Product".
  5. Add a product (e.g., "Fresh Tomatoes").
  6. Log out.
- **Test Steps:**
  1. Log back in with your **Customer** account.
  2. Go to "Browse Products". You should now see products from at least 2 different farmers (e.g., Sohel's Wheat and Raju's Tomatoes).
  3. Add both products to your Cart.
  4. Go to Cart -> "Proceed to Checkout".
  5. Select/Add a delivery address and click "Place Order" (Cash on Delivery).
- **Expected:** The system redirects you to "My Orders". You should see **2 separate orders** generated (one for each farmer). Your cart should now be empty (0 items).
- **Status:** ✅ Passed (Order correctly split into KM-00003 and KM-00004).

## 4. Stock se zyada quantity
- **Steps:**
  1. Find a product with limited stock (e.g., 5 kg).
  2. Try to manually type `10` in the quantity input, or press `+` past the limit.
  3. Click "Add to Cart".
- **Expected:** A red error toast appears (e.g., "Not enough stock"). The item quantity in the cart does not change.
- **Status:** ✅ Passed (Frontend input validation prevents exceeding stock limit)

## 5. Farmer status badlaye, customer refresh kare
- **Steps:**
  1. Open two browser tabs. In Tab 1, log in as a **Customer** and view an order's detail page (status: PLACED).
  2. In Tab 2, log in as the **Farmer** for that order. Go to "Incoming Orders".
  3. Click "Accept" on that new order.
  4. Go back to Tab 1 (Customer) and refresh the page.
- **Expected:** The customer sees the green "ACCEPTED" badge. The Order Timeline shows a new green step (Accepted) with the timestamp.
- **Status:** ✅ Passed

## 6. Farmer reject kare
- **Steps:**
  1. In the Farmer tab, find another "PLACED" order and click "Reject".
  2. Enter a rejection reason (e.g., "Heavy rain, cannot deliver").
  3. Refresh the Customer tab.
- **Expected:** Customer sees a red "REJECTED" badge. The timeline shows the Farmer's rejection reason. The stock for that product should be added back to the inventory.
- **Status:** ✅ Passed

## 7. ACCEPTED order pe cancel button
- **Steps:**
  1. As a Customer, view an order that was already "ACCEPTED" by the farmer.
- **Expected:** The "Cancel Order" button should **not** be visible. (It should only appear for 'PLACED' status).
- **Status:** ✅ Passed

## 8. Dusre customer ka order URL
- **Steps:**
  1. As Customer A, copy the URL of one of your orders (e.g., `/customer/orders/15`).
  2. Log out and log in as Customer B.
  3. Paste the URL and press Enter.
- **Expected:** An error page/toast says "Order not found". Customer B cannot see Customer A's order details.
- **Status:** ✅ Passed

## 9. Farmer `/customer/cart` kholay
- **Steps:**
  1. Log in as a **Farmer**.
  2. Manually type `http://localhost:5173/customer/cart` in the URL bar.
- **Expected:** System blocks access and redirects to `/unauthorized` (or the farmer dashboard).
- **Status:** ✅ Passed


## 10. 375px mobile view
- **Steps:**
  1. Open any page (Browse, Cart, Checkout).
  2. Right-click -> Inspect (F12) -> Toggle Device Toolbar.
  3. Set screen size to 375px width (e.g., iPhone SE).
- **Expected:** Pages look mobile-friendly. Cart totals and Checkout buttons stick to the bottom. Grids/forms collapse to a single column with no horizontal scrolling.
- **Status:** ✅ Passed
