import 'dotenv/config';
import mongoose from 'mongoose';
import Destination from '../src/models/destination.model.js';
import Attraction from '../src/models/attraction.model.js';
import Restaurant from '../src/models/resturant.model.js';
import Hotel from '../src/models/hotel.model.js';
import User from '../src/models/user.model.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('🌱 Connected to MongoDB. Seeding...\n');

// ── Clear existing data ────────────────────────────────────────────────────────
await Promise.all([
  Destination.deleteMany({}),
  Attraction.deleteMany({}),
  Restaurant.deleteMany({}),
  Hotel.deleteMany({}),
]);
console.log('🗑️  Cleared old seed data');

// ── Admin user ────────────────────────────────────────────────────────────────
await User.findOneAndUpdate(
  { email: 'admin@tripwise.in' },
  { name: 'TripWise Admin', email: 'admin@tripwise.in', passwordHash: 'Admin@1234', role: 'admin', isVerified: true },
  { upsert: true, setDefaultsOnInsert: true }
);
console.log('👤 Admin user ready: admin@tripwise.in / Admin@1234');

// ─────────────────────────────────────────────────────────────────────────────
// JAIPUR
// ─────────────────────────────────────────────────────────────────────────────
const jaipur = await Destination.create({
  name: 'Jaipur', slug: 'jaipur', state: 'Rajasthan', region: 'North India',
  category: 'Heritage',
  description: 'The Pink City — forts, palaces, and bazaars soaked in 500 years of royal Rajput history.',
  heroImageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1920&q=90',
  mapLat: 26.9124, mapLng: 75.7873, bestSeason: 'Oct–Mar', avgDurationDays: 4,
  pricing: [
    { tier: 'economy', hotelMinPrice: 500, hotelMaxPrice: 1500, foodCostPerDay: 400, transportCostPerDay: 300 },
    { tier: 'standard', hotelMinPrice: 2000, hotelMaxPrice: 5000, foodCostPerDay: 1200, transportCostPerDay: 900 },
    { tier: 'luxury', hotelMinPrice: 8000, hotelMaxPrice: 30000, foodCostPerDay: 4000, transportCostPerDay: 3000 },
  ],
});

await Attraction.insertMany([
  {
    destinationId: jaipur._id,
    name: 'Amber Fort',
    category: 'Fort',
    entryFeeIndian: 200,
    entryFeeForeign: 550,
    visitDurationMins: 150,
    insiderTip: 'Arrive by 9AM for the best light and no crowds. The Sheesh Mahal mirror palace needs natural light to sparkle.',
    description: 'Magnificent hilltop Rajput fort with mirror palace, elephant courtyard and sweeping valley views.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=700&q=80',
    openTime: '08:00',
    closeTime: '17:30'
  },
  {
    destinationId: jaipur._id,
    name: 'City Palace',
    category: 'Palace',
    entryFeeIndian: 400,
    entryFeeForeign: 1000,
    visitDurationMins: 120,
    insiderTip: 'Don\'t miss the Peacock Gate and the royal textile gallery — most tourists skip the upper floors.',
    description: 'Vast royal palace complex still partially inhabited by the Jaipur royal family.',
    imageUrl: 'https://images.unsplash.com/photo-1515511856280-7b23f68d2996?auto=format&fit=crop&w=700&q=80',
    openTime: '09:30',
    closeTime: '17:00'
  },
  {
    destinationId: jaipur._id,
    name: 'Hawa Mahal',
    category: 'Monument',
    entryFeeIndian: 50,
    entryFeeForeign: 250,
    visitDurationMins: 60,
    insiderTip: 'Photograph it from the tea stall directly across the road at street level for the classic shot.',
    description: 'Iconic five-storey facade with 953 windows, built so royal ladies could observe street life unseen.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=700&q=80',
    openTime: '09:00',
    closeTime: '17:00'
  },
  {
    destinationId: jaipur._id,
    name: 'Nahargarh Fort',
    category: 'Fort',
    entryFeeIndian: 200,
    entryFeeForeign: 550,
    visitDurationMins: 90,
    insiderTip: 'Come 30 minutes before sunset for the most breathtaking panoramic view of the Pink City.',
    description: 'Hillside fort with the best panoramic views of Jaipur — perfect sunset spot.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=700&q=80',
    openTime: '10:00',
    closeTime: '17:30'
  },
  {
    destinationId: jaipur._id,
    name: 'Jantar Mantar',
    category: 'Monument',
    entryFeeIndian: 200,
    entryFeeForeign: 500,
    visitDurationMins: 75,
    insiderTip: 'The Samrat Yantra sundial is accurate to 2 seconds — a 300-year-old engineering feat still working today.',
    description: 'UNESCO World Heritage astronomical observatory with 19 giant instruments built in 1734.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=700&q=80',
    openTime: '09:00',
    closeTime: '16:30'
  },
  {
    destinationId: jaipur._id,
    name: 'Jal Mahal',
    category: 'Lake',
    entryFeeIndian: 0,
    entryFeeForeign: 0,
    visitDurationMins: 40,
    insiderTip: 'You can\'t enter the palace but the lake reflection before 9AM is stunning — come early for the best light.',
    description: 'Palace appearing to float in the middle of Man Sagar Lake — one of Jaipur\'s most photographed sights.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=700&q=80'
  },
  {
    destinationId: jaipur._id,
    name: 'Johari Bazaar',
    category: 'Market',
    entryFeeIndian: 0,
    entryFeeForeign: 0,
    visitDurationMins: 90,
    insiderTip: 'Bargain to 60% of the asking price. Best for silver jewelry and block-print textiles — go in the evening.',
    description: 'The main jewelry and textile bazaar of Jaipur, most vibrant after sunset.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=700&q=80'
  },
]);

