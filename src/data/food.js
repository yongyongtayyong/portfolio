// ─────────────────────────────────────────────────────────────────────────────
//  FOOD ATLAS DATA — the only file you edit to add or change a spot.
//
//  Add a place: copy any line in PLACES, change the values, save, push.
//    name     what shows on the card
//    area     must match a key in AREAS below (that's what puts it on the map)
//    rating   your score out of 10 (use null if you don't want to score it)
//    cuisine  must match a key in CUISINES below (add a new one there if needed)
//    price    1 = $, 2 = $$, 3 = $$$, 4 = $$$$
//    dish / note   optional — shown on the card if present
//
//  Lines marked  // est  have a cuisine or price Claude estimated. Fix freely.
// ─────────────────────────────────────────────────────────────────────────────

/** Cuisine label → filter group. The group drives the "Cuisine" filter on the map. */
export const CUISINES = {
  "Ramen": "Japanese", "Izakaya": "Japanese", "Katsu": "Japanese", "Kaisendon": "Japanese",
  "Teishoku": "Japanese", "Aburasoba": "Japanese", "Japanese": "Japanese",
  "Korean": "Korean", "Korean BBQ": "Korean", "Korean tofu": "Korean", "Korean bowls": "Korean",
  "Shanghainese": "Chinese & Taiwanese", "Sichuan": "Chinese & Taiwanese", "Dim sum": "Chinese & Taiwanese",
  "Fuzhou dumplings": "Chinese & Taiwanese", "Malatang": "Chinese & Taiwanese", "Lanzhou noodles": "Chinese & Taiwanese",
  "Hong Kong café": "Chinese & Taiwanese", "Cantonese": "Chinese & Taiwanese", "Chinese": "Chinese & Taiwanese",
  "Chinese takeout": "Chinese & Taiwanese", "Taiwanese": "Chinese & Taiwanese",
  "Malaysian": "Southeast Asian", "Singaporean": "Southeast Asian", "Thai": "Southeast Asian",
  "Vietnamese": "Southeast Asian", "Filipino-American": "Southeast Asian",
  "Indian": "South Asian", "Indian & Pakistani": "South Asian",
  "Halal cart": "Mediterranean & Middle Eastern", "Greek": "Mediterranean & Middle Eastern",
  "Lebanese": "Mediterranean & Middle Eastern", "Israeli": "Mediterranean & Middle Eastern",
  "Georgian": "Mediterranean & Middle Eastern", "Shawarma": "Mediterranean & Middle Eastern",
  "Pizza": "Italian & Pizza", "Detroit-style pizza": "Italian & Pizza", "Pasta": "Italian & Pizza", "Italian": "Italian & Pizza",
  "Bagels": "American", "Burgers": "American", "Smash burgers": "American", "Diner": "American", "Deli": "American",
  "Jewish deli": "American", "Brunch": "American", "Pancakes": "American", "American": "American",
  "Healthy bowls": "American", "Asian-Mexican bowls": "American", "Cajun seafood boil": "American",
  "Tacos": "Latin & Caribbean", "Mexican": "Latin & Caribbean", "Cuban": "Latin & Caribbean",
  "Dominican": "Latin & Caribbean", "Bolivian": "Latin & Caribbean", "Jamaican": "Latin & Caribbean",
  "Coffee": "Cafés & Dessert", "Vietnamese coffee": "Cafés & Dessert", "Café": "Cafés & Dessert",
  "Ice cream": "Cafés & Dessert", "Frozen yogurt": "Cafés & Dessert", "HK desserts": "Cafés & Dessert",
  "Cocktails & oysters": "Bars", "Pan-Asian cocktail bar": "Bars", "Irish pub": "Bars", "Bar food": "Bars",
};

export const GROUPS = [
  "Japanese", "Korean", "Chinese & Taiwanese", "Southeast Asian", "South Asian",
  "Mediterranean & Middle Eastern", "Italian & Pizza", "American", "Latin & Caribbean",
  "Cafés & Dessert", "Bars",
];

