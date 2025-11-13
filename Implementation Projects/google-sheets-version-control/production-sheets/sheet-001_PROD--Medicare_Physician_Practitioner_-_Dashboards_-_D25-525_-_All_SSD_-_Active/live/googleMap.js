
/*** CONFIG ***/
const SHEET_NAME = 'Locations';
const ADDRESS_COL = 'Address';
const LABEL_COL = 'Label';
const PracticeName_COL = 'Practice Name';
const IncomingReferral_COL = 'Incoming Referral';
const LAT_COL = 'Lat';
const LNG_COL = 'Lng';
const STATUS_COL = "Show on map";
const TYPE_COL = "Rndrng_Prvdr_Type"
const Tot_Srvcs_COL = "Tot_Srvcs";
// const REFERRAL_COL = "Referral in last 6 Months";

const KEY_GOOGLE_MAP_API = "AIzaSyCy6tghfgsdVL1jgiAsyJuA53_ybQOBHQw";

/**
 * Serves the HTML UI (the map page).
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Address Labels Map')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function testSRG() {
  var address = "803 North St E, Talladega, AL";
  var geo = geocodeAddressOSM_(address);
  console.log(geo);
}

/**
 * Geocode via OpenStreetMap Nominatim.
 * Notes:
 *  - Keep to ~1 request/sec to be polite and avoid throttling.
 *  - Include a real contact email per Nominatim policy.
 */
function geocodeAddressOSM_(address) {
  try {
    Utilities.sleep(1100);
    var base = 'https://nominatim.openstreetmap.org/search';
    var params = {
      q: address,                 // only the address!
      format: 'jsonv2',
      limit: 1,
      addressdetails: 1,
      email: 'jiteshsaluja@gmail.com' // <-- put a real contact here
    };
    var url = base + '?' + Object.keys(params)
      .map(k => k + '=' + encodeURIComponent(params[k])).join('&');

    var res = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true     // so we can inspect non-200s
      // Apps Script may ignore 'User-Agent'; email param covers identity.
    });

    var code = res.getResponseCode();
    if (code !== 200) {
      console.log('Nominatim HTTP ' + code + ' — ' + res.getContentText());
      return;
    }

    var data = JSON.parse(res.getContentText());
    if (!Array.isArray(data) || data.length === 0) return null;

    console.log(data);

    // Nominatim returns strings; coerce to numbers
    return {
      lat: +data[0].lat,
      lon: +data[0].lon,
      display_name: data[0].display_name
    };
  } catch (err) {
    console.log(err);
  }
}