await Restaurant.insertMany([
  {
    destinationId: jaipur._id,
    name: 'Laxmi Misthan Bhandar',
    cuisineType: 'Rajasthani Veg Thali',
    pricePerPerson: 350,
    priceRange: 'budget',
    isVeg: true,
    mustTryDishes: 'Dal Baati Churma, Ghevar, Cold Lassi',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    destinationId: jaipur._id,
    name: 'Handi Restaurant',
    cuisineType: 'Mughlai Non-Veg',
    pricePerPerson: 650,
    priceRange: 'mid',
    isVeg: false,
    mustTryDishes: 'Laal Maas, Murgh Handi, Biryani',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80'
  },
  {
    destinationId: jaipur._id,
    name: '1135 AD',
    cuisineType: 'Rajasthani Fine Dining',
    pricePerPerson: 1500,
    priceRange: 'premium',
    isVeg: true,
    mustTryDishes: 'Royal Rajput Thali, Ker Sangri, Laal Maas',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=400&q=80'
  },
  {
    destinationId: jaipur._id,
    name: 'Chokhi Dhani Village',
    cuisineType: 'Rajasthani Cultural Dining',
    pricePerPerson: 900,
    priceRange: 'mid',
    isVeg: true,
    mustTryDishes: 'Village Thali, Bajra Rotla, Makki ki Roti',
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'
  },
]);

