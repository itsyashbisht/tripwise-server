import { v4 as uuidv4 } from 'uuid';
import Destination from '../models/destination.model.js';
import Attraction from '../models/attraction.model.js';
import Restaurant from '../models/resturant.model.js';
import Hotel from '../models/hotel.model.js';
import Itinerary from '../models/itinearary.model.js';

import { buildItineraryPrompt } from '../services/promptBuilder.js';
import { generateItineraryAI } from '../services/itinearary.js';

// ── POST /api/generate ───────────────────────────────────────
// The core endpoint: calls GROQ AI → saves full itinerary → returns it
export const generateItinerary = async (req, res, next) => {
  try {
    const {
      destination: destInput,
      originCity,
      days,
      startDate,
      endDate,
      adults = 2,
      children = 0,
      tier,
      interests = [],
      dailyBudgetPerPerson = 3000,
    } = req.body;
    
    // ── Validate required fields ─────────────────────────────
    if (!destInput || !originCity || !days || !tier)
      return res.status(400).json({ error: 'destination, originCity, days and tier are required.' });
    
    if (!['economy', 'standard', 'luxury'].includes(tier.toLowerCase()))
      return res.status(400).json({ error: 'tier must be economy, standard or luxury.' });
    
    const normalTier = tier.toLowerCase();
    
    // ── 1. Look up destination in DB ─────────────────────────
    const destName = destInput.split(',')[0].trim();
    const destination = await Destination.findOne({
      isActive: true,
      $or: [
        { name: { $regex: destName, $options: 'i' } },
        { slug: destName.toLowerCase().replace(/\s+/g, '-') },
      ],
    });
    
    let attractions = [];
    let restaurants = [];
    let hotels = [];
    
    if (destination) {
      [attractions, restaurants, hotels] = await Promise.all([
        Attraction.find({
          destination: destination._id,
          isActive: true
        }).limit(15).lean(),
        Restaurant.find({
          destination: destination._id,
          isActive: true
        }).sort({
          rating: -1
        }).limit(10).lean(),
        Hotel.find({
          destination: destination._id,
          tier: normalTier,
          isActive: true
        }).limit(5).lean(),
      ]);
    }
    
    // ── 2. Build prompt + call Claude ────────────────────────
    const prompt = buildItineraryPrompt({
      destination: destInput,
      originCity,
      days: Number(days),
      adults: Number(adults),
      children: Number(children),
      tier: normalTier,
      interests,
      dailyBudgetPerPerson: Number(dailyBudgetPerPerson),
      attractions,
      restaurants,
      hotels,
    });
    
    const { aiData: aiResult, generationTimeMs, modelUsed } = await generateItineraryAI(prompt);
    
    // ── 3. Resolve or create destination document ────────────
    let destinationId = destination?._id || null;
    if (!destinationId) {
      // Auto-create a minimal destination so itinerary has a ref
      const slug = `${destName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const newDest = await Destination.create({
        name: destName,
        slug,
        state: destInput.split(',')[1]?.trim() || 'India',
        category: 'Heritage',
        description: `AI-generated destination: ${destInput}`,
        heroImageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1920&q=90',
        bestSeason: 'Oct–Mar',
      });
      destinationId = newDest._id;
    }
    
    // ── 4. Build budget breakdown for all 3 tiers ────────────
    const budgetBreakdown = ['economy', 'standard', 'luxury'].map(t => {
      console.log(aiResult);
      const b = aiResult.budgetEstimate?.[t] || {};
      return {
        tier: t,
        accommodation: b.accommodation || 0,
        food: b.food || 0,
        transport: b.transport || 0,
        entryFees: b.entryFees || 0,
        miscellaneous: b.misc || 0,
        total: b.total || 0,
        perPerson: b.perPerson || 0,
      };
    });
    
    // ── 5. Build hotel refs from DB ───────────────────────────
    const hotelEmbeds = hotels.slice(0, 3).map(h => ({
      hotel: h._id,
      tier: normalTier,
      pricePerNight: h.pricePerNight,
      isSelected: true,
      checkIn: startDate ? new Date(startDate) : null,
      checkOut: endDate ? new Date(endDate) : null,
    }));
    
    // ── 6. Build day + slot documents ────────────────────────
    const dayDocs = (aiResult.days || []).map((day, di) => ({
      dayNumber: day.dayNumber || di + 1,
      date: startDate
        ? new Date(new Date(startDate).getTime() + di * 86400000)
        : null,
      title: day.title || `Day ${di + 1}`,
      summary: day.summary || '',
      slots: (day.slots || []).map((slot, si) => ({
        slotOrder: slot.slotOrder || si + 1,
        timeLabel: slot.timeLabel || '',
        type: slot.type || 'attraction',
        title: slot.title || '',
        description: slot.description || '',
        durationMins: slot.durationMins || null,
        estimatedCost: slot.estimatedCost || 0,
        aiTip: slot.aiTip || '',
      })),
    }));
    
    // ── 7. Save full itinerary to MongoDB ────────────────────
    const itinerary = await Itinerary.create({
      user: req.user?._id || null,
      destination: destinationId,
      destinationName: destInput,
      originCity,
      title: aiResult.title || `${Number(days)}-Day ${destName} Itinerary`,
      totalDays: Number(days),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      adults: Number(adults),
      children: Number(children),
      budgetTier: normalTier,
      interests,
      dailyBudgetPerPerson: Number(dailyBudgetPerPerson),
      shareToken: uuidv4(),
      status: 'generated',
      aiModelUsed: modelUsed,
      generationTimeMs,
      estimatedCostEconomy: budgetBreakdown.find(b => b.tier === 'economy')?.total || null,
      estimatedCostStandard: budgetBreakdown.find(b => b.tier === 'standard')?.total || null,
      estimatedCostLuxury: budgetBreakdown.find(b => b.tier === 'luxury')?.total || null,
      travelTips: aiResult.travelTips || [],
      bestTimeToVisit: aiResult.bestTimeToVisit || '',
      localPhrases: aiResult.localPhrases || [],
      days: dayDocs,
      hotels: hotelEmbeds,
      budgetBreakdown,
    });
    
    // Populate hotels for response
    await itinerary.populate('hotels.hotel', 'name imageUrl starRating pricePerNight rating amenities');
    await itinerary.populate('destination', 'name slug heroImageUrl bestSeason');
    
    res.status(201).json({
      itinerary,
      shareUrl: `${process.env.FRONTEND_URL}/trip/${itinerary.shareToken}`,
      meta: {
        generationTimeMs,
        modelUsed,
        travelTips: aiResult.travelTips || [],
        bestTimeToVisit: aiResult.bestTimeToVisit || '',
        localPhrases: aiResult.localPhrases || [],
        hotelSuggestions: aiResult.hotelSuggestions || [],  // AI-only, not persisted to DB
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/generate/packages ───────────────────────────────
// Instant math-based package pricing — no AI call needed
export const getPackagePrices = async (req, res, next) => {
  try {
    const { days, adults, children = 0, dailyBudget = 3000 } = req.query;
    
    if (!days || !adults)
      return res.status(400).json({ error: 'days and adults query params are required.' });
    
    const d = Number(days);
    const a = Number(adults);
    const c = Number(children);
    const db = Number(dailyBudget);
    const base = db * d * (a + c * 0.5);
    
    res.json({
      packages: {
        economy: {
          perPerson: Math.round(base * 0.55 / a),
          total: Math.round(base * 0.55),
          multiplier: 0.55,
          stay: 'Budget guesthouses & hostels',
          transport: 'Trains, buses & shared cabs',
          food: 'Dhabas & street food',
          extras: ['Local guided walks', 'Street food trail', 'Budget temple visits'],
        },
        standard: {
          perPerson: Math.round(base / a),
          total: Math.round(base),
          multiplier: 1.0,
          stay: '3–4 star hotels & boutique havelis',
          transport: 'Private cab + select trains',
          food: 'Curated restaurants & local gems',
          extras: ['Guided heritage tours', 'Curated dining picks', 'Comfortable AC transport'],
        },
        luxury: {
          perPerson: Math.round(base * 2.3 / a),
          total: Math.round(base * 2.3),
          multiplier: 2.3,
          stay: 'Heritage palaces & 5-star resorts',
          transport: 'Chauffeur-driven luxury SUV',
          food: 'Fine dining & private chef',
          extras: ['Private heritage access', 'Spa & wellness daily', 'Exclusive local experiences'],
        },
      },
    });
  } catch (err) { next(err); }
};