/** =DIST_KM(12.9716,77.5946, 28.6139,77.2090)  -> 1740.6 */
function calcDistance_(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180;
  // const R = 6371; // Earth radius in km
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return +(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(3);
}

function fetchPracticeName() {
  fetchPracticeNameAndCordinates_(true);
}

function uploadLocations() {
  fetchPracticeNameAndCordinates_(false);
}

function fetchPracticeNameAndCordinates_(bExtractNames = false) {

  SpreadsheetApp.flush();

  if (bExtractNames) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      '⚠️ Confirm API Call',
      'You are about to run a script that calls the Google Places API, which may incur costs.\n\nDo you want to proceed?',
      ui.ButtonSet.YES_NO
    );

    if (response != ui.Button.YES) {
      SpreadsheetApp.getActiveSpreadsheet().toast("Action canceled.");
      return;
    }
  }

  var sheetSett = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Filter");
  var vreferral_months = Number(sheetSett.getRange("referral_months").getValue());

  var sheetLocation = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Locations");

  if (sheetLocation.getLastRow() < 2) return;

  var existingLocationData = sheetLocation.getDataRange().getValues();
  const allHeaders = existingLocationData[0];
  var objDataLocations = makeObjectData_(existingLocationData);

  var allSearches = [];
  objDataLocations.forEach(r => {
    if (!allSearches.includes(r["Search"]) && r["Search"].toString().trim() != "") {
      allSearches.push(r["Search"]);
    }
  });

  var objLocations = {};
  var allExistingSearches = [];

  var results = getExisting_locations_(allSearches);

  if (results) {
    results.forEach(r => {
      objLocations[r["search"]] = r;
      allExistingSearches.push(r["search"]);
    });
  }


  var allNewRows_BQ = [];

  for (var rr = 0; rr < objDataLocations.length; rr++) {
    var rowObj = objDataLocations[rr];

    if (rowObj["Show on map"].toString().toLowerCase() == "yes") {

      if (objLocations[rowObj["Search"]]) {
        rowObj["Practice Name"] = objLocations[rowObj["Search"]]["Practice Name"];
        rowObj["Phone Number"] = objLocations[rowObj["Search"]]["Phone Number"];
        rowObj["Lat"] = objLocations[rowObj["Search"]]["Lat"];
        rowObj["Lng"] = objLocations[rowObj["Search"]]["Lng"];

      } else if (rowObj["Lat"] == "" || rowObj["Lng"] == "" || (rowObj["Practice Name"] == "" && rowObj["Incoming Referral"] == "")) {

        var address = rowObj["Address"];
        var specialty = rowObj["Rndrng_Prvdr_Type"];
        var vAttempt = 1;

        if (bExtractNames && !isOverTime_(vMiliPerMin * 25)) {
          try {
            if (rowObj["Places API status"].indexOf("attempted #") != -1) {
              vAttempt = Number(rowObj["Places API status"].split("attempted #")[1]) + 1;
            }

            if (vAttempt <= 3) {
              var res = findPracticeName_({ address, specialty });

              if (res && res.name) {
                rowObj["Practice Name"] = res.name;
                // rowObj["Phone Number"] = res.international_phone_number;
                rowObj["Lat"] = res.lat;
                rowObj["Lng"] = res.lng;
                rowObj["placesapi_place_id"] = res.place_id;
              } else {
                rowObj["Places API status"] = "attempted #" + vAttempt;
              }
            }
          } catch (err) {
            console.log(err);
            rowObj["Places API status"] = "attempted #" + vAttempt;
          }
        }
      }
    }

    rowObj["Incoming Referral"] = "";
    rowObj["Total Incoming Referrals"] = "";

    if (vreferral_months > 0) {
      rowObj[`Referral in last ${vreferral_months} Months`] = "";
    } else {
      rowObj[`Referral in last  Months`] = "";
    }

    objDataLocations[rr] = rowObj;

    if (!objLocations[rowObj["Search"]] && !allExistingSearches.includes(rowObj["Search"])) {
      if (rowObj["Lat"] != "" && rowObj["Lng"] != "" && rowObj["Practice Name"] != "") {
        objLocations[rowObj["Search"]] = {};
        objLocations[rowObj["Search"]]["search"] = rowObj["Search"];
        objLocations[rowObj["Search"]]["Address"] = rowObj["Address"];
        objLocations[rowObj["Search"]]["Rndrng_Prvdr_St1"] = rowObj["Rndrng_Prvdr_St1"];
        objLocations[rowObj["Search"]]["Rndrng_Prvdr_City"] = rowObj["Rndrng_Prvdr_City"];
        objLocations[rowObj["Search"]]["Rndrng_Prvdr_State_Abrvtn"] = rowObj["Rndrng_Prvdr_State_Abrvtn"];
        objLocations[rowObj["Search"]]["Rndrng_Prvdr_Zip5"] = rowObj["Rndrng_Prvdr_Zip5"];
        objLocations[rowObj["Search"]]["Rndrng_Prvdr_Type"] = rowObj["Rndrng_Prvdr_Type"];
        objLocations[rowObj["Search"]]["Practice Name"] = rowObj["Practice Name"];
        objLocations[rowObj["Search"]]["Phone Number"] = rowObj["Phone Number"];
        objLocations[rowObj["Search"]]["Lat"] = rowObj["Lat"];
        objLocations[rowObj["Search"]]["Lng"] = rowObj["Lng"];
        objLocations[rowObj["Search"]]["place_id"] = rowObj["placesapi_place_id"];
        allNewRows_BQ.push({
          json: objLocations[rowObj["Search"]]
        });
        allExistingSearches.push(rowObj["Search"]);
      }
    }

    if (allNewRows_BQ.length >= 50) {
      insertRowsToBigQuery_(PROJECT_ID, DATASET_ID, TABLE_ID, allNewRows_BQ);
      allNewRows_BQ = [];
    }
  }

  if (allNewRows_BQ.length > 0) {
    insertRowsToBigQuery_(PROJECT_ID, DATASET_ID, TABLE_ID, allNewRows_BQ);
    allNewRows_BQ = [];
  }

  var allDataOutput = [];

  objDataLocations.forEach(r => {
    var newRow = new Array(allHeaders.length).fill("");

    allHeaders.forEach((h, x) => {
      if (r[h]) {
        newRow[x] = r[h];
      }
    });

    allDataOutput.push(newRow);
  });

  if (allDataOutput.length > 0) {
    sheetLocation.getRange(2, 1, allDataOutput.length, allDataOutput[0].length).setValues(allDataOutput);
  }

}

