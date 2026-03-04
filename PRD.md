# Product Requirements Document: Financial Friction Layer for Addiction Recovery

**Version:** 1.0
**Date:** March 4, 2026
**Author:** Sis (ATTN Labs)
**For:** Austin — Build/No-Build Decision

---

## 1. Executive Summary

### Problem Statement

Impulse spending is a core behavioral loop in nearly every addiction. Whether it's a recovering alcoholic ordering from Drizly at 11 PM, a compulsive shopper filling a cart on Zara, or a gambling addict loading funds onto DraftKings — the moment between "I want this" and "payment confirmed" is often less than 10 seconds. There is no friction. No pause. No cost to giving in.

Existing tools (budgeting apps, ad blockers, willpower) fail because they operate on information, not intervention. They tell you what you spent *after*. They don't stand between you and the checkout button *during*.

### Product Vision

Build a Chrome extension + iOS companion app that acts as a **real-time financial friction layer** — intercepting purchases in user-defined addiction categories at the moment of checkout and imposing one of three interventions:

1. **Warning** — "You're about to buy [category]. Are you sure?"
2. **Block** — Purchase physically prevented for a cool-down period
3. **Friction Cost** — Purchase allowed, but the user pays an additional penalty (e.g., 50–200% surcharge) routed to a charity, savings account, or the platform

The core insight: **make the addictive purchase expensive in real-time, not just in retrospect.**

### Target User

- **Primary:** Adults 25–45 actively trying to control compulsive spending in one or more categories (estimated 15–20% of US adults have a behavioral or substance addiction with a financial component)
- **Secondary:** People in recovery programs (AA, NA, GA, etc.) who want a digital accountability tool
- **Tertiary:** Employers, insurance companies, and rehab centers looking for digital intervention tools

---

## 2. Product Name & Branding

### Recommended: **Tollbooth**

A tollbooth is something you *can* pass through — but it costs you. It creates a deliberate pause. It makes you stop, think, and pay. This perfectly captures the friction-cost model without being preachy or clinical.

### Alternative Names

| Name | Rationale | Pros | Cons |
|------|-----------|------|------|
| **Tollbooth** ⭐ | Purchase = toll road. You can pass, but it costs extra. | Intuitive metaphor, memorable, non-judgmental, brandable | Slightly playful for serious topic |
| **Guardrail** | Safety barrier — keeps you from going off the edge | Strong safety connotation, clear meaning | Generic, already used by AI safety companies (Guardrails AI) |
| **Checkpoint** | Military/security — you get stopped and verified | Strong friction metaphor, implies authority | Could feel controlling rather than self-directed |
| **Pause** | Simple, direct — the product creates a pause | Clean, minimal, modern branding potential | Very common word, SEO nightmare, hard to own |
| **Levy** | A levy is both a tax and a barrier (levee) | Double meaning is clever, premium feel | Obscure for mainstream audience, sounds like fintech |

**Recommendation:** Go with **Tollbooth** for consumer brand. "Guardrail" works as a B2B/enterprise sub-brand (e.g., "Tollbooth for Business, powered by Guardrail").

---

## 3. Core Features (v1)

### 3.1 Chrome Extension

**How it works technically:**

The extension operates as a Manifest V3 Chrome extension with three layers:

**Layer 1: Site Detection (Content Script)**
- Content scripts inject into all pages matching a configurable URL pattern list
- On page load, the script scans the DOM for product category signals:
  - Page `<title>`, `<meta>` tags, Open Graph tags, JSON-LD structured data
  - Product category breadcrumbs (e.g., "Home > Wine > Red Wine")
  - URL patterns (e.g., `/alcohol/`, `/vape/`, `/casino/`)
  - Known merchant domains (maintain a database: Drizly = alcohol, DraftKings = gambling, etc.)
- A lightweight classifier (rule-based for v1, ML for v2) assigns a category confidence score

**Layer 2: Checkout Interception (Content Script + Service Worker)**
- Monitors for checkout-indicating DOM events:
  - Button clicks on elements matching selectors: `[data-action="checkout"]`, `.checkout-btn`, `#buy-now`, Shopify's `form[action*="/cart"]`, Amazon's `#submitOrderButtonId`
  - Form submissions to known payment endpoints
  - URL navigation to `/checkout`, `/payment`, `/order-confirmation` paths
  - Mutation observers watching for payment iframes (Stripe, PayPal, etc.)
- When checkout intent is detected AND the product/merchant is in a flagged category → **intercept fires**

**Layer 3: Intervention Modal (Injected UI)**
- A full-screen overlay injects into the page, blocking the checkout flow
- Displays: category detected, intervention mode, and options
- The overlay captures focus and prevents background clicks
- The actual form submission / button click is `preventDefault()`'d until the user completes the intervention flow

**Supported platforms (v1):**
- Shopify stores (standardized checkout flow, ~4.6M stores)
- Amazon (well-known DOM structure, but changes frequently — needs maintenance)
- Generic: any site where checkout is detected via URL pattern + button heuristics

**What it cannot do:**
- Intercept purchases in native desktop apps (Steam, Epic Games)
- Block mobile browser purchases (that's the iOS app's job)
- Prevent someone from disabling the extension (addressed via accountability partner + "lock" feature with cool-down)

### 3.2 iOS App

**Honest assessment of what's technically possible:**