/** Where things are. `ll` = [lat, lng] of the neighbourhood (dots cluster around it). */
export const AREAS = {
  // Queens
  "Astoria":          { state: "ny", borough: "Queens",    ll: [40.7644, -73.9235] },
  "Sunnyside":        { state: "ny", borough: "Queens",    ll: [40.7433, -73.9196] },
  // Brooklyn
  "Williamsburg":     { state: "ny", borough: "Brooklyn",  ll: [40.7135, -73.9545] },
  // Manhattan
  "Hell's Kitchen":   { state: "ny", borough: "Manhattan", ll: [40.7628, -73.9902] },
  "Rockefeller Center": { state: "ny", borough: "Manhattan", ll: [40.7590, -73.9790] },
  "Midtown":          { state: "ny", borough: "Manhattan", ll: [40.7535, -73.9848] },
  "Koreatown":        { state: "ny", borough: "Manhattan", ll: [40.7479, -73.9866] },
  "Chelsea":          { state: "ny", borough: "Manhattan", ll: [40.7432, -74.0032] },
  "Flatiron":         { state: "ny", borough: "Manhattan", ll: [40.7400, -73.9892] },
  "West Village":     { state: "ny", borough: "Manhattan", ll: [40.7342, -74.0043] },
  "East Village":     { state: "ny", borough: "Manhattan", ll: [40.7273, -73.9845] },
  "SoHo":             { state: "ny", borough: "Manhattan", ll: [40.7236, -74.0012] },
  "Lower East Side":  { state: "ny", borough: "Manhattan", ll: [40.7172, -73.9878] },
  "Chinatown":        { state: "ny", borough: "Manhattan", ll: [40.7155, -73.9975] },
  "Tribeca":          { state: "ny", borough: "Manhattan", ll: [40.7193, -74.0098] },
  "Brooklyn Bridge":  { state: "ny", borough: "Manhattan", ll: [40.7083, -74.0046] },
  // Staten Island
  "Staten Island":    { state: "ny", borough: "Staten Island", ll: [40.6437, -74.0790] },
  // Upstate (off the city map — shown as an inset)
  "Catskills":        { state: "ny", borough: "Upstate",   ll: [42.0834, -74.3110], inset: true },
  // New Jersey
  "Lincoln Park":     { state: "nj", borough: "Jersey City", ll: [40.7262, -74.0790] },
  "West Side Ave":    { state: "nj", borough: "Jersey City", ll: [40.7148, -74.0868] },
  "Communipaw":       { state: "nj", borough: "Jersey City", ll: [40.7128, -74.0627] },
  "Jersey Gardens":   { state: "nj", borough: "Elizabeth",   ll: [40.6614, -74.1702] },
  // Abroad
  "Singapore":        { state: "sg", borough: "Singapore", ll: [1.3521, 103.8198] },
  "Bangkok":          { state: "th", borough: "Bangkok",   ll: [13.7563, 100.5018] },
  "Hsinchu":          { state: "tw", borough: "Hsinchu",   ll: [24.8138, 120.9675] },
  "Perth":            { state: "au", borough: "Perth",     ll: [-31.9523, 115.8613] },
};

/** The top level of the Food tab: countries and states. */
export const DESTINATIONS = {
  ny: { name: "New York",    country: "United States", map: "nyc", ll: [40.73, -73.99] },
  nj: { name: "New Jersey",  country: "United States", map: "nyc", ll: [40.72, -74.12] },
  sg: { name: "Singapore",   country: "Singapore",     ll: [1.3521, 103.8198] },
  th: { name: "Thailand",    country: "Thailand",      ll: [13.7563, 100.5018] },
  tw: { name: "Taiwan",      country: "Taiwan",        ll: [24.8138, 120.9675] },
  au: { name: "Australia",   country: "Australia",     ll: [-31.9523, 115.8613] },
};