/**
 * Returns marker data for the map. Geocodes missing lat/lng and writes back to sheet.
 * Output: [{lat:number, lng:number, label:string}, ...]
 */
function getMarkers() {
  SpreadsheetApp.flush();

  var sheetSett = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Filter");
  var vreferral_months = Number(sheetSett.getRange("referral_months").getValue());

  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  if (!values.length) return [];

  // Map headers to indexes
  const headers = values[0];
  const colMap = {};
  headers.forEach((h, i) => colMap[String(h).trim()] = i);

  const statusIdx = colMap[STATUS_COL];
  const latIdx = colMap[LAT_COL];
  const lngIdx = colMap[LNG_COL];
  const typeIdx = colMap[TYPE_COL];
  const pnIdx = colMap[PracticeName_COL];
  const irIdx = colMap[IncomingReferral_COL];
  const tsIdx = colMap[Tot_Srvcs_COL];

  if ([statusIdx, pnIdx].some(i => i == null)) {
    throw new Error(`Sheet must have columns "${ADDRESS_COL}" and "${LABEL_COL}" and "${STATUS_COL}"`);
  }

  const out = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];

    var label = null;
    if (row[irIdx]) {
      label = `${row[irIdx]} (Tot_Srvcs ${Number(row[tsIdx])})`;
    }
    if (row[pnIdx]) {
      label = `${row[pnIdx]} (Tot_Srvcs ${Number(row[tsIdx])})`;
    }
    if (!label) {
      label = `[Practice name not available] (Tot_Srvcs ${Number(row[tsIdx])})`;
    }

    const status = String(row[statusIdx] || '').trim();
    const ptype = String(row[typeIdx] || '').trim();

    const totalReferral = Number(row[colMap[`Total Incoming Referrals`]]) || 0;
    var lookbackReferral = Number(row[colMap[`Total Incoming Referrals`]]) || 0;

    if (vreferral_months > 0) {
      lookbackReferral = Number(row[colMap[`Referral in last ${vreferral_months} Months`]]) || 0;
    }

    let lat = row[latIdx];
    let lng = row[lngIdx];

    if (!label || status != "yes" || !lat || !lng) continue;

    var color = "red";

    if (lookbackReferral > 0) {
      color = "green";
    }

    out.push({ lat: Number(lat), lng: Number(lng), label, ptype, color, totalReferral, lookbackReferral, vreferral_months });
  }

  return out;
}

function getSheet_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sh) throw new Error(`Sheet "${SHEET_NAME}" not found`);
  return sh;
}