Apple does NOT allow apps to intercept Apple Pay transactions, inject into other apps, or monitor Safari browsing in real-time. This is a hard constraint. Here's what IS possible:

**Approach A: Safari Web Extension (PRIMARY — this is the real play)**
- iOS 15+ supports Safari Web Extensions built with the same WebExtension API as Chrome
- This means the same content script logic from the Chrome extension can run inside Safari on iOS
- Limitations: Only works in Safari (not in-app browsers, not Chrome iOS, not Apple Pay sheets)
- This covers: all web-based purchases made through Safari, which is the majority of mobile e-commerce browsing

**Approach B: Screen Time API (MDM-style self-restriction)**
- `ManagedSettings` framework (iOS 16+) allows apps to block access to specific websites and app categories
- Originally designed for parental controls, but repurposable for self-control
- Can block entire apps (e.g., block the DraftKings app, block Drizly app) during specified times or permanently until a cool-down code is entered
- Can block website categories in Safari
- **This is the "nuclear option"** — full block, not friction cost. Good for "hard mode."
- Limitation: User must grant authorization via Family Controls entitlement (requires Apple approval — see risks section)

**Approach C: Shortcuts + Focus Modes (lightweight)**
- Shortcuts automations can trigger when specific apps are opened
- Focus Modes can restrict app access
- Very limited — no purchase detection, just app-level blocking
- Best used as a supplement, not a primary mechanism

**Approach D: Spending Tracking via Open Banking / Plaid (PASSIVE)**
- Connect to bank account via Plaid
- Monitor transactions after they occur
- Can't prevent purchases, but CAN:
  - Auto-charge the friction cost after detecting a flagged purchase
  - Send accountability partner notifications
  - Power the analytics dashboard
- This is the **most reliable iOS mechanism for the friction cost model**

**Recommended iOS v1 architecture:**
1. Safari Web Extension for real-time interception (same as Chrome)
2. Screen Time API integration for app-level blocking (hard mode)
3. Plaid integration for post-purchase friction cost charging + analytics
4. Push notifications for accountability alerts

### 3.3 Addiction Category Setup (Onboarding)

**Flow:**

1. **Welcome screen** — "What do you want to spend less on?" (non-clinical language)
2. **Category picker** — Visual grid of common categories:
   - 🛍️ Shopping / Clothing
   - 🍺 Alcohol
   - 🌿 Kratom / Supplements / Substances
   - 🎰 Gambling / Sports Betting
   - 🍕 Food Delivery
   - 💨 Vaping / Nicotine
   - 🎮 Gaming / In-App Purchases
   - 🔞 Adult Content
   - 💊 Unregulated Supplements
   - ☕ Caffeine (for completeness)
   - ➕ Custom category (user-defined keywords + domains)
3. **Severity selector per category:**
   - 🟢 Warn me (notification only)
   - 🟡 Make me wait (24-hour cool-down before purchase allowed)
   - 🔴 Block it (hard block, requires accountability partner override or 48-hour wait)
   - 💰 Charge me (friction cost — set surcharge: 25%, 50%, 100%, 200%)
4. **Friction cost destination:**
   - Charity (pick from list or enter custom 501c3)
   - Personal savings (linked bank account)
   - Accountability partner gets the money
   - Platform keeps it (simplest — becomes revenue)
5. **Accountability partner setup** (optional) — invite via email/phone, they get notified on flagged purchases
6. **Lock settings** — user chooses whether settings can be changed instantly or require a 24/48/72-hour cool-down to modify (prevents "turn it off in the moment")

### 3.4 Friction Cost System

**How the penalty works:**

1. User attempts purchase of $50 bottle of wine (flagged category: alcohol)
2. Tollbooth intercepts at checkout
3. Modal shows: "This purchase is in your flagged category: Alcohol. Your friction cost is set to 100%. If you proceed, an additional $50 will be charged to [your designated destination]."
4. User options:
   - **"Cancel"** → purchase blocked, logged as "successfully avoided"
   - **"Wait 24 hours"** → purchase queued, reminder sent tomorrow. If still wanted, friction cost reduced by 50% (reward for patience)
   - **"Proceed & Pay Friction Cost"** → purchase goes through AND friction cost is charged

**Where the money goes (configurable):**

| Destination | Implementation | Complexity |
|-------------|---------------|------------|
| Charity | Stripe Connect to partner nonprofits (or Every.org API for instant charitable routing) | Medium |
| Savings account | ACH transfer via Plaid to user's linked savings | Medium |
| Accountability partner | Stripe payout to partner's linked account | High (KYC/compliance) |
| Platform revenue | Simplest — Stripe charges user, platform keeps it | Low |

**v1 recommendation:** Support charity (via Every.org API — they handle nonprofit routing) and platform-keeps-it. Add savings account in v2. Accountability partner payouts in v3 (compliance burden too high for MVP).

### 3.5 Blocking vs. Delay vs. Friction Cost Modes

| Mode | What Happens | Best For | Bypass Difficulty |
|------|-------------|----------|-------------------|
| **Warn** | Popup warning, one-click dismiss | Mild habits, awareness building | Easy (one click) |
| **Delay (24hr)** | Purchase queued, can only complete after 24hr cool-down | Impulse purchases, moderate habits | Medium (must remember and still want it) |
| **Delay (48/72hr)** | Extended cool-down | Stronger habits | Medium-hard |
| **Friction Cost** | Purchase allowed immediately but surcharge applied | Users who want economic disincentive | Hard (costs real money) |
| **Hard Block** | Purchase prevented entirely, no override | Severe addiction, early recovery | Very hard (requires accountability partner or 48hr setting change) |

