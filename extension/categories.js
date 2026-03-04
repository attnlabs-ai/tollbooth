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

  const categoryEmoji = {
    alcohol: '🍺',
    gambling: '🎰',
    shopping: '🛍️',
    food_delivery: '🍕',
    nicotine: '🚬',
    gaming: '🎮',
    adult: '🔞',
    supplements: '💊',
    caffeine: '☕',
    default: '🛑'
  };

  const funnyMessages = {
    alcohol: [
      "Your liver said please no.",
      "Sober you will thank us. Probably.",
      "Thirsty? Call someone instead. 📞",
      "This won't fix it. We promise.",
      "Your 8am meeting remembers everything."
    ],
    gambling: [
      "The house always wins. Always.",
      "This is not an investment strategy. 📉",
      "Your rent said hi.",
      "DraftKings doesn't care about you. We do.",
      "One more bet never fixed anything."
    ],
    shopping: [
      "You don't need this. Call your mom.",
      "Your closet is already a crime scene.",
      "Dopamine spike incoming... then regret.",
      "Future you is begging you to stop.",
      "It won't fit. You know it won't fit."
    ],
    food_delivery: [
      "You literally just ate.",
      "DoorDash fees are a scam and you know it.",
      "The fridge has food. We checked.",
      "That $17 delivery fee though... 😬",
      "Cook something. You can do it."
    ],
    nicotine: [
      "Your lungs are not impressed.",
      "Past you said you quit. Past you had a point.",
      "This won't calm you down. It's lying.",
      "Your future teeth said no.",
      "One more is how it always starts."
    ],
    gaming: [
      "Touch grass first. 🌱",
      "Your sleep schedule said no.",
      "The pixels don't care about you like we do.",
      "You already have that battle pass. We checked.",
      "Log off. Drink water. Return."
    ],
    adult: [
      "There are better ways to spend 11pm.",
      "Your future partner is watching.",
      "Log off. Seriously.",
      "This is a pattern. You know it is.",
      "We say this with love: no."
    ],
    supplements: [
      "That won't fix what's actually wrong.",
      "Step away from the kratom, friend.",
      "Your doctor has opinions about this.",
      "This is the third time this week.",
      "Water. Sleep. Then revisit."
    ],
    default: [
      "Pump the brakes, champ. 🛑",
      "Your future self just cringed.",
      "Bold move. Brave. Wrong.",
      "Sir, this is a bad idea.",
      "Your bank account said no. We agree.",
      "This won't fix it. Trust us.",
      "Pause. Breathe. Think.",
      "You were doing so well too."
    ]
  };

  function getRandomMessage(category) {
    const pool = funnyMessages[category] || funnyMessages.default;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function getCategoryEmoji(category) {
    return categoryEmoji[category] || categoryEmoji.default;
  }

  window.TollboothCategories = {
    domains,
    keywords,
    urlPatterns,
    breadcrumbSelectors,
    titleSelectors,
    categoryEmoji,
    funnyMessages,
    getRandomMessage,
    getCategoryEmoji
  };
})();