await Hotel.insertMany([
  {
    destinationId: jaipur._id,
    name: 'Zostel Jaipur',
    tier: 'economy',
    starRating: 2,
    pricePerNight: 600,
    rating: 4.5,
    amenities: ['WiFi', 'AC', 'Rooftop', 'Locker', 'Common Kitchen'],
    imageUrl: 'https://images.unsplash.com/photo-1590050811270-c33c6df97517?auto=format&fit=crop&w=400&q=80',
    description: 'Vibrant backpacker hostel in Bani Park with rooftop hangout area.'
  },
  {
    destinationId: jaipur._id,
    name: 'Hotel Pearl Palace',
    tier: 'economy',
    starRating: 3,
    pricePerNight: 1200,
    rating: 4.7,
    amenities: ['WiFi', 'AC', 'Restaurant', 'Rooftop'],
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=400&q=80',
    description: 'Award-winning budget heritage hotel with excellent rooftop restaurant.'
  },
  {
    destinationId: jaipur._id,
    name: 'Umaid Bhawan Heritage',
    tier: 'standard',
    starRating: 4,
    pricePerNight: 2800,
    rating: 4.6,
    amenities: ['WiFi', 'Pool', 'AC', 'Restaurant', 'Bar', 'Spa'],
    imageUrl: 'https://images.unsplash.com/photo-1515511856280-7b23f68d2996?auto=format&fit=crop&w=400&q=80',
    description: 'Beautiful heritage property with courtyard gardens and Rajput architecture.'
  },
  {
    destinationId: jaipur._id,
    name: 'Alsisar Haveli',
    tier: 'standard',
    starRating: 4,
    pricePerNight: 4200,
    rating: 4.8,
    amenities: ['WiFi', 'Rooftop Pool', 'AC', 'Spa', 'Restaurant', 'Bar'],
    imageUrl: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=400&q=80',
    description: 'Stunning heritage haveli with rooftop pool and authentic Rajput décor.'
  },
  {
    destinationId: jaipur._id,
    name: 'Rambagh Palace',
    tier: 'luxury',
    starRating: 5,
    pricePerNight: 28000,
    rating: 4.9,
    amenities: ['Pool', 'Spa', 'Fine Dining', 'Polo', 'WiFi', 'Butler', 'Gym', 'Tennis'],
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80',
    description: 'Former royal residence — the most iconic palace hotel in India.'
  },
  {
    destinationId: jaipur._id,
    name: 'Jai Mahal Palace',
    tier: 'luxury',
    starRating: 5,
    pricePerNight: 18000,
    rating: 4.8,
    amenities: ['Pool', 'Spa', 'Fine Dining', 'WiFi', 'Gardens', 'Bar', 'Gym'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
    description: 'Taj Hotels property set in 18 acres of stunning Mughal gardens.'
  },
]);
console.log('✅ Jaipur seeded (7 attractions, 4 restaurants, 6 hotels)');

// ─────────────────────────────────────────────────────────────────────────────
// GOA
// ─────────────────────────────────────────────────────────────────────────────
const goa = await Destination.create({
  name: 'Goa', slug: 'goa', state: 'Goa', region: 'West India',
  category: 'Beaches',
  description: 'Sun-drenched shores, spiced seafood, and a laid-back Portuguese coastal vibe.',
  heroImageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=90',
  mapLat: 15.2993, mapLng: 74.1240, bestSeason: 'Nov–Feb', avgDurationDays: 5,
  pricing: [
    { tier: 'economy', hotelMinPrice: 600, hotelMaxPrice: 2000, foodCostPerDay: 500, transportCostPerDay: 400 },
    { tier: 'standard', hotelMinPrice: 3000, hotelMaxPrice: 7000, foodCostPerDay: 1500, transportCostPerDay: 1200 },
    { tier: 'luxury', hotelMinPrice: 10000, hotelMaxPrice: 35000, foodCostPerDay: 5000, transportCostPerDay: 3500 },
  ],
});

await Attraction.insertMany([
  {
    destinationId: goa._id,
    name: 'Baga Beach',
    category: 'Beach',
    entryFeeIndian: 0,
    entryFeeForeign: 0,
    visitDurationMins: 180,
    insiderTip: 'Rent a sunbed from the shack directly — skip the touts on the road. Tito\'s Lane comes alive after 10PM.',
    description: 'Goa\'s most famous beach — water sports, shacks, music and a party scene.'
  },
  {
    destinationId: goa._id,
    name: 'Basilica of Bom Jesus',
    category: 'Monument',
    entryFeeIndian: 0,
    entryFeeForeign: 0,
    visitDurationMins: 60,
    insiderTip: 'The body of St. Francis Xavier is displayed every 10 years — check if it\'s a viewing year when you visit.',
    description: 'UNESCO Heritage church housing the remains of St. Francis Xavier, built in 1605.'
  },
  {
    destinationId: goa._id,
    name: 'Dudhsagar Falls',
    category: 'Nature',
    entryFeeIndian: 400,
    entryFeeForeign: 400,
    visitDurationMins: 240,
    insiderTip: 'Only accessible Jun–Sep in monsoon when the falls are full. Book a jeep from Mollem village, not online agents.',
    description: 'Spectacular four-tiered waterfall on the Goa–Karnataka border, best in monsoon.'
  },
  {
    destinationId: goa._id,
    name: 'Old Goa Heritage Walk',
    category: 'Monument',
    entryFeeIndian: 0,
    entryFeeForeign: 0,
    visitDurationMins: 120,
    insiderTip: 'Start at Se Cathedral and walk south. Visit on a weekday morning — Sunday crowds are heavy with locals.',
    description: 'Walk through clusters of UNESCO-listed Portuguese churches and cathedrals.'
  },
]);

await Restaurant.insertMany([
  {
    destinationId: goa._id,
    name: 'Vinayak Family Restaurant',
    cuisineType: 'Goan Seafood',
    pricePerPerson: 400,
    priceRange: 'budget',
    isVeg: false,
    mustTryDishes: 'Fish Curry Rice, Prawn Balchão, Crab Xec Xec',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80'
  },
  {
    destinationId: goa._id,
    name: 'Gunpowder',
    cuisineType: 'South Indian Coastal',
    pricePerPerson: 800,
    priceRange: 'mid',
    isVeg: false,
    mustTryDishes: 'Pandi Curry, Appam, Neer Dosa',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    destinationId: goa._id,
    name: 'Thalassa Greek Restaurant',
    cuisineType: 'Greek Mediterranean',
    pricePerPerson: 1800,
    priceRange: 'premium',
    isVeg: false,
    mustTryDishes: 'Grilled Octopus, Lamb Souvlaki, Mezze Platter',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=400&q=80'
  },
]);

await Hotel.insertMany([
  {
    destinationId: goa._id,
    name: 'Jolly Johny Guest House',
    tier: 'economy',
    starRating: 2,
    pricePerNight: 800,
    rating: 4.2,
    amenities: ['WiFi', 'AC', 'Beach Access'],
    description: 'Simple clean rooms 2 minutes from Baga beach.'
  },
  {
    destinationId: goa._id,
    name: 'Lemon Tree Amarante Beach',
    tier: 'standard',
    starRating: 4,
    pricePerNight: 4500,
    rating: 4.4,
    amenities: ['Pool', 'WiFi', 'AC', 'Restaurant', 'Beach Access', 'Bar'],
    description: '4-star beach resort with two pools and direct beach access.'
  },
  {
    destinationId: goa._id,
    name: 'Taj Fort Aguada Resort',
    tier: 'luxury',
    starRating: 5,
    pricePerNight: 22000,
    rating: 4.8,
    amenities: ['Pool', 'Spa', 'Fine Dining', 'WiFi', 'Beach', 'Tennis', 'Gym'],
    description: 'Iconic Taj property inside a 17th-century Portuguese fort overlooking the Arabian Sea.'
  },
]);
console.log('✅ Goa seeded');

// ─────────────────────────────────────────────────────────────────────────────
// KERALA
// ─────────────────────────────────────────────────────────────────────────────
const kerala = await Destination.create({
  name: 'Kerala', slug: 'kerala', state: 'Kerala', region: 'South India',
  category: 'Backwaters',
  description: 'God\'s Own Country — backwaters, tea gardens, Ayurveda, and houseboat sunsets.',
  heroImageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=90',
  mapLat: 9.9312, mapLng: 76.2673, bestSeason: 'Sep–Mar', avgDurationDays: 6,
  pricing: [
    { tier: 'economy', hotelMinPrice: 800, hotelMaxPrice: 2500, foodCostPerDay: 450, transportCostPerDay: 350 },
    { tier: 'standard', hotelMinPrice: 3500, hotelMaxPrice: 8000, foodCostPerDay: 1400, transportCostPerDay: 1100 },
    { tier: 'luxury', hotelMinPrice: 12000, hotelMaxPrice: 40000, foodCostPerDay: 5000, transportCostPerDay: 4000 },
  ],
});

await Attraction.insertMany([
  {
    destinationId: kerala._id,
    name: 'Alleppey Backwaters Houseboat',
    category: 'Nature',
    entryFeeIndian: 0,
    entryFeeForeign: 0,
    visitDurationMins: 480,
    insiderTip: 'Book a houseboat for overnight — sunset on the backwaters with a chef on board is an experience like no other.',
    description: 'Cruise Kerala\'s famous network of canals, lagoons and lakes on a traditional rice-boat houseboat.'
  },
  {
    destinationId: kerala._id,
    name: 'Munnar Tea Estates',
    category: 'Nature',
    entryFeeIndian: 100,
    entryFeeForeign: 100,
    visitDurationMins: 180,
    insiderTip: 'Visit the KDHP Tea Museum at 9AM sharp before bus groups arrive. Buy factory-direct tea — it\'s half the price of shops.',
    description: 'Rolling hills covered in emerald tea gardens at 1,600m altitude in the Western Ghats.'
  },
  {
    destinationId: kerala._id,
    name: 'Periyar Wildlife Sanctuary',
    category: 'Nature',
    entryFeeIndian: 300,
    entryFeeForeign: 1200,
    visitDurationMins: 240,
    insiderTip: 'The 7AM boat ride has the best wildlife sightings. Elephants come to the lake edge to drink in the morning.',
    description: 'Tiger reserve and elephant sanctuary with boat safaris on a lake surrounded by forest.'
  },
]);

await Restaurant.insertMany([
  {
    destinationId: kerala._id,
    name: 'Dhe Puttu',
    cuisineType: 'Kerala Breakfast & Thali',
    pricePerPerson: 250,
    priceRange: 'budget',
    isVeg: false,
    mustTryDishes: 'Puttu & Kadala Curry, Appam, Kerala Parotta',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    destinationId: kerala._id,
    name: 'Malabar Junction',
    cuisineType: 'Malabar Coastal Fine Dining',
    pricePerPerson: 1200,
    priceRange: 'premium',
    isVeg: false,
    mustTryDishes: 'Karimeen Pollichathu, Prawn Moilee, Malabar Fish Curry',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=400&q=80'
  },
]);

await Hotel.insertMany([
  {
    destinationId: kerala._id,
    name: 'Lake Palace Homestay',
    tier: 'economy',
    starRating: 2,
    pricePerNight: 1000,
    rating: 4.3,
    amenities: ['WiFi', 'AC', 'Meals', 'Backwater View'],
    description: 'Family-run homestay on the backwater banks with home-cooked Kerala meals.'
  },
  {
    destinationId: kerala._id,
    name: 'Spice Village CGH Earth',
    tier: 'standard',
    starRating: 4,
    pricePerNight: 6000,
    rating: 4.7,
    amenities: ['Pool', 'WiFi', 'AC', 'Restaurant', 'Spa', 'Nature Walks'],
    description: 'Eco-resort in Thekkady inside the Periyar buffer zone — sustainably run.'
  },
  {
    destinationId: kerala._id,
    name: 'Kumarakom Lake Resort',
    tier: 'luxury',
    starRating: 5,
    pricePerNight: 18000,
    rating: 4.9,
    amenities: ['Pool', 'Spa', 'Fine Dining', 'WiFi', 'Houseboat', 'Ayurveda', 'Gym'],
    description: 'Legendary heritage resort on Vembanad Lake with private cottage villas.'
  },
]);
console.log('✅ Kerala seeded');

// ─────────────────────────────────────────────────────────────────────────────
// LADAKH
// ─────────────────────────────────────────────────────────────────────────────
const ladakh = await Destination.create({
  name: 'Ladakh', slug: 'ladakh', state: 'Ladakh', region: 'North India',
  category: 'Adventure',
  description: 'High-altitude desert, Buddhist monasteries, and sky-high mountain passes above 5,000m.',
  heroImageUrl: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1920&q=90',
  mapLat: 34.1526, mapLng: 77.5771, bestSeason: 'May–Sep', avgDurationDays: 7,
  pricing: [
    { tier: 'economy', hotelMinPrice: 700, hotelMaxPrice: 2000, foodCostPerDay: 500, transportCostPerDay: 600 },
    { tier: 'standard', hotelMinPrice: 3000, hotelMaxPrice: 7000, foodCostPerDay: 1500, transportCostPerDay: 2000 },
    { tier: 'luxury', hotelMinPrice: 10000, hotelMaxPrice: 30000, foodCostPerDay: 4000, transportCostPerDay: 5000 },
  ],
});

await Attraction.insertMany([
  {
    destinationId: ladakh._id,
    name: 'Pangong Tso Lake',
    category: 'Lake',
    entryFeeIndian: 400,
    entryFeeForeign: 400,
    visitDurationMins: 300,
    insiderTip: 'Spend the night at a lakeside camp — the pre-dawn sky at 4,350m altitude is absolutely otherworldly.',
    description: 'Stunning high-altitude salt lake at 4,350m, changing colours from blue to green to red across 134km.'
  },
  {
    destinationId: ladakh._id,
    name: 'Thiksey Monastery',
    category: 'Temple',
    entryFeeIndian: 50,
    entryFeeForeign: 100,
    visitDurationMins: 90,
    insiderTip: 'Attend the 6AM morning prayer — monks in crimson robes chanting at sunrise is something you\'ll never forget.',
    description: '12-storey monastery resembling the Potala Palace in Lhasa, perched on a hilltop above the Indus Valley.'
  },
  {
    destinationId: ladakh._id,
    name: 'Khardung La Pass',
    category: 'Adventure',
    entryFeeIndian: 0,
    entryFeeForeign: 0,
    visitDurationMins: 60,
    insiderTip: 'Don\'t spend more than 20 min at the top — altitude sickness hits fast. Acclimatize in Leh for 2 days first.',
    description: 'One of the world\'s highest motorable passes at 5,359m — gateway to the Nubra Valley.'
  },
  {
    destinationId: ladakh._id,
    name: 'Nubra Valley & Bactrian Camels',
    category: 'Nature',
    entryFeeIndian: 200,
    entryFeeForeign: 200,
    visitDurationMins: 240,
    insiderTip: 'Stay in Hunder village to ride the double-humped Bactrian camels at dusk — an experience unique to this place.',
    description: 'Spectacular double valley at 3,100m with sand dunes, ancient monasteries and rare Bactrian camels.'
  },
]);

await Restaurant.insertMany([
  {
    destinationId: ladakh._id,
    name: 'Bon Appetit',
    cuisineType: 'Tibetan & Ladakhi',
    pricePerPerson: 400,
    priceRange: 'budget',
    isVeg: true,
    mustTryDishes: 'Thukpa, Momos, Skyu (Ladakhi pasta)',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    destinationId: ladakh._id,
    name: 'The Tibetan Kitchen',
    cuisineType: 'Tibetan',
    pricePerPerson: 350,
    priceRange: 'budget',
    isVeg: false,
    mustTryDishes: 'Yak butter tea, Thenthuk, Kothey momos',
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80'
  },
]);

await Hotel.insertMany([
  {
    destinationId: ladakh._id,
    name: 'Tsering\'s Guest House',
    tier: 'economy',
    starRating: 2,
    pricePerNight: 800,
    rating: 4.3,
    amenities: ['WiFi', 'Meals', 'Mountain View'],
    description: 'Family-run guesthouse with homemade Ladakhi meals and stunning mountain views.'
  },
  {
    destinationId: ladakh._id,
    name: 'Stok Palace Heritage Hotel',
    tier: 'standard',
    starRating: 4,
    pricePerNight: 4500,
    rating: 4.6,
    amenities: ['WiFi', 'AC', 'Restaurant', 'Mountain View', 'Garden'],
    description: 'Converted 19th-century palace of the King of Ladakh — stay in royal rooms.'
  },
  {
    destinationId: ladakh._id,
    name: 'The Grand Dragon Ladakh',
    tier: 'luxury',
    starRating: 5,
    pricePerNight: 14000,
    rating: 4.8,
    amenities: ['Pool', 'Spa', 'Fine Dining', 'WiFi', 'Gym', 'Mountain View', 'Bar'],
    description: 'Leh\'s finest luxury hotel with stunning panoramic Himalayan views.'
  },
]);
console.log('✅ Ladakh seeded');

console.log('\n🎉 All seed data loaded successfully!');
console.log('   Destinations: Jaipur, Goa, Kerala, Ladakh');
console.log('   Admin login:  admin@tripwise.in / Admin@1234\n');

await mongoose.disconnect();