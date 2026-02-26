// Groq AI service for generating hotel and restaurant data.
// Used as a fallback when MongoDB has no data for a destination slug.
// Generated records are saved back to MongoDB so future requests are instant.
import Groq from "groq-sdk";
import Destination from "../models/destination.model.js";
import Hotel from "../models/hotel.model.js";
import Restaurant from "../models/resturant.model.js";

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.GROQ_API_KEY)
      throw new Error("GROQ_API_KEY is not set in .env");
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}

// ── Shared JSON parser
function parseJSON(text) {
  // Strip ```json ... ``` fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const raw = fenced ? fenced[1] : text.trim();

  // Pull out the first [ ... ] array
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrMatch) throw new Error("No JSON array found in Groq response");
  return JSON.parse(arrMatch[0]);
}

// ── Raw Groq call
async function callGroq(
  prompt,
  { model = "llama-3.3-70b-versatile", maxTokens = 2048 } = {},
) {
  const client = getClient();
  const chat = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.4, // low temp for factual/structured data
    messages: [
      {
        role: "system",
        content:
          "You are a travel data expert for India. Always respond with valid JSON only — no markdown, no prose, no explanation. Return only the raw JSON array.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });
  return chat.choices[0]?.message?.content || "";
}

// HOTELS
const HOTEL_PROMPT = (
  city,
) => `Generate a JSON array of exactly 8 real hotels in ${city}, India.
Each object must have these exact fields:
{
  "name": "exact real hotel name",
  "tier": "economy" | "standard" | "luxury",
  "starRating": 1-5,
  "pricePerNight": number in INR,
  "description": "2-sentence description",
  "amenities": ["WiFi", "Pool", "Restaurant", ...],
  "checkInTime": "12:00 PM",
  "checkOutTime": "11:00 AM",
  "website": "https://... or empty string",
  "address": "brief address in ${city}",
  "rating": 3.5-5.0,
  "reviewCount": realistic integer,
  "tag": "short tag e.g. Heritage Stay, Budget Pick, 5-Star",
  "mapLat": latitude as number,
  "mapLng": longitude as number
}
Realistic INR prices: economy ₹500-₹2500, standard ₹2500-₹8000, luxury ₹8000-₹50000.
Include a mix of all three tiers. Use real existing hotels only.
Return ONLY the JSON array.`;

/**
 * Generate hotels for a city via Groq and save them to MongoDB.
 * Returns the saved hotel documents.
 */
export async function generateAndSaveHotels(cityName, destinationDoc) {
  const raw = await callGroq(HOTEL_PROMPT(cityName));
  const parsed = parseJSON(raw);

  const docs = parsed
    .map((h) => ({
      destination: destinationDoc._id,
      name: String(h.name || "").trim(),
      tier: ["economy", "standard", "luxury"].includes(h.tier)
        ? h.tier
        : "standard",
      starRating: Math.min(5, Math.max(1, Number(h.starRating) || 3)),
      pricePerNight: Number(h.pricePerNight) || 2000,
      description: String(h.description || ""),
      amenities: Array.isArray(h.amenities) ? h.amenities.map(String) : [],
      checkInTime: h.checkInTime || "12:00 PM",
      checkOutTime: h.checkOutTime || "11:00 AM",
      website: String(h.website || ""),
      address: String(h.address || ""),
      rating: Math.min(5, Math.max(0, Number(h.rating) || 4.0)),
      reviewCount: Math.max(0, Number(h.reviewCount) || 0),
      tag: String(h.tag || ""),
      mapLat: Number(h.mapLat) || null,
      mapLng: Number(h.mapLng) || null,
      // Use a consistent Unsplash image per tier so cards never break
      imageUrl: HOTEL_IMAGE[h.tier] || HOTEL_IMAGE.standard,
      isActive: true,
    }))
    .filter((h) => h.name); // drop any objects with empty name

  const saved = await Hotel.insertMany(docs, { ordered: false }).catch((e) => {
    // insertMany can partially succeed — return what succeeded
    console.warn("[groqService] Hotel insertMany partial error:", e.message);
    return [];
  });

  console.log(
    `[groqService] Saved ${saved.length} AI hotels for "${cityName}"`,
  );
  return saved;
}

// RESTAURANTS
const RESTAURANT_PROMPT = (
  city,
) => `Generate a JSON array of exactly 10 real restaurants in ${city}, India.
Each object must have these exact fields:
{
  "name": "exact real restaurant name",
  "cuisineType": "e.g. North Indian, Mughlai, South Indian, Seafood, Continental",
  "pricePerPerson": number in INR,
  "priceRange": "budget" | "mid" | "premium",
  "isVeg": true or false,
  "mustTryDishes": "dish1, dish2, dish3",
  "description": "2-sentence description",
  "address": "brief address in ${city}",
  "openTime": "e.g. 11:00 AM",
  "closeTime": "e.g. 11:00 PM",
  "rating": 3.5-5.0,
  "reviewCount": realistic integer,
  "website": "https://... or empty string",
  "zomatoUrl": "direct Zomato listing URL or empty string",
  "swiggyUrl": "direct Swiggy listing URL or empty string",
  "mapLat": latitude as number,
  "mapLng": longitude as number
}
Realistic INR prices: budget ₹100-₹500, mid ₹500-₹1200, premium ₹1200+.
Include a mix of budget/mid/premium and veg/non-veg.
Return ONLY the JSON array.`;

/**
 * Generate restaurants for a city via Groq and save them to MongoDB.
 * Returns the saved restaurant documents.
 */
export async function generateAndSaveRestaurants(cityName, destinationDoc) {
  const raw = await callGroq(RESTAURANT_PROMPT(cityName));
  const parsed = parseJSON(raw);

  const docs = parsed
    .map((r) => ({
      destination: destinationDoc._id,
      name: String(r.name || "").trim(),
      cuisineType: String(r.cuisineType || "Indian"),
      pricePerPerson: Number(r.pricePerPerson) || 400,
      priceRange: ["budget", "mid", "premium"].includes(r.priceRange)
        ? r.priceRange
        : "mid",
      isVeg: Boolean(r.isVeg),
      mustTryDishes: String(r.mustTryDishes || ""),
      description: String(r.description || ""),
      address: String(r.address || ""),
      openTime: String(r.openTime || ""),
      closeTime: String(r.closeTime || ""),
      rating: Math.min(5, Math.max(0, Number(r.rating) || 4.0)),
      reviewCount: Math.max(0, Number(r.reviewCount) || 0),
      website: String(r.website || ""),
      zomatoUrl: String(r.zomatoUrl || ""),
      swiggyUrl: String(r.swiggyUrl || ""),
      mapLat: Number(r.mapLat) || null,
      mapLng: Number(r.mapLng) || null,
      imageUrl: FOOD_IMAGE[r.priceRange] || FOOD_IMAGE.mid,
      isActive: true,
    }))
    .filter((r) => r.name);

  const saved = await Restaurant.insertMany(docs, { ordered: false }).catch(
    (e) => {
      console.warn(
        "[groqService] Restaurant insertMany partial error:",
        e.message,
      );
      return [];
    },
  );

  console.log(
    `[groqService] Saved ${saved.length} AI restaurants for "${cityName}"`,
  );
  return saved;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESTINATION UPSERT
// ─────────────────────────────────────────────────────────────────────────────
// When the frontend searches a city that doesn't exist in our Destination
// collection, we create a minimal Destination document so hotels/restaurants
// can be linked to it via ObjectId ref.
// ─────────────────────────────────────────────────────────────────────────────

const DEST_PROMPT = (
  city,
) => `Return a single JSON object (not an array) describing the Indian city "${city}" for a travel app.
Fields:
{
  "state": "Indian state name",
  "region": "North India | South India | East India | West India | Central India | Northeast India",
  "category": "Heritage" | "Beaches" | "Hills" | "Backwaters" | "Wildlife" | "Spiritual" | "Adventure" | "Nature",
  "description": "2-sentence travel description",
  "bestSeason": "e.g. Oct–Mar",
  "avgDurationDays": 3-7,
  "mapLat": latitude,
  "mapLng": longitude
}
Return ONLY the JSON object.`;

export async function upsertDestination(cityName) {
  const slug = cityName.toLowerCase().trim().replace(/\s+/g, "-");

  // Return existing if already in DB
  const existing = await Destination.findOne({ slug });
  if (existing) return existing;

  // Generate via Groq
  const raw = await callGroq(DEST_PROMPT(cityName), { maxTokens: 512 });

  // Parse single object (not array)
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const clean = (fenced ? fenced[1] : raw).trim();
  const objStr = clean.match(/\{[\s\S]*\}/)?.[0];
  if (!objStr)
    throw new Error(`Could not parse destination JSON for "${cityName}"`);
  const d = JSON.parse(objStr);

  const VALID_CATEGORIES = [
    "Heritage",
    "Beaches",
    "Hills",
    "Backwaters",
    "Wildlife",
    "Spiritual",
    "Adventure",
    "Nature",
  ];

  const doc = await Destination.create({
    name: cityName.trim(),
    slug,
    state: String(d.state || "India"),
    region: String(d.region || "India"),
    category: VALID_CATEGORIES.includes(d.category) ? d.category : "Nature",
    description: String(d.description || `Explore ${cityName}, India.`),
    heroImageUrl:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1920&q=90",
    bestSeason: String(d.bestSeason || "Oct–Mar"),
    avgDurationDays: Number(d.avgDurationDays) || 4,
    mapLat: Number(d.mapLat) || null,
    mapLng: Number(d.mapLng) || null,
    pricing: [
      {
        tier: "economy",
        hotelMinPrice: 500,
        hotelMaxPrice: 2500,
        foodCostPerDay: 400,
        transportCostPerDay: 300,
      },
      {
        tier: "standard",
        hotelMinPrice: 2500,
        hotelMaxPrice: 8000,
        foodCostPerDay: 1200,
        transportCostPerDay: 900,
      },
      {
        tier: "luxury",
        hotelMinPrice: 8000,
        hotelMaxPrice: 50000,
        foodCostPerDay: 4000,
        transportCostPerDay: 3000,
      },
    ],
    isActive: true,
  });

  console.log(
    `[groqService] Created destination "${cityName}" (slug: ${slug})`,
  );
  return doc;
}

// ─────────────────────────────────────────────────────────────────────────────
// Consistent Unsplash fallback images
// ─────────────────────────────────────────────────────────────────────────────
const HOTEL_IMAGE = {
  economy:
    "https://images.unsplash.com/photo-1590050811270-c33c6df97517?auto=format&fit=crop&w=700&q=80",
  standard:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80",
  luxury:
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=700&q=80",
};

const FOOD_IMAGE = {
  budget:
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=700&q=80",
  mid: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=700&q=80",
  premium:
    "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=700&q=80",
};