Users can set different modes per category (e.g., "Warn me on food delivery, hard-block gambling").

### 3.6 Accountability Partner Feature

- Invite 1–3 trusted people (sponsor, spouse, therapist, friend)
- Partners receive:
  - Push notification when user attempts a flagged purchase
  - Weekly summary of spending in flagged categories
  - Alert if user tries to change settings (disable protection, lower friction cost)
- Partners can optionally be given override authority (to unlock a hard-blocked purchase in emergencies)
- Partners do NOT see specific product details by default (privacy) — only category, amount, and merchant name
- Partner app is free (lightweight companion app or just SMS/email notifications for v1)

### 3.7 Analytics Dashboard

**User-facing metrics:**
- Total money saved (purchases blocked or abandoned after warning)
- Friction costs paid (and where they went)
- Purchase attempts by category over time (daily/weekly/monthly)
- "Streak" — days since last flagged purchase
- Spending trend lines vs. pre-Tollbooth baseline
- "Moment of weakness" heatmap (what time/day do you most often try to buy?)

**v1:** Simple dashboard in the iOS app + Chrome extension popup. Charts via a lightweight library (Recharts or Chart.js).

---

## 4. Technical Architecture

### 4.1 Chrome Extension (Manifest V3)

```
tollbooth-extension/
├── manifest.json          # Manifest V3 config
├── service-worker.js      # Background service worker
├── content-scripts/
│   ├── detector.js        # Product category detection
│   ├── interceptor.js     # Checkout interception
│   └── modal.js           # Intervention UI injection
├── popup/
│   ├── popup.html         # Extension popup (quick stats + settings)
│   └── popup.js
├── options/
│   ├── options.html       # Full settings page
│   └── options.js
├── lib/
│   ├── categories.js      # Category definitions + keyword lists
│   ├── merchants.js       # Known merchant → category mappings
│   └── api.js             # Backend API client
└── assets/
    └── icons/
```

**Manifest V3 specifics:**
- `content_scripts`: Match `<all_urls>` (or configurable domain list for performance)
- `permissions`: `activeTab`, `storage`, `alarms`, `identity`
- `host_permissions`: `<all_urls>` (needed for content script injection on any shopping site)
- Service worker handles: API sync, alarm-based cool-down timers, badge updates
- Content scripts are the heaviest component — must be optimized to avoid slowing page loads (< 50ms injection time target)

**Data collected by extension:**
- URLs visited that contain product/checkout pages (NOT all browsing — only pages where category detection fires)
- Product category detected + confidence score
- Checkout attempts (timestamp, merchant, category, amount if detectable, user action taken)
- Settings and preferences
- **NOT collected:** Full browsing history, page content, form field data, payment details

### 4.2 iOS Technical Architecture

**Safari Web Extension:**
- Shared codebase with Chrome extension (WebExtension API compatibility)
- Packaged inside a native iOS app container
- Same content script logic for in-Safari purchase interception
- Communicates with native app via `browser.runtime.sendNativeMessage()`

**Native iOS App (Swift/SwiftUI):**
- Dashboard UI
- Settings management
- Screen Time API integration (`ManagedSettings`, `DeviceActivity`, `FamilyControls` frameworks)
- Plaid Link SDK for bank connection
- Push notification handling
- Local data storage (Core Data) + cloud sync

**Screen Time API implementation:**
```swift
// Request authorization
AuthorizationCenter.shared.requestAuthorization(for: .individual)

// Block specific web domains
let store = ManagedSettingsStore()
store.webContent.blockedByFilter = .specific(
    WebContent.Filter(
        blockedDomains: ["drizly.com", "draftkings.com", ...]
    )
)

// Block app categories
store.application.blockedByFilter = .specific(
    Application.Filter(
        categories: [.games, .shopping, ...]
    )
)
```

**Key limitation:** The Screen Time API requires the `com.apple.developer.family-controls` entitlement, which Apple grants selectively. You must apply for it and demonstrate a valid use case. Parental control and self-control apps have been approved (e.g., Opal, one sec), so precedent exists — but approval is not guaranteed. Plan for a 2–4 week review process.

### 4.3 Backend Architecture

**Recommended stack:**

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| API server | Node.js (Fastify) or Go | Fast, low-latency (extension requests must be < 200ms) |
| Database | PostgreSQL (primary) + Redis (cache/sessions) | Relational for user data, Redis for real-time state |
| Auth | Supabase Auth or Auth0 | Don't build auth from scratch |
| Payments | Stripe Connect | Handles friction cost charges + charitable routing |
| Bank connection | Plaid | Transaction monitoring, savings account linking |
| Hosting | AWS (ECS Fargate) or Railway/Render for MVP | Fargate for prod scale, Railway for speed to MVP |
| CDN | CloudFront | Extension update distribution |
| Monitoring | Datadog or Sentry | Error tracking, performance |

**Data model (core entities):**

