
function getPlaceIds() {
  var sheetLocation = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Locations");
  var existingLocationData = sheetLocation.getDataRange().getValues();
  var allHeaders = existingLocationData[0];
  var objDataLocations = makeObjectData_(existingLocationData);
  // var objHeaders = makeObjHeaderDetails_FromSheet_({ sheet: sheetLocation });

  var sheetSett = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Filter");
  var vreferral_months = Number(sheetSett.getRange("referral_months").getValue());

  var objGeo = {};

  var allAddress = [];

  objDataLocations.forEach(r => {
    var sAddress = `${r["Rndrng_Prvdr_St1"]}, ${r["Rndrng_Prvdr_City"]}, ${r["Rndrng_Prvdr_State_Abrvtn"]} ${r["Rndrng_Prvdr_Zip5"]}`.trim();
    if (!allAddress.includes(sAddress)) {
      allAddress.push(sAddress);
    }
  });

  var results = getExisting_geo_(allAddress);

  if (results) {
    results.forEach(r => {
      objGeo[r["Address"]] = r;
    });
  }

  var allNewRows_BQ = [];

  objDataLocations.forEach((r, x) => {

    if (isOverTime_(vMiliPerMin * 25)) return;

    var vRow = x + 2;

    if (r["Address"] != "" && r["place_id"] == "" && r["Show on map"] == "yes") {
      var sAddress = `${r["Rndrng_Prvdr_St1"]}, ${r["Rndrng_Prvdr_City"]}, ${r["Rndrng_Prvdr_State_Abrvtn"]} ${r["Rndrng_Prvdr_Zip5"]}`.trim();

      if (!objGeo[sAddress]) {
        var geocode = geocodeLocationIQ(sAddress);
        if (geocode) {
          objGeo[sAddress] = {};
          objGeo[sAddress]["Lat"] = geocode.lat;
          objGeo[sAddress]["Lng"] = geocode.lon;
          objGeo[sAddress]["place_id"] = geocode.place_id;
          objGeo[sAddress]["display_name"] = geocode.display_name;
          objGeo[sAddress]["Address"] = sAddress;
          objGeo[sAddress]["Rndrng_Prvdr_St1"] = r["Rndrng_Prvdr_St1"];
          objGeo[sAddress]["Rndrng_Prvdr_St2"] = "";
          objGeo[sAddress]["Rndrng_Prvdr_City"] = r["Rndrng_Prvdr_City"];
          objGeo[sAddress]["Rndrng_Prvdr_State_Abrvtn"] = r["Rndrng_Prvdr_State_Abrvtn"];
          objGeo[sAddress]["Rndrng_Prvdr_Zip5"] = geocode.address.postcode;
          allNewRows_BQ.push({
            json: objGeo[sAddress]
          });
        } else {
          var vAttempt = 1;
          if (r["place_id status"].indexOf("attempted #") != -1) {
            vAttempt = Number(r["place_id status"].split("attempted #")[1]) + 1;
          }
          r["place_id status"] = "attempted #" + vAttempt;
          // sheetLocation.getRange(vRow, objHeaders["place_id status"].columnNumber).setValue(r["place_id status"]);
        }
      }

      if (objGeo[sAddress]) {
        r["display_name"] = objGeo[sAddress]["display_name"];
        r["place_id"] = objGeo[sAddress]["place_id"];

        if (r["Lat"] == "") {
          r["Lat"] = objGeo[sAddress]["Lat"];
        }
        if (r["Lng"] == "") {
          r["Lng"] = objGeo[sAddress]["Lng"];
        }

        // sheetLocation.getRange(vRow, objHeaders["Lat"].columnNumber).setValue(r["Lat"]);
        // sheetLocation.getRange(vRow, objHeaders["Lng"].columnNumber).setValue(r["Lng"]);
        // sheetLocation.getRange(vRow, objHeaders["display_name"].columnNumber).setValue(r["display_name"]);
        // sheetLocation.getRange(vRow, objHeaders["place_id"].columnNumber).setValue(r["place_id"]);
      }

      if (allNewRows_BQ.length >= 50) {
        insertRowsToBigQuery_(PROJECT_ID, DATASET_ID, TABLE_ID_GEO, allNewRows_BQ);
        allNewRows_BQ = [];
      }

    }

    r["Incoming Referral"] = "";
    r["Total Incoming Referrals"] = "";

    if (vreferral_months > 0) {
      r[`Referral in last ${vreferral_months} Months`] = "";
    } else {
      r[`Referral in last  Months`] = "";
    }

    objDataLocations[x] = r;

  });

  if (allNewRows_BQ.length > 0) {
    insertRowsToBigQuery_(PROJECT_ID, DATASET_ID, TABLE_ID_GEO, allNewRows_BQ);
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

  getPlaceIds_Referrals();
}

function getPlaceIds_Referrals() {

  var sheetReferringPractice = SpreadsheetApp.openById("1mRNkTi_-DM-8ewxGmvAQpHcRns08Gw6avzPVqtniWCc").getSheetById("1845862191");
  var existingLocationData = sheetReferringPractice.getDataRange().getValues();
  var objDataLocations = makeObjectData_(existingLocationData);
  var objHeaders = makeObjHeaderDetails_FromSheet_({ sheet: sheetReferringPractice });

  var objGeo = {};

  var allAddress = [];

  objDataLocations.forEach(r => {
    if (r["Street Address"] != "") {
      var sAddress = toTitleCase_(`${r["Street Address"]}, ${r["City, State, Zip"]}`).trim();
      if (!allAddress.includes(sAddress)) {
        allAddress.push(sAddress);
      }
    }
    if (r["Street Address by AI"] != "") {
      var sAddress = toTitleCase_(`${r["Street Address by AI"]}, ${r["City, State, Zip by AI"]}`).trim();
      if (!allAddress.includes(sAddress)) {
        allAddress.push(sAddress);
      }
    }
  });

  var results = getExisting_geo_(allAddress);

  if (results) {
    results.forEach(r => {
      objGeo[toTitleCase_(`${r["Address"]}`).trim()] = r;
    });
  }

  objDataLocations.forEach((r, x) => {
    var vRow = x + 2;

    if ((r["Street Address"] != "" || r["Street Address by AI"] != "") && r["place_id"] == "") {

      var sAddress = toTitleCase_(`${r["Street Address"]}, ${r["City, State, Zip"]}`).trim();
      if (r["Street Address"] == "" && r["Street Address by AI"] != "" && r["Street Address by AI"] != "NA") {
        sAddress = toTitleCase_(`${r["Street Address by AI"]}, ${r["City, State, Zip by AI"]}`).trim();
      }

      var geocode = geocodeLocationIQ(sAddress);

      if (geocode) {

        if (!objGeo[sAddress]) {
          objGeo[sAddress] = {};
          objGeo[sAddress]["Lat"] = geocode.lat;
          objGeo[sAddress]["Lng"] = geocode.lon;
          objGeo[sAddress]["place_id"] = geocode.place_id;
          objGeo[sAddress]["display_name"] = geocode.display_name;
          objGeo[sAddress]["Address"] = sAddress;
          objGeo[sAddress]["Rndrng_Prvdr_St1"] = r["Rndrng_Prvdr_St1"];
          objGeo[sAddress]["Rndrng_Prvdr_St2"] = "";
          objGeo[sAddress]["Rndrng_Prvdr_City"] = r["Rndrng_Prvdr_City"];
          objGeo[sAddress]["Rndrng_Prvdr_State_Abrvtn"] = r["Rndrng_Prvdr_State_Abrvtn"];
          objGeo[sAddress]["Rndrng_Prvdr_Zip5"] = geocode.address.postcode;
        }

        r["display_name"] = objGeo[sAddress]["display_name"];
        r["place_id"] = objGeo[sAddress]["place_id"];

        if (r["Lat"] == "") {
          r["Lat"] = objGeo[sAddress]["Lat"];
        }
        if (r["Lng"] == "") {
          r["Lng"] = objGeo[sAddress]["Lng"];
        }

        sheetReferringPractice.getRange(vRow, objHeaders["display_name"].columnNumber).setValue(r["display_name"]);
        sheetReferringPractice.getRange(vRow, objHeaders["place_id"].columnNumber).setValue(r["place_id"]);
        sheetReferringPractice.getRange(vRow, objHeaders["Lat"].columnNumber).setValue(r["Lat"]);
        sheetReferringPractice.getRange(vRow, objHeaders["Lng"].columnNumber).setValue(r["Lng"]);
      }

    }

  });

}

function toTitleCase_(input) {
  if (!input) return '';

  return input
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
