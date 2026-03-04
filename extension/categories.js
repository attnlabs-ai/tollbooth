(() => {
  const domains = {
    "drizly.com": "alcohol",
    "instacart.com": "alcohol",
    "totalwine.com": "alcohol",
    "wine.com": "alcohol",
    "draftkings.com": "gambling",
    "fanduel.com": "gambling",
    "betmgm.com": "gambling",
    "caesars.com": "gambling",
    "zara.com": "shopping",
    "shein.com": "shopping",
    "amazon.com": "shopping",
    "etsy.com": "shopping",
    "doordash.com": "food_delivery",
    "ubereats.com": "food_delivery",
    "grubhub.com": "food_delivery",
    "juul.com": "nicotine",
    "vuse.com": "nicotine",
    "pornhub.com": "adult",
    "onlyfans.com": "adult"
  };

  const keywords = {
    alcohol: ["wine", "beer", "spirits", "liquor", "bourbon", "vodka", "whiskey", "tequila"],
    gambling: ["casino", "bet", "sportsbook", "odds", "parlay", "wager"],
    shopping: ["dress", "shoes", "cart", "apparel", "handbag", "accessories"],
    food_delivery: ["delivery", "order now", "pickup", "restaurant"],
    nicotine: ["vape", "nicotine", "pods", "e-cig"],
    gaming: ["coins", "gems", "loot", "battle pass", "in-app purchase"],
    adult: ["adult", "xxx", "porn"],
    supplements: ["kratom", "nootropic", "supplement"],
    caffeine: ["coffee", "energy drink", "caffeine"]
  };

  const urlPatterns = {
    alcohol: [/\/alcohol\b/i, /\/wine\b/i, /\/beer\b/i],
    gambling: [/\/casino\b/i, /\/sportsbook\b/i, /\/bet\b/i],
    shopping: [/\/cart\b/i, /\/checkout\b/i, /\/product\b/i],
    food_delivery: [/\/restaurant\b/i, /\/menu\b/i, /\/checkout\b/i],
    nicotine: [/\/vape\b/i, /\/nicotine\b/i],
    adult: [/\/porn\b/i, /\/xxx\b/i]
  };

  const breadcrumbSelectors = [
    "nav[aria-label='Breadcrumb']",
    ".breadcrumb",
    ".breadcrumbs",
    "[data-test='breadcrumb']",
    "[itemprop='breadcrumb']"
  ];

  const titleSelectors = [
    "meta[property='og:title']",
    "meta[name='title']",
    "title"
  ];

  window.TollboothCategories = {
    domains,
    keywords,
    urlPatterns,
    breadcrumbSelectors,
    titleSelectors
  };
})();