```
users
├── id, email, created_at, subscription_tier
├── settings (JSON: categories, modes, friction_costs)
├── accountability_partners[]
└── plaid_connections[]

intervention_events
├── id, user_id, timestamp
├── merchant_domain, detected_category, confidence
├── intervention_type (warn/delay/block/friction)
├── user_action (cancelled/waited/proceeded/overridden)
├── amount_detected, friction_cost_charged
└── friction_destination (charity/savings/platform)

category_configs
├── user_id, category_name
├── mode (warn/delay_24/delay_48/friction/block)
├── friction_percentage
├── friction_destination
└── lock_until (timestamp — prevents setting changes)

accountability_partners
├── id, user_id, partner_email
├── notification_preferences
├── override_authority (boolean)
└── last_notified
```

### 4.4 Privacy Architecture

This product watches what people buy. This is inherently sensitive. Privacy must be a first-class feature, not an afterthought.

**Principles:**
1. **Local-first processing:** Category detection runs entirely in the browser/on-device. No browsing data is sent to servers unless an intervention fires.
2. **Minimal data transmission:** When an intervention fires, only send: merchant domain, detected category, amount (if available), timestamp, user action. Never send: full URLs, page content, product names, images.
3. **Encrypted at rest:** All server-side data encrypted with AES-256. User data encrypted with per-user keys.
4. **Data retention limits:** Intervention events auto-delete after 12 months (configurable by user to less).
5. **No selling data. Ever.** This must be in the ToS and privacy policy. Violating this would destroy the product.
6. **Accountability partner data isolation:** Partners see aggregated category/amount data only. They never get raw merchant URLs or product details.
7. **SOC 2 Type II:** Target for Year 2. Required for B2B sales.
8. **GDPR/CCPA compliant from day 1:** Data export, deletion requests, right to be forgotten.

**Privacy as brand differentiator:** "We help you control your spending. We never sell your data. Your purchase history stays yours."

### 4.5 ML / Product Categorization

**v1: Rule-based system (ship fast)**
- Curated keyword lists per category (e.g., alcohol: "wine", "beer", "spirits", "liquor", "bourbon")
- Domain → category mapping database (Drizly → alcohol, DraftKings → gambling, Fanatics → gambling-adjacent)
- JSON-LD / Open Graph product category parsing
- Shopify product type field extraction
- Confidence scoring: 3+ signals = high confidence, 1–2 = medium (show softer warning), 0 = no intervention

**v2: ML classifier**
- Fine-tuned text classifier (DistilBERT or similar lightweight model)
- Trained on: product titles, descriptions, merchant categories
- Runs as ONNX model in the browser (via ONNX Runtime Web) — no server round-trip needed
- Training data: scrape product listings from major merchants across all addiction categories
- Target: >95% precision (false positives are worse than false negatives — blocking a legitimate purchase destroys trust)

**v3: Visual classifier**
- Product image classification (is this a bottle of alcohol? a vape device?)
- Runs on-device via Core ML (iOS) or TF.js (browser)
- Handles cases where text is ambiguous but images are clear

---

## 5. Build Plan & Timeline

### Phase 1: MVP (Months 1–4)

**What ships:**
- Chrome extension with:
  - Rule-based category detection (top 5 categories: alcohol, gambling, shopping/clothing, food delivery, vaping/nicotine)
  - Checkout interception on Shopify stores + Amazon
  - Warn mode + 24-hour delay mode
  - Basic popup dashboard (attempts blocked, money saved)
  - Accountability partner notifications (email only, no app needed)
- Landing page + waitlist
- Stripe integration for friction cost (platform-keeps-it model only for MVP)
- Basic backend (auth, user settings sync, event logging)

**What does NOT ship in MVP:**
- iOS app (comes in Phase 2)
- Charity/savings friction cost routing
- ML classifier
- Hard block mode with Screen Time integration
- Detailed analytics dashboard

**Estimated dev time:** 12–16 weeks with 2 developers

### Phase 2: iOS + Full Feature Set (Months 5–9)

**What ships:**
- iOS app with Safari Web Extension
- Screen Time API integration (app blocking)
- Plaid integration (transaction monitoring + savings routing)
- Charity routing via Every.org
- Full analytics dashboard
- ML-based product classifier (browser-side)
- Custom categories with user-defined keywords
- 48/72-hour delay and hard block modes

**Estimated dev time:** 16–20 weeks with 3 developers

### Phase 3: Scale + B2B (Months 10–18)

**What ships:**
- B2B dashboard (employer/insurance admin panel)
- API for integration partners (rehab centers, health apps)
- Visual product classifier
- Firefox extension
- Android app (if demand warrants)
- Accountability partner native app
- Group features (support group challenges, shared streaks)

### Team Needed

| Role | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| Full-stack engineer (Chrome ext + backend) | 1 | 1 | 1 |
| iOS engineer | 0 | 1 | 1 |
| Designer (UI/UX) | 0.5 (contract) | 0.5 | 1 |
| Product manager | 0 (founder) | 0 (founder) | 1 |
| ML engineer | 0 | 0.5 (contract) | 1 |
| DevOps / infra | 0 | 0 (engineer handles) | 0.5 |
| **Total headcount** | **1.5** | **3** | **5.5** |

### Estimated Build Cost

**Option A: Contract team**
- Phase 1: 2 senior contractors × 16 weeks × $150/hr × 40 hrs/wk = **$192,000**
- Phase 2: 3 contractors × 20 weeks × $150/hr × 40 hrs/wk = **$360,000**
- Phase 3: In-house by this point
- **Total through Phase 2: ~$550K**