export const PLACES = [
  // ── Queens ─────────────────────────────────────────────
  { name: "Moa Coffee",                 area: "Astoria", rating: 9, cuisine: "Coffee", price: 1 },
  { name: "Jazkaya",                    area: "Astoria", rating: 9, cuisine: "Izakaya", price: 2 },
  { name: "La Luna",                    area: "Astoria", rating: 8, cuisine: "Italian", price: 2 },            // est
  { name: "Olia",                       area: "Astoria", rating: 8, cuisine: "Healthy bowls", price: 2 },
  { name: "Nice Day Chinese",           area: "Astoria", rating: 8, cuisine: "Chinese takeout", price: 1 },    // est
  { name: "New York City Bagels",       area: "Astoria", rating: 7, cuisine: "Bagels", price: 1 },
  { name: "Habiba Halal Cart",          area: "Astoria", rating: 7, cuisine: "Halal cart", price: 1 },
  { name: "IHOP",                       area: "Astoria", rating: 7, cuisine: "Pancakes", price: 1 },
  { name: "Blackbird Bar",              area: "Astoria", rating: 7, cuisine: "Bar food", price: 2 },           // est
  { name: "Roseta Grill",               area: "Astoria", rating: 6, cuisine: "Halal cart", price: 1 },
  { name: "Gyro Place",                 area: "Astoria", rating: 6, cuisine: "Greek", price: 1 },
  { name: "Andrew Bellucci's Pizzeria", area: "Astoria", rating: 5, cuisine: "Pizza", price: 1 },
  { name: "Under Pressure Coffee",      area: "Astoria", rating: 5, cuisine: "Coffee", price: 1 },
  { name: "Curry Corner",               area: "Astoria", rating: 4, cuisine: "Indian", price: 1 },             // est
  { name: "Bolivian Llama Party",       area: "Sunnyside", rating: 7, cuisine: "Bolivian", price: 2 },
  { name: "Cap't Loui",                 area: "Sunnyside", rating: 7, cuisine: "Cajun seafood boil", price: 2 },

  // ── Brooklyn ───────────────────────────────────────────
  { name: "Kinhfolk",                   area: "Williamsburg", rating: 9, cuisine: "Vietnamese coffee", price: 1 },
  { name: "Mumbai Place",               area: "Williamsburg", rating: 7, cuisine: "Indian", price: 2 },        // est
  { name: "Baby Blues Luncheonette",    area: "Williamsburg", rating: 7, cuisine: "American", price: 2 },      // est
  { name: "Kaew Jao Jorm",              area: "Williamsburg", rating: 6, cuisine: "Thai", price: 2 },
  { name: "3 Times",                    area: "Williamsburg", rating: 6, cuisine: "Chinese", price: 2 },

  // ── Manhattan: Midtown & west ──────────────────────────
  { name: "The Den at Monkey Thief",    area: "Hell's Kitchen", rating: 9, cuisine: "Pan-Asian cocktail bar", price: 3 },
  { name: "Four Four South Village",    area: "Hell's Kitchen", rating: 7, cuisine: "Taiwanese", price: 2 },
  { name: "Showa Era Izakaya",          area: "Hell's Kitchen", rating: 6, cuisine: "Izakaya", price: 2 },
  { name: "MYKA",                       area: "Rockefeller Center", rating: 8, cuisine: "Frozen yogurt", price: 1 },
  { name: "Cho Dang Gol",               area: "Midtown", rating: 9, cuisine: "Korean tofu", price: 2 },
  { name: "Yoon Haeundae Galbi",        area: "Midtown", rating: 9, cuisine: "Korean BBQ", price: 3 },
  { name: "Van Leeuwen",                area: "Midtown", rating: 8, cuisine: "Ice cream", price: 1 },
  { name: "Devoción",                   area: "Midtown", rating: 8, cuisine: "Coffee", price: 1 },
  { name: "Shawarma Bay",               area: "Midtown", rating: 8, cuisine: "Shawarma", price: 1 },           // est
  { name: "Cospa Ramen",                area: "Midtown", rating: 8, cuisine: "Ramen", price: 2 },              // est
  { name: "Padi D'NYC",                 area: "Midtown", rating: 7, cuisine: "Singaporean", price: 1 },
  { name: "Joe's Pizza",                area: "Midtown", rating: 6, cuisine: "Pizza", price: 1 },
  { name: "Le Café Coffee",             area: "Midtown", rating: 6, cuisine: "Coffee", price: 1 },
  { name: "Wolfe's Tone's Pub & Kitchen", area: "Midtown", rating: 6, cuisine: "Irish pub", price: 2 },
  { name: "Kajiken Ramen",              area: "Midtown", rating: 5, cuisine: "Aburasoba", price: 2 },
  { name: "Dubuhaus",                   area: "Koreatown", rating: 7, cuisine: "Korean tofu", price: 2 },
  { name: "Konban",                     area: "Chelsea", rating: 9, cuisine: "Katsu", price: 3 },
  { name: "Big Tings",                  area: "Chelsea", rating: 8, cuisine: "Jamaican", price: 2 },
  { name: "Miznon",                     area: "Chelsea", rating: 6, cuisine: "Israeli", price: 2 },
  { name: "Chama Mama",                 area: "Chelsea", rating: 6, cuisine: "Georgian", price: 2 },

  // ── Manhattan: Flatiron ────────────────────────────────
  { name: "Ootoya",                     area: "Flatiron", rating: 9, cuisine: "Teishoku", price: 2 },
  { name: "Haandi",                     area: "Flatiron", rating: 8, cuisine: "Indian & Pakistani", price: 1 },
  { name: "Watchhouse",                 area: "Flatiron", rating: 8, cuisine: "Coffee", price: 2 },
  { name: "Cafe Panna",                 area: "Flatiron", rating: 8, cuisine: "Ice cream", price: 1 },
  { name: "Dim Sum Sam",                area: "Flatiron", rating: 8, cuisine: "Dim sum", price: 1 },
  { name: "Los Tacos No. 1",            area: "Flatiron", rating: 8, cuisine: "Tacos", price: 1 },
  { name: "1915 Lanzhou Hand Pulled Noodles", area: "Flatiron", rating: 8, cuisine: "Lanzhou noodles", price: 1 },
  { name: "5ive Spice Tacos & Banh Mi", area: "Flatiron", rating: 8, cuisine: "Vietnamese", price: 1 },
  { name: "Suki Desu",                  area: "Flatiron", rating: 8, cuisine: "Kaisendon", price: 2 },
  { name: "Tenjou",                     area: "Flatiron", rating: 8, cuisine: "Ramen", price: 2 },
  { name: "ONGI",                       area: "Flatiron", rating: 7, cuisine: "Korean bowls", price: 1 },
  { name: "by Antidote",                area: "Flatiron", rating: 7, cuisine: "Sichuan", price: 3 },
  { name: "Smashy",                     area: "Flatiron", rating: 7, cuisine: "Smash burgers", price: 1 },
  { name: "Tompkins Square Bagels",     area: "Flatiron", rating: 7, cuisine: "Bagels", price: 1 },
  { name: "Vivi Bowl",                  area: "Flatiron", rating: 7, cuisine: "Asian-Mexican bowls", price: 1 },
  { name: "NAYA",                       area: "Flatiron", rating: 6, cuisine: "Lebanese", price: 1 },
  { name: "Chipotle",                   area: "Flatiron", rating: 6, cuisine: "Mexican", price: 1 },
  { name: "Mala Town",                  area: "Flatiron", rating: 5, cuisine: "Malatang", price: 2 },
  { name: "KEI",                        area: "Flatiron", rating: 5, cuisine: "Izakaya", price: 2 },
  { name: "Impact Kitchen",             area: "Flatiron", rating: 4, cuisine: "Healthy bowls", price: 2 },

  // ── Manhattan: downtown ────────────────────────────────
  { name: "Ramen Danbo",                area: "West Village", rating: 8, cuisine: "Ramen", price: 2 },
  { name: "Emmy Squared Pizza",         area: "East Village", rating: 7, cuisine: "Detroit-style pizza", price: 2 },
  { name: "Santo Taco",                 area: "SoHo", rating: 8, cuisine: "Tacos", price: 1 },                 // est
  { name: "Cantina Cubana",             area: "Lower East Side", rating: 8, cuisine: "Cuban", price: 2 },      // est
  { name: "Clinton St. Baking Co.",     area: "Lower East Side", rating: 8, cuisine: "Brunch", price: 2 },
  { name: "Scarr's Pizza",              area: "Lower East Side", rating: 8, cuisine: "Pizza", price: 1 },
  { name: "Katz's Delicatessen",        area: "Lower East Side", rating: 6, cuisine: "Jewish deli", price: 2 },
  { name: "Bar Belly",                  area: "Lower East Side", rating: 5, cuisine: "Cocktails & oysters", price: 2 },
  { name: "West New Malaysia",          area: "Chinatown", rating: 8, cuisine: "Malaysian", price: 2 },
  { name: "Kong Sihk Tong",             area: "Chinatown", rating: 8, cuisine: "Hong Kong café", price: 2 },
  { name: "Mango Mango",                area: "Chinatown", rating: 8, cuisine: "HK desserts", price: 1 },
  { name: "Golden Diner",               area: "Chinatown", rating: 7, cuisine: "Diner", price: 2 },
  { name: "L'Industrie",                area: "Chinatown", rating: 7, cuisine: "Pizza", price: 1 },
  { name: "Mei Lai Xuan",               area: "Chinatown", rating: 7, cuisine: "Cantonese", price: 1 },        // est
  { name: "Joe's Shanghai",             area: "Chinatown", rating: 6, cuisine: "Shanghainese", price: 2 },
  { name: "Shu Jiao Fu Zhou",           area: "Chinatown", rating: 6, cuisine: "Fuzhou dumplings", price: 1 },
  { name: "Bubby's",                    area: "Tribeca", rating: 9, cuisine: "Brunch", price: 2 },
  { name: "Felice Pasta Bar",           area: "Brooklyn Bridge", rating: 6, cuisine: "Pasta", price: 2 },

  // ── Staten Island & upstate ────────────────────────────
  { name: "Café St. Mark's",            area: "Staten Island", rating: 8, cuisine: "Café", price: 2 },
  { name: "Mama's Boy Deli",            area: "Catskills", rating: 7, cuisine: "Deli", price: 1 },             // est
  { name: "Phoenicia Diner",            area: "Catskills", rating: 6, cuisine: "Diner", price: 2 },

  // ── New Jersey ─────────────────────────────────────────
  { name: "The Table",                  area: "West Side Ave", rating: 8, cuisine: "American", price: 2 },
  { name: "Next Door Provisions",       area: "West Side Ave", rating: 8, cuisine: "Filipino-American", price: 2 },
  { name: "La Primicia",                area: "West Side Ave", rating: 6, cuisine: "Dominican", price: 1 },
  { name: "STACK",                      area: "Communipaw", rating: 8, cuisine: "American", price: 1 },        // est
  { name: "Rise and Cafe",              area: "Communipaw", rating: 7, cuisine: "Café", price: 1 },            // est
  { name: "Violet's From Jamaica",      area: "Lincoln Park", rating: 7, cuisine: "Jamaican", price: 1 },
  { name: "Bowl Burger Bistro",         area: "Lincoln Park", rating: 5, cuisine: "Burgers", price: 1 },       // est
  { name: "Johnny Rockets",             area: "Jersey Gardens", rating: 8, cuisine: "Burgers", price: 2 },

  // ── Abroad (from the old personal page) ────────────────
  { name: "Dumpling Darlings",  area: "Singapore", rating: null, cuisine: "Italian", price: 2, dish: "Pierogi",
    where: "Amoy Street", note: "I have been dreaming of the pierogi since I first had it." },
  { name: "Hainanese Delicacy", area: "Singapore", rating: null, cuisine: "Chinese", price: 1, dish: "Chicken rice",
    where: "Far East Plaza", note: "This will be the first meal when I am back in Singapore." },
  { name: "Sushi Bar",          area: "Singapore", rating: null, cuisine: "Japanese", price: 2, dish: "Kaisen don",
    where: "Ngee Ann City", note: "Make all the judgement you want — no wasabi, no ginger." },
  { name: "Ya Kun Kaya Toast",  area: "Singapore", rating: null, cuisine: "Café", price: 1, dish: "Steamed kaya toast",
    where: "Islandwide", note: "Lowkey, the steamed kaya toast is better." },
  { name: "Copper Buffet",      area: "Bangkok", rating: null, cuisine: "Thai", price: 3, dish: "Everything",
    where: "Nonthaburi", note: "I would fly there just to eat it again." },
  { name: "羅記牛肉貓耳麵",       area: "Hsinchu", rating: null, cuisine: "Taiwanese", price: 1, dish: "Mapo tofu",
    roman: "Luo Ji Beef Cat's Ear Noodles", note: "Comfort food during my Taiwan exchange." },
  { name: "Cafe LA",            area: "Perth", rating: null, cuisine: "Café", price: 2, dish: "Mont Blanc",
    note: "Because of this place, I now drink coffee." },
];

// ── Derived (don't edit below) ──────────────────────────────────────────────
const slug = (s) => s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "x";

export function buildFood() {
  const seen = new Set();
  const places = PLACES.map((p, i) => {
    const a = AREAS[p.area];
    if (!a) throw new Error(`food.js: "${p.name}" has area "${p.area}", which isn't in AREAS`);
    const group = CUISINES[p.cuisine];
    if (!group) throw new Error(`food.js: "${p.name}" has cuisine "${p.cuisine}", which isn't in CUISINES`);
    let id = slug(p.roman || p.name);
    while (seen.has(id)) id += "-" + i;
    seen.add(id);
    const q = [p.name, p.where || p.area, a.borough !== p.area ? a.borough : ""].filter(Boolean).join(" ");
    return {
      id, name: p.name, roman: p.roman || null, area: p.area, state: a.state, borough: a.borough,
      rating: p.rating ?? null, cuisine: p.cuisine, group, price: p.price || null,
      dish: p.dish || null, note: p.note || null,
      maps: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q),
    };
  });
  return { places, areas: AREAS, destinations: DESTINATIONS, groups: GROUPS };
}
