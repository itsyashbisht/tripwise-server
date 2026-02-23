export function buildItineraryPrompt ({
  destination,
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
  const pax = `${adults} adult${adults > 1 ? 's' : ''}${
    children > 0 ? ` and ${children} child${children > 1 ? 'ren' : ''}` : ''
  }`;

  const tierDesc = {
    economy: 'budget-friendly — local transport, guesthouses, street food and dhabas. Value for money.',
    standard: 'comfortable — 3–4 star hotels, private transport, curated mid-range restaurants.',
    luxury: 'premium — heritage palace hotels, chauffeur SUV, fine dining, private guides, exclusive experiences.',
  }[tier];

  // Real data blocks (from MongoDB)
  const attractionBlock = attractions.length > 0
    ? attractions.slice(0, 12).map(a =>
      `  • ${a.name} (${a.category}) | Entry ₹${a.entryFeeIndian} Indians / ₹${a.entryFeeForeign} foreign | ~${a.visitDurationMins} min | Tip: "${a.insiderTip || 'n/a'}"`
    ).join('\n')
    : '  (No DB data — use your knowledge of this destination)';

  const restaurantBlock = restaurants.length > 0
    ? restaurants.slice(0, 8).map(r =>
      `  • ${r.name} | ${r.cuisineType} | ₹${r.pricePerPerson}/person | ${r.isVeg ? 'Veg 🟢' : 'Non-Veg 🔴'} | Must try: ${r.mustTryDishes || '—'}`
    ).join('\n')
    : '  (No DB data — suggest well-known restaurants for this destination)';

  const hotelBlock = hotels.length > 0
    ? hotels.slice(0, 4).map(h =>
      `  • ${h.name} | ₹${h.pricePerNight}/night | ${h.starRating}★ | Rating: ${h.rating}`
    ).join('\n')
    : '  (No DB data — suggest appropriate hotels for this tier and destination)';

  const interestStr = interests?.length > 0 ? interests.join(', ') : 'General sightseeing';

  return `You are TripWise AI, India's most knowledgeable and detail-oriented travel planner.

Generate a complete ${days}-day trip itinerary for the following request.

═══════════════════════════════════════════
TRIP REQUEST
═══════════════════════════════════════════
Destination:       ${destination}
Departing from:    ${originCity}
Duration:          ${days} days / nights
Travellers:        ${pax}
Budget tier:       ${tier.toUpperCase()} — ${tierDesc}
Daily budget:      ₹${dailyBudgetPerPerson}/person/day
Interests:         ${interestStr}

═══════════════════════════════════════════
AVAILABLE ATTRACTIONS (from our database)
═══════════════════════════════════════════
${attractionBlock}

═══════════════════════════════════════════
RECOMMENDED RESTAURANTS
═══════════════════════════════════════════
${restaurantBlock}

═══════════════════════════════════════════
HOTELS FOR THIS TIER
═══════════════════════════════════════════
${hotelBlock}

═══════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════
1. Create exactly ${days} days of activities with 4–6 slots per day.
2. Each slot must have a specific time (e.g. "09:00 AM").
3. Plan activities geographically — minimise unnecessary travel.
4. Include breakfast, lunch, and dinner slots each day using the restaurants above or well-known local spots.
5. Write "aiTip" from the perspective of a local expert — specific, actionable, not generic.
6. Match the budget tier strictly:
   - economy  → shared transport, guesthouses, street food, free/cheap entry spots
   - standard → private cabs, 3–4 star hotels, curated restaurants
   - luxury   → private experiences, palace hotels, fine dining, exclusive access
7. budgetEstimate must be realistic in INR for the FULL trip (not per day) for ${adults} adults${children > 0 ? ` + ${children} children` : ''}.
8. Respond ONLY with valid JSON — no markdown, no code fences, no explanation text outside the JSON.

═══════════════════════════════════════════
REQUIRED JSON STRUCTURE
═══════════════════════════════════════════
{
  "title": "X-Night [Destination] Itinerary — [Tier] Edition",
  "summary": "2-sentence overview of the whole trip",
  "days": [
    {
      "dayNumber": 1,
      "title": "Short evocative theme (e.g. City of Forts)",
      "summary": "One-sentence overview of this day",
      "slots": [
        {
          "slotOrder": 1,
          "timeLabel": "09:00 AM",
          "type": "attraction | food | transport | free",
          "title": "Activity / place name",
          "description": "What to do, see, eat — 2–3 sentences",
          "durationMins": 120,
          "estimatedCost": 200,
          "aiTip": "Specific local insider tip for this exact activity"
        }
      ]
    }
  ],
  "budgetEstimate": {
    "economy": {
      "accommodation": 0,
      "food": 0,
      "transport": 0,
      "entryFees": 0,
      "misc": 0,
      "total": 0,
      "perPerson": 0
    },
    "standard": { "accommodation": 0, "food": 0, "transport": 0, "entryFees": 0, "misc": 0, "total": 0, "perPerson": 0 },
    "luxury":   { "accommodation": 0, "food": 0, "transport": 0, "entryFees": 0, "misc": 0, "total": 0, "perPerson": 0 }
  },
  "travelTips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3",
    "Practical tip 4"
  ],
  "bestTimeToVisit": "Month range with brief reason",
  "localPhrases": [
    { "phrase": "Namaste", "meaning": "Hello / respectful greeting" },
    { "phrase": "Kitna hua?", "meaning": "How much did it cost?" }
  ]
}`;
}