**Option B: Full-time hires (cheaper long-term)**
- Phase 1: 1 senior eng ($180K/yr) + 1 contract designer ($40K) = **$130K for 4 months** (prorated salary + contractor)
- Phase 2: Add iOS eng ($170K/yr) + ML contract ($50K) = **$200K for 5 months**
- **Total through Phase 2: ~$330K** (but you're carrying payroll into Phase 3)

**Option C: Solo founder + AI-assisted development**
- Austin builds Phase 1 MVP using Claude Code / Codex with a single senior Chrome extension contractor for guidance ($50/hr, 10 hrs/week)
- Phase 1 cost: **$30K–50K** (contractor + infra + Stripe fees + design)
- Phase 2: Hire first full-time engineer + iOS contractor
- **Total through Phase 2: ~$180K**
- *This is the recommended path if Austin wants to minimize burn and validate before scaling the team.*

---

## 6. Monetization Plans

### Plan A: Subscription

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 1 category, warn mode only, basic stats, no accountability partner |
| **Standard** | $7.99/mo ($79/yr) | Unlimited categories, all modes (warn/delay/friction/block), 1 accountability partner, full dashboard |
| **Premium** | $14.99/mo ($149/yr) | Everything in Standard + charity/savings friction routing, 3 accountability partners, priority support, streak rewards |
| **Recovery Pro** | $24.99/mo ($249/yr) | Everything in Premium + therapist/counselor dashboard integration, API access, custom intervention messages, phone support |

**Reasoning on pricing:** Comparable to habit/productivity apps. Headspace is $12.99/mo, Noom is $16.99/mo, BetterHelp is $60–90/wk. For an app that demonstrably saves users hundreds per month in avoided impulse purchases, $8–25/mo is a no-brainer value prop. The money-saved metric makes ROI crystal clear.

### Plan B: Friction Cost Revenue Share

- When a user's friction cost is set to "platform keeps it," Tollbooth takes 100% of the surcharge
- When set to charity or savings, Tollbooth takes a **15% processing fee** on the friction cost
- Example: User makes a $100 impulse purchase with 100% friction cost. $100 surcharge is charged. If routing to charity, Tollbooth keeps $15, charity gets $85.

**Estimated per-user friction revenue:**
- Average flagged purchase attempt: 4x/month
- Average purchase value: $45
- 40% of attempts result in "proceed with friction cost" (60% cancel — which is the goal)
- Average friction cost setting: 75%
- Monthly friction charges per active user: 4 × 0.4 × $45 × 0.75 = **$54/month in friction charges**
- At 15% take rate: **$8.10/user/month** (on top of subscription)
- At 100% (platform keeps it): **$54/user/month**

This is potentially a very large revenue stream, but it creates a perverse incentive (the company profits when users fail). Must be handled carefully for brand trust.

### Plan C: B2B

| Segment | Pricing | Value Prop |
|---------|---------|-----------|
| Employers (wellness benefit) | $3–5/employee/month (company pays) | Reduce gambling/substance-related productivity loss. SHRM estimates problem gambling costs employers $5,000–10,000/employee/year |
| Insurance companies | $2–4 PMPM (per member per month) | Reduce claims related to substance abuse, behavioral addiction |
| Rehab centers / therapists | $500–2,000/month per practice | Patient monitoring dashboard, intervention data for treatment plans |
| Health plans (Medicaid/Medicare) | Custom | Digital therapeutics pathway (requires clinical validation) |

**B2B is the long-term big money** but requires: SOC 2, HIPAA compliance, clinical validation studies, and a sales team. Not viable until Phase 3 minimum.

### Plan D: Freemium

Free tier acts as acquisition funnel. Conversion target: 8–12% free → paid within 90 days.

### Recommended Combination

**Subscription (Plan A) + Friction Cost Revenue Share (Plan B) + Freemium funnel (Plan D)**

- Subscription provides predictable recurring revenue
- Friction cost share provides usage-based upside
- Freemium drives acquisition
- B2B (Plan C) comes later as a separate revenue line

**Avoid making friction cost revenue the primary model.** It creates a misaligned incentive (company profits when users relapse). Position it as: "We charge a small processing fee to route your friction costs to charity/savings. This covers our payment processing and operations." The subscription should be the core business.

---

## 7. Revenue & Profitability Projections

### Market Sizing

**TAM (Total Addressable Market):**
- US adults with behavioral/substance addiction with financial component: ~50M people
  - 14.5M with alcohol use disorder (NIAAA)
  - 6–10M problem gamblers (NCPG)
  - 17M+ compulsive shoppers (Stanford, estimated 5.8% of US adults)
  - Overlap-adjusted estimate: ~50M unique individuals
- Global (English-speaking markets): ~120M
- At $120/year average: **TAM = $6B (US) / $14.4B (global)**

**SAM (Serviceable Addressable Market):**
- Digitally active, smartphone-owning, aware of problem, willing to try tech solution: ~15% of TAM
- SAM = 7.5M people (US)
- At $120/year: **SAM = $900M**

**SOM (Serviceable Obtainable Market — realistic Year 3):**
- Capture 0.5–1% of SAM in 3 years
- SOM = 37,500–75,000 paying users
- At blended $110/year (mix of tiers): **SOM = $4.1M–$8.3M ARR**

*These estimates are conservative. The compulsive shopping segment alone is massive and underserved by tech.*

### Revenue Projections

**Conservative Scenario:**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 8,000 | 30,000 | 80,000 |
| Paid users | 800 | 4,500 | 15,000 |
| Conversion rate | 10% | 15% | 18.75% |
| Blended ARPU (annual) | $90 | $100 | $110 |
| Subscription revenue | $72K | $450K | $1.65M |
| Friction cost rev share | $15K | $120K | $480K |
| B2B revenue | $0 | $0 | $100K |
| **Total revenue** | **$87K** | **$570K** | **$2.23M** |

**Base Scenario:**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 15,000 | 60,000 | 180,000 |
| Paid users | 1,500 | 9,000 | 36,000 |
| Blended ARPU (annual) | $95 | $108 | $120 |
| Subscription revenue | $142.5K | $972K | $4.32M |
| Friction cost rev share | $30K | $250K | $1.1M |
| B2B revenue | $0 | $50K | $500K |
| **Total revenue** | **$172.5K** | **$1.27M** | **$5.92M** |

**Optimistic Scenario (viral moment / press coverage / partnership):**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 40,000 | 200,000 | 600,000 |
| Paid users | 5,000 | 30,000 | 120,000 |
| Blended ARPU (annual) | $100 | $115 | $130 |
| Subscription revenue | $500K | $3.45M | $15.6M |
| Friction cost rev share | $100K | $800K | $3.6M |
| B2B revenue | $0 | $200K | $2M |
| **Total revenue** | **$600K** | **$4.45M** | **$21.2M** |

### Break-Even Analysis

**Assuming Option C build approach (solo founder + contractors):**
- Monthly burn rate (Phase 1): ~$8K (infra + contractors + tools)
- Monthly burn rate (Phase 2): ~$25K (1–2 FT engineers + infra)
- Monthly burn rate (Phase 3): ~$60K (5 FT + infra + support)

**Conservative:** Break-even at ~Month 18 (4,500 paid users)
**Base:** Break-even at ~Month 13 (2,500 paid users)
**Optimistic:** Break-even at ~Month 8

### CAC & LTV Estimates

**Customer Acquisition Cost (estimated):**
- Organic/content marketing (Reddit, addiction recovery communities, podcasts): $5–15 CAC
- Paid social (Facebook/Instagram targeting recovery interests): $25–40 CAC
- Influencer partnerships (recovery influencers, financial wellness creators): $10–20 CAC
- Blended CAC target: **$20–30**

*Reasoning: Habit/wellness apps typically see $15–50 CAC. This product has strong organic potential due to the "wow factor" of the friction cost concept — it's very shareable.*

**Lifetime Value:**
- Average subscription duration: 8–14 months (estimate — churn analysis below)
- Monthly ARPU: $9.50 (blended, including friction rev share)
- Gross margin: ~80%
- **LTV = $9.50 × 11 months × 0.80 = $83.60**
- **LTV:CAC ratio = 83.60 / 25 = 3.3x** (healthy — target is >3x)

*Churn caveat: This product has a unique churn dynamic. "Success" means the user stops needing it. This could drive high churn (12–18 months). Counter with: long-term maintenance mode, expanded categories, community features, and a narrative of "Tollbooth as lifelong financial wellness companion, not just addiction tool."*

---

## 8. Infrastructure & Ongoing Costs

### Server Costs (AWS)

| Scale | Monthly Infra Cost | Breakdown |
|-------|-------------------|-----------|
| **1,000 users** | $150–300/mo | Small ECS task ($50), RDS t3.small ($30), Redis t3.micro ($15), S3 + CloudFront ($20), misc ($35–85) |
| **10,000 users** | $800–1,500/mo | 2x ECS tasks ($200), RDS t3.medium ($80), Redis t3.small ($50), S3 + CF ($100), monitoring ($50), misc ($320–720) |
| **100,000 users** | $4,000–8,000/mo | Auto-scaling ECS cluster ($1,500), RDS r6g.large + read replica ($500), Redis r6g.large ($300), S3 + CF ($500), WAF ($100), monitoring ($200), misc ($900–3,900) |

*These are estimates based on comparable SaaS workloads. Actual costs depend heavily on API call patterns and data retention policies.*

### Payment Processing Fees

| Component | Fee |
|-----------|-----|
| Stripe subscription billing | 2.9% + $0.30 per transaction |
| Stripe Connect (friction cost routing) | 2.9% + $0.30 + 0.25% platform fee |
| Plaid (bank connections) | $0.30/connection/month (production pricing varies) |
| Every.org (charity routing) | 0% platform fee (they charge donors optionally) |

**At 10,000 paid users × $10/mo average:**
- Stripe fees: ~$3,200/mo (3.2% effective rate)
- Plaid: ~$1,500/mo (assuming 50% of users connect bank)
- **Total payment processing: ~$4,700/mo**

### App Store Fees

- Apple takes 30% of in-app subscription revenue (15% after Year 1 via Small Business Program if under $1M)
- Google Play: 15% for first $1M, 30% after
- **Strategy:** Offer web-based subscription signup (bypass app store cut) and only use in-app purchase as a fallback. Many apps (Spotify, Netflix) have successfully done this. Apple's rules allow linking to web signup as of 2024 (US, under court order).

**Estimated App Store impact:**
- If 40% of iOS subscriptions go through App Store: 40% × revenue × 15% = **6% effective revenue reduction**
- Mitigate by pushing users to web signup during onboarding

### Support Costs

| Scale | Monthly Support Cost | Model |
|-------|---------------------|-------|
| 1,000 users | $0 (founder handles) | Email only |
| 10,000 users | $2,000–4,000/mo | 1 part-time support agent + Intercom ($89/mo) |
| 100,000 users | $15,000–25,000/mo | 3–5 support agents + Intercom Pro ($500/mo) + knowledge base |

### Total Monthly Operating Costs by Scale

| Scale | Infra | Payment Processing | Support | App Store | Total |
|-------|-------|-------------------|---------|-----------|-------|
| 1,000 users | $250 | $350 | $0 | $200 | **$800/mo** |
| 10,000 users | $1,200 | $4,700 | $3,000 | $2,000 | **$10,900/mo** |
| 100,000 users | $6,000 | $35,000 | $20,000 | $15,000 | **$76,000/mo** |

---

## 9. Key Risks & Mitigations

### Risk 1: Apple Restrictions on Apple Pay / Screen Time API

**Severity: HIGH**
**Probability: MEDIUM**

- Apple may reject the Family Controls entitlement application
- Apple may change Screen Time API access policies
- Apple Pay interception is fundamentally impossible — no mitigation exists

**Mitigations:**
- Safari Web Extension handles the core interception use case (doesn't require Screen Time API)
- Apply for Family Controls entitlement early (during Phase 1, before iOS development begins)
- Precedent: Opal, one sec, and Freedom all use Screen Time API for self-control. Apple has approved this use case.
- If fully rejected: iOS app becomes a companion dashboard + Plaid-based post-purchase friction charging (still valuable, just not real-time)

### Risk 2: Privacy & Data Concerns

**Severity: HIGH**
**Probability: MEDIUM-HIGH**

- Users must trust the app with purchase behavior data
- A data breach would be catastrophic (imagine "User X's gambling history leaked")
- Regulatory scrutiny (GDPR, CCPA, potential HIPAA if marketed as health tool)

**Mitigations:**
- Local-first processing (category detection runs in browser, not on server)
- Minimal data collection (never store full URLs or product details)
- SOC 2 certification by Year 2
- Third-party security audit before launch
- Transparent privacy policy — make it a marketing asset
- End-to-end encryption for accountability partner communications

### Risk 3: User Churn — "I'll Just Disable It"

**Severity: HIGH**
**Probability: HIGH**

The fundamental challenge: when someone desperately wants to buy something, they'll disable the extension. This is the #1 existential risk.

**Mitigations:**
- **Setting change cool-down:** Users pre-commit to a 24/48/72-hour waiting period before settings can be changed. You can't impulsively disable it.
- **Accountability partner alerts:** Partner gets notified immediately if user tries to change settings or disable the extension
- **Uninstall detection:** Service worker can detect extension removal and notify the accountability partner (within Chrome API limits)
- **"Break glass" cost:** Disabling protection immediately triggers a friction cost charge (user pre-authorizes this)
- **Streak gamification:** Long streaks become psychologically valuable — breaking a 90-day streak creates its own friction
- **Multi-platform sync:** Even if Chrome extension is disabled, Plaid still catches the purchase and charges friction cost after the fact (iOS Plaid integration)

### Risk 4: App Store Rejection

**Severity: MEDIUM**
**Probability: LOW-MEDIUM**

- Apple may object to the app's interception of purchases
- Chrome Web Store has content policies around extensions that modify web page behavior

**Mitigations:**
- Chrome Web Store: Similar extensions exist (e.g., "Block Site", "StayFocusd"). The category is established.
- App Store: Position as "self-control" / "digital wellness" — Apple has approved Freedom, Opal, one sec, all of which restrict user behavior
- Never use the word "addiction" in App Store listing (use "habits", "impulse spending", "financial wellness")
- Submit for App Store review early with a clear, non-clinical description

### Risk 5: Legal Considerations

**Severity: MEDIUM**
**Probability: LOW**

- If the app takes a % of friction costs, is it a financial service? (Potentially — may need state money transmitter licenses if routing to savings accounts)
- If marketed for addiction treatment, FDA could classify as a digital therapeutic (requires clinical trials)
- Liability if someone claims the app failed to block a purchase and they relapsed

**Mitigations:**
- v1: Use Stripe as payment processor (they hold the money transmitter licenses)
- Never claim medical or therapeutic efficacy in marketing
- Terms of service: "Tollbooth is a financial wellness tool, not a medical device or addiction treatment"
- Legal review before launch ($5K–10K for fintech-experienced attorney)
- Insurance: Tech E&O + general liability ($2K–5K/year)

### Risk 6: Merchant Pushback

**Severity: LOW**
**Probability: LOW**

- Merchants could theoretically object to checkout interception and try to detect/block the extension
- Unlikely at small scale; possible if the product gets very large

**Mitigations:**
- Extension doesn't modify the merchant's actual checkout flow — it overlays on top
- No merchant data is scraped or resold
- Position as consumer protection, not anti-commerce
- If a merchant actively blocks the extension, that's actually a PR win ("Alcohol company tries to prevent addiction recovery tool from working")

---

## 10. Go-to-Market Strategy

### Who to Target First

**#1: Problem Gamblers / Sports Bettors**

Reasoning:
- Highest financial pain (average problem gambler loses $55,000+ before seeking help — National Council on Problem Gambling)
- Clear, identifiable merchant set (DraftKings, FanDuel, BetMGM, Caesars, etc.) — easy to build category detection
- Growing rapidly (US sports betting legalization expanding state by state)
- Existing online communities (r/problemgambling has 65K+ members, Gamblers Anonymous)
- High willingness to pay for solutions (they're already losing thousands)
- Strong accountability partner dynamic (spouses/family often desperate for tools)
- Less stigma than substance addiction in tech-forward demographics

**#2: Compulsive Online Shoppers**

Reasoning:
- Largest total market (17M+ in US)
- Skews female 25–45, digitally native, high e-commerce usage
- Very well-suited to Chrome extension (shopping = web-based)
- Lower stigma, easier to market on social media
- Clear ROI story ("I saved $X this month")

**#3: Alcohol (online ordering)**

Reasoning:
- Large market, high intent to reduce
- Growing delivery market (Drizly, Instacart alcohol, etc.)
- Natural pairing with "Dry January" and sobriety-curious trends

### Distribution Channels

| Channel | Priority | Expected CAC | Notes |
|---------|----------|-------------|-------|
| Reddit (r/problemgambling, r/stopdrinking, r/shoppingaddiction) | HIGH | $5–10 | Authentic engagement, not ads. Post genuinely helpful content + soft product mentions |
| Recovery podcasts (sponsorship) | HIGH | $15–25 | Recovery-focused audiences have high intent. Sponsor 3–5 podcasts. |
| TikTok / Reels (organic) | HIGH | $0–5 | Demo videos of the extension intercepting purchases are inherently viral. "Watch what happens when I try to buy from [site]" |
| Recovery influencers | MEDIUM | $10–20 | Partner with sober influencers, financial wellness creators |
| Google Ads (bottom funnel) | MEDIUM | $25–40 | Target: "how to stop gambling online", "block gambling sites", "impulse spending help" |
| Therapist/counselor referrals | MEDIUM | $15–25 | Build relationships with addiction counselors, offer them free dashboard access |
| Chrome Web Store SEO | LOW (but free) | $0 | Optimize listing for "block gambling", "shopping addiction", "impulse purchase blocker" |
| Product Hunt launch | LOW (one-time) | $0 | Good for tech press coverage |

### Positioning

**Tagline options:**
- "The tollbooth between you and impulse spending."
- "Every purchase has a price. Now your impulses do too."
- "Financial friction for better decisions."

**Positioning statement:**
"Tollbooth is a Chrome extension and iOS app that adds a financial speed bump to your most impulsive purchases. Set your categories, choose your consequence, and let the app do what willpower can't — make giving in expensive."

**Key messaging principles:**
- Non-clinical, non-judgmental (not "addiction treatment" — "impulse control")
- Empowering, not restrictive (you're choosing to use this, it's a tool not a cage)
- ROI-driven ("saved $2,400 this quarter")
- Social proof heavy (testimonials, streak screenshots, money-saved counters)

### Launch Sequence

1. **Month -2:** Landing page + waitlist (target 1,000 signups before launch)
2. **Month -1:** Private beta with 50–100 users from gambling recovery communities
3. **Month 0:** Public Chrome extension launch + Product Hunt + Reddit posts
4. **Month 1:** Podcast sponsorship begins (3 recovery-focused shows)
5. **Month 2:** TikTok content campaign (demo videos)
6. **Month 3:** Therapist/counselor outreach program begins
7. **Month 5:** iOS app launch (second wave of press)

---

## Appendix: Decision Framework

### Should Austin Build This?

**Strengths:**
- Genuine problem with willingness to pay (users are losing thousands to impulse spending)
- Chrome extension MVP is technically achievable with 1–2 developers in 3–4 months
- Friction cost model is a novel, viral-worthy concept
- Multiple monetization paths (subscription + transaction revenue + B2B)
- Strong organic distribution potential (recovery communities, viral demo videos)
- Defensible moat via merchant database, ML categorization, and accountability network effects

**Weaknesses:**
- iOS interception is fundamentally limited by Apple (Safari Web Extension helps, but no Apple Pay coverage)
- Privacy sensitivity requires above-average security investment
- Churn risk is structural (users disable when tempted, or "graduate" when recovered)
- B2B revenue (the big money) requires clinical validation and compliance work

**Verdict:**

This is a buildable product with a real market, a novel mechanism (friction cost), and a clear MVP path. The Chrome extension alone is a strong standalone product. The iOS limitations are real but workable (Safari Web Extension + Plaid cover the most important ground).

The biggest question is whether Austin wants to operate in the addiction/recovery space long-term. This market rewards authenticity and trust — it's not a product you can half-commit to. If the answer is yes, the economics are strong and the competition is weak (existing tools are either too clinical or too simple).

**Recommended next step:** Build a proof-of-concept Chrome extension in 2 weeks that can detect and intercept checkout on 3 Shopify stores + DraftKings. Test with 10 people from r/problemgambling. If the intervention modal actually stops people, the rest of the product follows.

---

*Document prepared March 4, 2026. All financial projections are estimates based on comparable products and market research. Actual results will vary based on execution, market timing, and competitive dynamics.*
