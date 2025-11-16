
var LIQ_TOKENS = {
  "pk.ee206905b54000c065e7f16e45053262": -1, // <-- jsaluja@ssdspc.com
  "pk.98283df42e16a8fa09d999b988adabbb": -1, // <-- itssd@ssdspc.com
  "pk.4b2ce74e516ff85d696578e7a3c71296": -1 // <-- backup@ssdspc.com
};

// ==== config ====
const LIQ_REGION = 'us1'; // or 'eu1' if your account/traffic is Europe
const LIQ_BASE = `https://${LIQ_REGION}.locationiq.com/v1`;

var currentToken = "";

function initialiseTokens_() {
  Object.keys(LIQ_TOKENS).forEach(to => {
    var data = liqFetch_('/balance', { format: 'json' }, to);
    if (data && data.balance) {
      LIQ_TOKENS[to] = data.balance.day;
    }

    if (currentToken == "" && Number(LIQ_TOKENS[to]) > 0) {
      currentToken = to;
    }
    Utilities.sleep(1000);
  });
}

// --- core fetch ---
function liqFetch_(path, query, IQtoken) {

  if (!IQtoken) {
    if (currentToken == "") {
      initialiseTokens_();
    }

    if (currentToken == "") return;

    if (Number(LIQ_TOKENS[currentToken]) <= 0) {
      initialiseTokens_();
    }

    if (currentToken == "") return;

    IQtoken = currentToken;
  }

  var q = Object.assign({ key: IQtoken }, query);
  var url = LIQ_BASE + path + '?' + Object.keys(q).map(k => k + '=' + encodeURIComponent(q[k])).join('&');

  // simple retries/backoff for 429/5xx
  var lastErr;
  for (var attempt = 1; attempt <= 4; attempt++) {
    Utilities.sleep(500);
    try {
      var res = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true, followRedirects: true });
      var code = res.getResponseCode(), text = res.getContentText();
      if (code === 200) {
        if (LIQ_TOKENS[currentToken]) {
          LIQ_TOKENS[currentToken] = Number(LIQ_TOKENS[currentToken]) - 1;
        }
        return JSON.parse(text);
      }
      if (code === 404) return null;
      if (code === 429 || code >= 500) { Utilities.sleep(500 * attempt * attempt); continue; }
      console.log('LocationIQ HTTP ' + code + ' — ' + text);
    } catch (e) {
      lastErr = e; Utilities.sleep(500 * attempt * attempt);
    }
  }

  console.log(query);
  console.log(lastErr || new Error('LocationIQ request failed after retries.'));
}

// --- forward geocode ---
function geocodeLocationIQ(address, opts) {
  if (!address) return null;
  opts = opts || {};
  var data = liqFetch_('/search', {
    q: address,
    format: 'json',
    limit: 10,
    addressdetails: 1,
    normalizeaddress: 1,
    accept_language: opts.lang || 'en',
    countrycodes: opts.countrycodes || 'us' // e.g. 'us'
  });
  if (!Array.isArray(data) || !data.length) return null;
  var r = data[0];
  return r;
}

// --- reverse geocode ---
function reverseGeocodeLocationIQ(lat, lon, opts) {
  opts = opts || {};
  var data = liqFetch_('/reverse', {
    lat: lat, lon: lon,
    format: 'json',
    addressdetails: 1,
    normalizeaddress: 1,
    accept_language: opts.lang || 'en',
    zoom: opts.zoom || 18
  });
  return { lat: +data.lat, lon: +data.lon, display_name: data.display_name, address: data.address || {} };
}

// --- (optional) check balance ---
function getLocationIQBalance_() {
  var data = liqFetch_('/balance', { format: 'json' });
  return data && data.balance ? data.balance : null; // { day, bonus }
}

// --- quick tests ---
function testForward() {
  Logger.log(geocodeLocationIQ('70 Midtown Park E, Mobile, AL'));
}
function testReverse() {
  Logger.log(reverseGeocodeLocationIQ(33.4415, -86.0975));
}
function testBalance() {
  Logger.log(getLocationIQBalance_());
}
