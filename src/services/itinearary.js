import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateItineraryAI({
  destinationName,
  originCity,
  days,
  adults,
  children,
  tier,
  interests,
  dailyBudgetPerPerson,
  attractions = [],
  restaurants = [],
  hotels = [],
}) {
  const start = Date.now();

  const totalPax = adults + children * 0.5;
  const totalBudget = Math.round(dailyBudgetPerPerson * days * totalPax);

  // ── Budget math ──────────────────────────────────────────────────────────
  const mult = { economy: 0.55, standard: 1.0, luxury: 2.3 };
  const ecoT = Math.round(totalBudget * mult.economy);
  const stdT = Math.round(totalBudget * mult.standard);
  const luxT = Math.round(totalBudget * mult.luxury);

  // Budget-aware hotel price range for the selected tier
  const hotelNightlyBudget = {
    economy: Math.round(dailyBudgetPerPerson * 0.4 * adults),
    standard: Math.round(dailyBudgetPerPerson * 0.45 * adults),
    luxury: Math.round(dailyBudgetPerPerson * 1.05 * adults),
  };
  const mealBudgetPerPerson = {
    economy: Math.round(dailyBudgetPerPerson * 0.12),
    standard: Math.round(dailyBudgetPerPerson * 0.18),
    luxury: Math.round(dailyBudgetPerPerson * 0.28),
  };
  const nightlyBudget = hotelNightlyBudget[tier] || hotelNightlyBudget.standard;
  const mealBudget = mealBudgetPerPerson[tier] || mealBudgetPerPerson.standard;

  // ── Build context from real DB data ─────────────────────────────────────
  const attractionCtx = attractions.length
    ? `REAL ATTRACTIONS (use these first):\n${attractions
        .map(
          (a) =>
            `- ${a.name} (${a.category}), entry ₹${a.entryFee || 0}, ~${a.durationHours || 2}h`,
        )
        .join("\n")}`
    : "";

  const restaurantCtx = restaurants.length
    ? `REAL RESTAURANTS AT THIS DESTINATION (use these for food suggestions):\n${restaurants
        .map(
          (r) =>
            `- ${r.name} | ${r.cuisineType} | ${r.priceRange} | ~₹${r.pricePerPerson || 300}/person | ${r.isVeg ? "Veg" : "Non-veg"}`,
        )
        .join("\n")}`
    : "";

  const hotelCtx = hotels.length
    ? `REAL HOTELS AT THIS DESTINATION (use these for hotel suggestions):\n${hotels
        .map(
          (h) =>
            `- ${h.name} | ₹${h.pricePerNight || 0}/night | ${h.tier} tier | ${h.rating || "4"}★`,
        )
        .join("\n")}`
    : "";

  // Guard: destinationName can be undefined if controller didn't pass it — never crash on .split()
  const destShortName = (destinationName || "the destination")
    .split(",")[0]
    .trim();

  const systemPrompt = `You are TripWise, an expert Indian travel planner.
You ALWAYS respond with valid raw JSON only.
No markdown, no backticks, no prose — ONLY the JSON object.
All number values must be plain integers, not strings.`;

  const userPrompt = `Generate a complete ${days}-day travel itinerary for ${adults} adults${children > 0 ? ` and ${children} children` : ""}.

TRIP DETAILS:
- Destination: ${destinationName}
- From: ${originCity}
- Duration: ${days} days
- Tier: ${tier}
- Daily budget per person: ₹${dailyBudgetPerPerson}
- Total hotel budget per night: ~₹${nightlyBudget} (for all ${adults} adults)
- Meal budget per person per meal: ~₹${mealBudget}
- Interests: ${interests && interests.length ? interests.join(", ") : "culture, food, sightseeing"}

${attractionCtx}
${restaurantCtx}
${hotelCtx}

CRITICAL RULES:
1. For every FOOD slot: suggest 2-3 SPECIFIC restaurants by name with cuisine type and price estimate. Never say "local dhaba" or "any restaurant". Always name real places.
2. For hotel suggestions: suggest 3 specific hotels with nightly price that fits ₹${nightlyBudget}/night budget. Include hotel type (boutique/heritage/chain) and a 1-line selling point.
3. Food slots must have a "suggestions" array with named restaurant options the user can choose from.
4. Hotel section must have a "hotelSuggestions" array with 3 concrete hotel options.
5. Costs must be realistic for ${tier} tier in India. Economy = budget guesthouses + street food. Standard = 3-4 star + good restaurants. Luxury = 5-star palace hotels + fine dining.

Return ONLY this JSON:

{
  "title": "REQUIRED: a catchy title that explicitly names ${destShortName} — e.g. 'Sun, Sand & Spice: Goa in 4 Days' or 'Royal Rajputana: 3 Days in Jaipur'",
  "bestTimeToVisit": "months e.g. October to March",
  "travelTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "localPhrases": [
    {"phrase": "local phrase", "translation": "English meaning"},
    {"phrase": "local phrase", "translation": "English meaning"},
    {"phrase": "local phrase", "translation": "English meaning"}
  ],
  "budgetEstimate": {
    "economy": {
      "accommodation": ${Math.round(ecoT * 0.4)},
      "food": ${Math.round(ecoT * 0.25)},
      "transport": ${Math.round(ecoT * 0.2)},
      "entryFees": ${Math.round(ecoT * 0.1)},
      "misc": ${Math.round(ecoT * 0.05)},
      "total": ${ecoT},
      "perPerson": ${Math.round(ecoT / adults)}
    },
    "standard": {
      "accommodation": ${Math.round(stdT * 0.42)},
      "food": ${Math.round(stdT * 0.25)},
      "transport": ${Math.round(stdT * 0.2)},
      "entryFees": ${Math.round(stdT * 0.08)},
      "misc": ${Math.round(stdT * 0.05)},
      "total": ${stdT},
      "perPerson": ${Math.round(stdT / adults)}
    },
    "luxury": {
      "accommodation": ${Math.round(luxT * 0.45)},
      "food": ${Math.round(luxT * 0.25)},
      "transport": ${Math.round(luxT * 0.18)},
      "entryFees": ${Math.round(luxT * 0.07)},
      "misc": ${Math.round(luxT * 0.05)},
      "total": ${luxT},
      "perPerson": ${Math.round(luxT / adults)}
    }
  },
  "hotelSuggestions": [
    {
      "name": "Specific Hotel Name",
      "type": "Heritage Haveli / Boutique / Business / Luxury Resort",
      "pricePerNight": ${nightlyBudget},
      "rating": 4,
      "whyStayHere": "1 sentence — what makes this special",
      "location": "area/neighborhood name",
      "isRecommended": true
    },
    {
      "name": "Second Hotel Name",
      "type": "type",
      "pricePerNight": ${Math.round(nightlyBudget * 0.82)},
      "rating": 4,
      "whyStayHere": "1 sentence selling point",
      "location": "area name",
      "isRecommended": false
    },
    {
      "name": "Third Hotel Name",
      "type": "type",
      "pricePerNight": ${Math.round(nightlyBudget * 1.18)},
      "rating": 5,
      "whyStayHere": "1 sentence selling point",
      "location": "area name",
      "isRecommended": false
    }
  ],
  "days": [
    {
      "dayNumber": 1,
      "title": "day title e.g. Forts, Markets & Street Food",
      "summary": "1-2 sentence day overview",
      "slots": [
        {
          "slotOrder": 1,
          "timeLabel": "8:00 AM",
          "type": "hotel",
          "title": "Check In & Settle",
          "description": "Arrive and check into your hotel. Drop bags and freshen up before the day begins.",
          "durationMins": 60,
          "estimatedCost": 0,
          "aiTip": "specific insider tip",
          "suggestions": []
        },
        {
          "slotOrder": 2,
          "timeLabel": "9:30 AM",
          "type": "attraction",
          "title": "Specific Attraction Name",
          "description": "What to see, what to look for, why it matters.",
          "durationMins": 120,
          "estimatedCost": 200,
          "aiTip": "insider tip e.g. go early to avoid crowds",
          "suggestions": []
        },
        {
          "slotOrder": 3,
          "timeLabel": "1:00 PM",
          "type": "food",
          "title": "Lunch",
          "description": "Great lunch options near your morning attractions. Pick one of the suggestions below.",
          "durationMins": 60,
          "estimatedCost": ${mealBudget},
          "aiTip": "specific food tip e.g. must-order dish, best table, avoid peak hours",
          "suggestions": [
            {
              "name": "Specific Restaurant Name 1",
              "cuisine": "e.g. Rajasthani Thali",
              "pricePerPerson": ${mealBudget},
              "mustOrder": "specific dish name",
              "vibe": "e.g. rooftop, heritage, street-side",
              "isVeg": true
            },
            {
              "name": "Specific Restaurant Name 2",
              "cuisine": "e.g. North Indian",
              "pricePerPerson": ${Math.round(mealBudget * 0.8)},
              "mustOrder": "specific dish",
              "vibe": "e.g. family-friendly, casual",
              "isVeg": false
            },
            {
              "name": "Specific Restaurant Name 3",
              "cuisine": "cuisine type",
              "pricePerPerson": ${Math.round(mealBudget * 1.2)},
              "mustOrder": "dish name",
              "vibe": "vibe description",
              "isVeg": false
            }
          ]
        },
        {
          "slotOrder": 4,
          "timeLabel": "3:00 PM",
          "type": "attraction",
          "title": "Specific Attraction",
          "description": "Description of what to do and see.",
          "durationMins": 90,
          "estimatedCost": 150,
          "aiTip": "insider tip",
          "suggestions": []
        },
        {
          "slotOrder": 5,
          "timeLabel": "7:30 PM",
          "type": "food",
          "title": "Dinner",
          "description": "Evening dining options — pick one of the suggestions below.",
          "durationMins": 90,
          "estimatedCost": ${Math.round(mealBudget * 1.4)},
          "aiTip": "dinner tip — reservation needed? best table? signature dish?",
          "suggestions": [
            {
              "name": "Specific Restaurant Name 1",
              "cuisine": "cuisine type",
              "pricePerPerson": ${Math.round(mealBudget * 1.4)},
              "mustOrder": "dish name",
              "vibe": "e.g. romantic rooftop, lake view, heritage courtyard",
              "isVeg": false
            },
            {
              "name": "Specific Restaurant Name 2",
              "cuisine": "cuisine",
              "pricePerPerson": ${Math.round(mealBudget * 1.1)},
              "mustOrder": "dish",
              "vibe": "vibe",
              "isVeg": true
            }
          ]
        }
      ]
    }
  ]
}

STRICT RULES — follow ALL of these:
1. Generate ALL ${days} days (dayNumber 1 through ${days}). Never generate fewer days.
2. The "title" field MUST contain the word "${destShortName}" — never use another city name.
3. Every food slot MUST have 2-3 named restaurant suggestions specific to ${destinationName}.
4. Hotels in hotelSuggestions must be named properties located in ${destinationName}.
5. Attractions and landmarks must be real places IN ${destinationName} — not from other cities.
6. Never use generic names like "Local Restaurant" or "Budget Hotel".`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.72,
    max_tokens: 8000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;

  let aiData;
  try {
    aiData = JSON.parse(raw);
  } catch (parseErr) {
    console.error(
      "[generateItineraryAI] JSON parse failed:",
      raw.slice(0, 400),
    );
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  if (!aiData.days || !Array.isArray(aiData.days) || aiData.days.length === 0) {
    throw new Error("AI did not return any days. Please try again.");
  }

  // Ensure every slot has a suggestions array
  aiData.days.forEach((day) => {
    day.slots?.forEach((slot) => {
      if (!slot.suggestions) slot.suggestions = [];
    });
  });

  if (!aiData.hotelSuggestions) aiData.hotelSuggestions = [];

  return {
    aiData,
    generationTimeMs: Date.now() - start,
    modelUsed: "groq/llama-3.3-70b-versatile",
  };
}
