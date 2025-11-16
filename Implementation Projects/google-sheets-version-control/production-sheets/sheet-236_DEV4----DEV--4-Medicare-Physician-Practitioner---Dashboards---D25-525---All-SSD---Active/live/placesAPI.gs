
function testAGWRGG() {
  var address = "803 North St E, Talladega, AL";
  var specialty = "Family Practice";

  const res = findPracticeName_({ address, specialty });

  Logger.log(JSON.stringify(res, null, 2));
}

/**
 * Get official practice name from Google Places (reliable vs directories).
 * Strategy:
 *  1) Geocode the address -> lat/lng for strong location bias
 *  2) Places Text Search with `${specialty} ${address}`, location & small radius
 *  3) Pick best result via address similarity + type checks
 *  4) Fallback to Find Place (textquery)
 *  5) Fetch Place Details for canonical name/website/phone
 *
 * Script property required: GOOGLE_MAPS_API_KEY
 */

const PLACES_CFG = {
  COUNTRY_BIAS: "us",          // Optional: ccTLD bias; not strict
  SEARCH_RADIUS_M: 200,        // Tight radius around geocoded address
  MAX_CANDIDATES: 5,           // Evaluate top N candidates
  MIN_CONFIDENCE: 0.45         // Tune threshold as needed
};


/* ---------------- Core public function ---------------- */

function findPracticeName_({ address, specialty }) {
  if (!address || !specialty) {
    console.log("Provide both { address, specialty }.");
    return;
  }

  const text = `${specialty} ${address}`;

  let best = null;

  const fp = findPlaceText_(text);
  if (fp && fp.candidates && fp.candidates.length) {
    const picked = pickBestCandidate_(fp.candidates, address, specialty);
    if (!best || (picked && picked.confidence > best.confidence)) {
      best = picked;
    }
  }

  if (!best) return null;

  const out = {
    name: best.name || null,
    formatted_address: best.formatted_address || null,
    place_id: best.place_id,
    confidence: best.confidence,
    lat: best.geometry.location.lat,
    lng: best.geometry.location.lng
  };
  return out;
}

/* ---------------- HTTP helpers ---------------- */

function httpGetJson_(url) {
  const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const code = resp.getResponseCode();
  if (code !== 200) {
    throw new Error(`HTTP ${code}: ${resp.getContentText()}`);
  }
  return JSON.parse(resp.getContentText());
}

/* ---------------- Google APIs ---------------- */

function findPlaceText_(text) {
  const fields = "place_id,name,formatted_address,type,geometry";

  const url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json" +
    `?input=${encodeURIComponent(text)}` +
    `&inputtype=textquery` +
    `&fields=${encodeURIComponent(fields)}` +
    `&region=us` +         // Optional: bias to US
    `&key=${encodeURIComponent(KEY_GOOGLE_MAP_API)}`;

  return httpGetJson_(url);
}

function placeDetails_(placeId, key) {
  return;
  const fields = [
    "name",
    "formatted_address",
    "types",
    "website",
    "international_phone_number",
    "business_status"
  ].join("%2C");
  const url = "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=${fields}` +
    `&key=${encodeURIComponent(key)}`;
  return httpGetJson_(url);
}

/* ---------------- Ranking / Matching ---------------- */

function pickBestCandidate_(candidates, inputAddress, specialty) {
  const normAddr = normalize_(inputAddress);
  const addrTokens = addrStrongTokens_(normAddr);
  const spec = (specialty || "").toLowerCase();

  // Evaluate top N
  const top = candidates.slice(0, PLACES_CFG.MAX_CANDIDATES).map(c => {
    const name = c.name || "";
    const fa = c.formatted_address || "";
    const types = c.types || [];
    const normFa = normalize_(fa);

    // Signals
    const addrHit = addressMatchScore_(addrTokens, normFa);
    const specHit = specialtyScore_(spec, name, types);
    const proximity = c.geometry?.location ? 1 : 0; // already tightly biased by radius
    const typeBoost = hasMedicalType_(types) ? 0.25 : 0;

    // Weighted score
    const score = addrHit * 0.6 + specHit * 0.3 + proximity * 0.1 + typeBoost;

    return {
      name: name,
      formatted_address: fa,
      place_id: c.place_id,
      geometry: c.geometry,
      types: types,
      confidence: round2_(score)
    };
  });

  // Highest confidence wins
  top.sort((a, b) => b.confidence - a.confidence);
  return top[0] || null;
}

function addressMatchScore_(addrTokens, candidateAddrNorm) {
  if (!candidateAddrNorm) return 0;
  let hits = 0;
  addrTokens.forEach(t => { if (candidateAddrNorm.includes(t)) hits++; });
  // Normalize by token count; keep within [0,1]
  return Math.min(1, hits / Math.max(1, addrTokens.length));
}

function specialtyScore_(spec, name, types) {
  if (!spec) return 0;
  const n = (name || "").toLowerCase();
  let s = 0;
  if (n.includes(spec)) s += 0.7;
  // Light boost if type aligns
  if (spec.includes("dermatology") && types && types.some(t => /doctor|dermatologist|health|hospital|clinic/.test(t))) s += 0.3;
  return Math.min(1, s);
}

function hasMedicalType_(types) {
  return (types || []).some(t => /doctor|dentist|hospital|health|clinic|physiotherapist/.test(t));
}

function normalize_(s) {
  return (s || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\bst(e|reet)\b/g, "st")
    .replace(/\broad\b/g, "rd")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function addrStrongTokens_(addrNorm) {
  // Pull out strong tokens: street number, street name keyword, city or ZIP
  const tokens = [];
  const num = addrNorm.match(/\b\d{1,6}\b/);
  if (num) tokens.push(num[0]);
  const zip = addrNorm.match(/\b\d{5}(?:-\d{4})?\b/); // US ZIP
  if (zip) tokens.push(zip[0]);

  // last 2 words (often city/state or locality)
  const words = addrNorm.split(" ");
  if (words.length >= 2) {
    tokens.push(words[words.length - 1]);
    tokens.push(words[words.length - 2]);
  }
  return Array.from(new Set(tokens)).slice(0, 6);
}

function round2_(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
