// Medicare Physician Practitioner v2.18

const vScriptStartTime = new Date().getTime();
const vMiliPerMin = 1000 * 60;

const cms_datasetId = "92396110-2aed-4d63-a6a2-5d6207d46a29";

function getSettings_() {
  var sheetSett = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Filter");
  var sHCPCS_Cd = sheetSett.getRange("HCPCS_Cd").getValue();
  var sRndrng_Prvdr_Type = sheetSett.getRange("Rndrng_Prvdr_Type").getValue();
  var sRndrng_Prvdr_State_Abrvtn = sheetSett.getRange("Rndrng_Prvdr_State_Abrvtn").getValue();
  var vTot_Benes = Number(sheetSett.getRange("Tot_Benes").getValue());
  var vTot_Srvcs = Number(sheetSett.getRange("Tot_Srvcs").getValue());
  var vRadius_mi = Number(sheetSett.getRange("radius_mi").getValue());
  var vLat = parseFloat(sheetSett.getRange("Lat").getValue());
  var vLng = parseFloat(sheetSett.getRange("Lng").getValue());
  var vreferral_months = Number(sheetSett.getRange("referral_months").getValue());

  if (vLat == 0 || vLat == 0) {
    vRadius_mi = 0;
  }

  return { sHCPCS_Cd, sRndrng_Prvdr_Type, sRndrng_Prvdr_State_Abrvtn, vTot_Srvcs, vTot_Benes, vRadius_mi, vLat, vLng, vreferral_months };
}

function getCMSDATA() {
  var sett = getSettings_();

  var sheetCMSDATA = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CMS_DATA");
  if (sheetCMSDATA.getLastRow() > 2) {
    sheetCMSDATA.getRange(2, 1, sheetCMSDATA.getLastRow() - 1, sheetCMSDATA.getLastColumn()).clearContent();
  }

  var filters = [];

  if (sett.sHCPCS_Cd == "") {
    SpreadsheetApp.getUi().alert('Please set at least one: [HCPCS Codes]');
    return;
  }

  if (sett.sHCPCS_Cd != "") {
    filters.push(filterIn_("f1", "HCPCS_Cd", sett.sHCPCS_Cd.toString().split(", ")));
  }

  if (sett.sRndrng_Prvdr_Type != "") {
    filters.push(filterIn_("f2", "Rndrng_Prvdr_Type", sett.sRndrng_Prvdr_Type.toString().split(", ")));
  }

  if (sett.sRndrng_Prvdr_State_Abrvtn != "") {
    filters.push(filterIn_("f3", "Rndrng_Prvdr_State_Abrvtn", sett.sRndrng_Prvdr_State_Abrvtn.toString().split(", ")));
  } else {
    filters.push(filterIn_("f3", "Rndrng_Prvdr_State_Abrvtn", ["FL", "AL"]));
  }

  var allData = [];

  var vMaxRepeat = 10;
  var vSize = 5000;

  var objStatsData = {
  };

  var allopts = [];

  var sortBy = "Tot_Srvcs";

  if (sett.vTot_Benes != 0) {
    sortBy = "Tot_Benes";
  }

  for (var re = 0; re < vMaxRepeat; re++) {
    allopts.push({
      size: vSize,
      offset: re * vSize,
      filters,
      sort: `-${sortBy}`
    });
  }

  console.log(`fetching data from CMS API...`);

  var allData = fetchCmsFilteredAll_(allopts);

  console.log(`doing calculations...`);

  var objGeo = {};
  var objLocations = {};
  var allAddress = [];
  var allSearches = [];

  var allNewRows_BQ = [];

  if (allData.length > 0) {

    //>>>>
    allData.forEach(r => {
      var sAddress = `${r["Rndrng_Prvdr_St1"]}, ${r["Rndrng_Prvdr_City"]}, ${r["Rndrng_Prvdr_State_Abrvtn"]} ${r["Rndrng_Prvdr_Zip5"]}`;
      var sSearch = `${r["Rndrng_Prvdr_Type"]} ${r["Rndrng_Prvdr_St1"]}, ${r["Rndrng_Prvdr_City"]}, ${r["Rndrng_Prvdr_State_Abrvtn"]}`;
      if (!allAddress.includes(sAddress)) {
        allAddress.push(sAddress);
      }
      if (!allSearches.includes(sSearch) && sSearch != "") {
        allSearches.push(sSearch);
      }
    });

    //>>
    var results = getExisting_geo_(allAddress);

    if (results) {
      results.forEach(r => {
        objGeo[r["Address"]] = r;
      });
    }
    //<<

    //>>
    var results = getExisting_locations_(allSearches);

    if (results) {
      results.forEach(r => {
        objLocations[r["search"]] = r;
      });
    }
    //<<

    //<<<<

    allData.forEach(r => {
      //>>
      if (sett.vRadius_mi != 0) {
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
            objGeo[sAddress]["Rndrng_Prvdr_St2"] = r["Rndrng_Prvdr_St2"];
            objGeo[sAddress]["Rndrng_Prvdr_City"] = r["Rndrng_Prvdr_City"];
            objGeo[sAddress]["Rndrng_Prvdr_State_Abrvtn"] = r["Rndrng_Prvdr_State_Abrvtn"];
            objGeo[sAddress]["Rndrng_Prvdr_Zip5"] = r["Rndrng_Prvdr_Zip5"];
            allNewRows_BQ.push({
              json: objGeo[sAddress]
            });
          }
        }

        if (objGeo[sAddress]) {
          var vDist = calcDistance_(sett.vLat, sett.vLng, objGeo[sAddress]["Lat"], objGeo[sAddress]["Lng"])

          if (vDist <= sett.vRadius_mi) {
            if (!objStatsData[r["HCPCS_Cd"]]) {
              objStatsData[r["HCPCS_Cd"]] = [];
            }
            objStatsData[r["HCPCS_Cd"]].push(r);
          }
        }

      } else {
        if (!objStatsData[r["HCPCS_Cd"]]) {
          objStatsData[r["HCPCS_Cd"]] = [];
        }
        objStatsData[r["HCPCS_Cd"]].push(r);
      }
      //<<

      if (allNewRows_BQ.length >= 50) {
        insertRowsToBigQuery_(PROJECT_ID, DATASET_ID, TABLE_ID_GEO, allNewRows_BQ);
        allNewRows_BQ = [];
      }

    });
  }

  if (allNewRows_BQ.length > 0) {
    insertRowsToBigQuery_(PROJECT_ID, DATASET_ID, TABLE_ID_GEO, allNewRows_BQ);
  }

  var objPercentiles = {};
  var objCountOutput = {};

  if (sett.vTot_Srvcs != 0 || sett.vTot_Benes != 0) {
    Object.keys(objStatsData).forEach(key => {

      objPercentiles[key] = {};
      objCountOutput[key] = 0;

      if (sett.vTot_Srvcs != 0) {
        objPercentiles[key] = Math.min(objStatsData[key].length, Math.max(1, Math.round(objStatsData[key].length * sett.vTot_Srvcs)));
      }
      if (sett.vTot_Benes != 0) {
        objPercentiles[key] = Math.min(objStatsData[key].length, Math.max(1, Math.round(objStatsData[key].length * sett.vTot_Benes)));
      }
    });
  }

  console.log(`working on output...`);

  var objAddress = {};
  var objSearch = {};

  var allDataOutput = [];
  if (allData.length > 0) {

    var allHeaderObj = makeObjHeaderDetails_FromSheet_({ sheet: sheetCMSDATA });
    var vColumns = sheetCMSDATA.getLastColumn();

    Object.keys(objStatsData).forEach(key => {
      objStatsData[key].forEach(r => {
        var bOK = false;

        if (sett.vTot_Srvcs != 0) {
          if (Number(objCountOutput[r["HCPCS_Cd"]]) < Number(objPercentiles[r["HCPCS_Cd"]])) {
            objCountOutput[r["HCPCS_Cd"]] = Number(objCountOutput[r["HCPCS_Cd"]]) + 1;
            bOK = true;
          }
        } else if (sett.vTot_Benes != 0) {
          if (Number(objCountOutput[r["HCPCS_Cd"]]) < Number(objPercentiles[r["HCPCS_Cd"]])) {
            objCountOutput[r["HCPCS_Cd"]] = Number(objCountOutput[r["HCPCS_Cd"]]) + 1;
            bOK = true;
          }
        } else {
          bOK = true;
        }

        if (bOK && allDataOutput.length < 10000) {

          var sAddress = `${r["Rndrng_Prvdr_St1"]}, ${r["Rndrng_Prvdr_City"]}, ${r["Rndrng_Prvdr_State_Abrvtn"]}`
          var sSearch = `${r["Rndrng_Prvdr_Type"]} ${r["Rndrng_Prvdr_St1"]}, ${r["Rndrng_Prvdr_City"]}, ${r["Rndrng_Prvdr_State_Abrvtn"]}`

          if (!objAddress[sAddress]) objAddress[sAddress] = 0;
          objAddress[sAddress] = Number(objAddress[sAddress]) + Number(r["Tot_Srvcs"]);

          if (!objSearch[sSearch]) {
            objSearch[sSearch] = {};
            objSearch[sSearch]["Tot_Srvcs"] = 0;
            objSearch[sSearch]["Address"] = sAddress;
            objSearch[sSearch]["Rndrng_Prvdr_Type"] = r["Rndrng_Prvdr_Type"];
            objSearch[sSearch]["Rndrng_Prvdr_St1"] = r["Rndrng_Prvdr_St1"];
            objSearch[sSearch]["Rndrng_Prvdr_City"] = r["Rndrng_Prvdr_City"];
            objSearch[sSearch]["Rndrng_Prvdr_State_Abrvtn"] = r["Rndrng_Prvdr_State_Abrvtn"];
            objSearch[sSearch]["Rndrng_Prvdr_Zip5"] = r["Rndrng_Prvdr_Zip5"];
          }
          objSearch[sSearch]["Tot_Srvcs"] = Number(objSearch[sSearch]["Tot_Srvcs"]) + Number(r["Tot_Srvcs"]);

          var outputRow = new Array(vColumns).fill("");

          Object.keys(allHeaderObj).forEach((h) => {
            if (r[h]) {
              outputRow[allHeaderObj[h].columnIndex] = r[h];
            }
          });

          allDataOutput.push(outputRow);
        }
      });
    });

    sheetCMSDATA.getRange(2, 1, allDataOutput.length, allDataOutput[0].length).setValues(allDataOutput);
  }

  var sheetLocation = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Locations");
  var existingLocationData = sheetLocation.getDataRange().getValues();
  var objDataLocations = makeObjectData_(existingLocationData);
  var objHeaders = makeObjHeaderDetails_FromSheet_({ sheet: sheetLocation });

  var locationMap = objDataLocations.map(r => r["Search"]);

  var allLocations = [];

  Object.entries(objSearch).forEach(([sSearch, obj]) => {
    var lat = "";
    var lng = "";
    var sPracticeName = "";
    var sPhoneNumber = "";
    var sAddress = obj["Address"];
    var sRndrng_Prvdr_Type = obj["Rndrng_Prvdr_Type"];
    var sTot_Srvcs = obj["Tot_Srvcs"];
    var place_id = "";
    var display_name = "";
    var sRndrng_Prvdr_St1 = obj["Rndrng_Prvdr_St1"];
    var sRndrng_Prvdr_City = obj["Rndrng_Prvdr_City"];
    var sRndrng_Prvdr_State_Abrvtn = obj["Rndrng_Prvdr_State_Abrvtn"];
    var sRndrng_Prvdr_Zip5 = obj["Rndrng_Prvdr_Zip5"];

    // if (locationMap.includes(sSearch)) {
    //   lat = objDataLocations[locationMap.indexOf(sSearch)]["Lat"];
    //   lng = objDataLocations[locationMap.indexOf(sSearch)]["Lng"];

    //   sPracticeName = objDataLocations[locationMap.indexOf(sSearch)]["Practice Name"];
    //   sPhoneNumber = objDataLocations[locationMap.indexOf(sSearch)]["Phone Number"];

    //   place_id = objDataLocations[locationMap.indexOf(sSearch)]["place_id"];
    //   display_name = objDataLocations[locationMap.indexOf(sSearch)]["display_name"];
    // }

    if (objGeo[`${sRndrng_Prvdr_St1}, ${sRndrng_Prvdr_City}, ${sRndrng_Prvdr_State_Abrvtn} ${sRndrng_Prvdr_Zip5}`.trim()]) {
      place_id = objGeo[`${sRndrng_Prvdr_St1}, ${sRndrng_Prvdr_City}, ${sRndrng_Prvdr_State_Abrvtn} ${sRndrng_Prvdr_Zip5}`.trim()].place_id;
      display_name = objGeo[`${sRndrng_Prvdr_St1}, ${sRndrng_Prvdr_City}, ${sRndrng_Prvdr_State_Abrvtn} ${sRndrng_Prvdr_Zip5}`.trim()].display_name;

      if (lat == "") {
        lat = objGeo[`${sRndrng_Prvdr_St1}, ${sRndrng_Prvdr_City}, ${sRndrng_Prvdr_State_Abrvtn} ${sRndrng_Prvdr_Zip5}`.trim()]["Lat"];
        lng = objGeo[`${sRndrng_Prvdr_St1}, ${sRndrng_Prvdr_City}, ${sRndrng_Prvdr_State_Abrvtn} ${sRndrng_Prvdr_Zip5}`.trim()]["Lng"];
      }
    }

    if (objLocations[sSearch]) {
      sPracticeName = objLocations[sSearch]["Practice Name"];
      sPhoneNumber = objLocations[sSearch]["Phone Number"];
      lat = objLocations[sSearch]["Lat"];
      lng = objLocations[sSearch]["Lng"];
    }

    var newRow = new Array(existingLocationData[0].length).fill("");
    newRow[objHeaders["Search"].columnIndex] = sSearch;
    newRow[objHeaders["Address"].columnIndex] = sAddress;
    newRow[objHeaders["Rndrng_Prvdr_Type"].columnIndex] = sRndrng_Prvdr_Type;
    newRow[objHeaders["Rndrng_Prvdr_St1"].columnIndex] = sRndrng_Prvdr_St1;
    newRow[objHeaders["Rndrng_Prvdr_City"].columnIndex] = sRndrng_Prvdr_City;
    newRow[objHeaders["Rndrng_Prvdr_State_Abrvtn"].columnIndex] = sRndrng_Prvdr_State_Abrvtn;
    newRow[objHeaders["Rndrng_Prvdr_Zip5"].columnIndex] = sRndrng_Prvdr_Zip5;
    newRow[objHeaders["Tot_Srvcs"].columnIndex] = sTot_Srvcs;
    newRow[objHeaders["Show on map"].columnIndex] = "yes";
    newRow[objHeaders["Lat"].columnIndex] = lat;
    newRow[objHeaders["Lng"].columnIndex] = lng;

    newRow[objHeaders["Practice Name"].columnIndex] = sPracticeName;
    newRow[objHeaders["Phone Number"].columnIndex] = sPhoneNumber;
    newRow[objHeaders["place_id"].columnIndex] = place_id;
    newRow[objHeaders["display_name"].columnIndex] = display_name;

    newRow[objHeaders["Incoming Referral"].columnIndex] = "";
    newRow[objHeaders["Total Incoming Referrals"].columnIndex] = "";
    if (sett.vreferral_months > 0) {
      newRow[objHeaders[`Referral in last ${sett.vreferral_months} Months`].columnIndex] = "";
    } else {
      newRow[objHeaders[`Referral in last  Months`].columnIndex] = "";
    }

    allLocations.push(newRow);
  });

  // objDataLocations.forEach(r => {
  //   if (!objSearch[r["Search"]]) {

  //     var newRow = new Array(existingLocationData[0].length).fill("");
  //     newRow[objHeaders["Search"].columnIndex] = r["Search"];
  //     newRow[objHeaders["Address"].columnIndex] = r["Address"];
  //     newRow[objHeaders["Rndrng_Prvdr_St1"].columnIndex] = r["Rndrng_Prvdr_St1"];
  //     newRow[objHeaders["Rndrng_Prvdr_City"].columnIndex] = r["Rndrng_Prvdr_City"];
  //     newRow[objHeaders["Rndrng_Prvdr_State_Abrvtn"].columnIndex] = r["Rndrng_Prvdr_State_Abrvtn"];
  //     newRow[objHeaders["Rndrng_Prvdr_Zip5"].columnIndex] = r["Rndrng_Prvdr_Zip5"];
  //     newRow[objHeaders["Rndrng_Prvdr_Type"].columnIndex] = r["Rndrng_Prvdr_Type"];
  //     newRow[objHeaders["Tot_Srvcs"].columnIndex] = r["Tot_Srvcs"];
  //     newRow[objHeaders["Show on map"].columnIndex] = "";
  //     newRow[objHeaders["Lat"].columnIndex] = r["Lat"];
  //     newRow[objHeaders["Lng"].columnIndex] = r["Lng"];
  //     newRow[objHeaders["Practice Name"].columnIndex] = r["Practice Name"];
  //     newRow[objHeaders["place_id"].columnIndex] = r["place_id"];
  //     newRow[objHeaders["display_name"].columnIndex] = r["display_name"];

  //     newRow[objHeaders["Incoming Referral"].columnIndex] = "";
  //     newRow[objHeaders["Total Incoming Referrals"].columnIndex] = "";
  //     if (sett.vreferral_months > 0) {
  //       newRow[objHeaders[`Referral in last ${sett.vreferral_months} Months`].columnIndex] = "";
  //     } else {
  //       newRow[objHeaders[`Referral in last  Months`].columnIndex] = "";
  //     }

  //     allLocations.push(newRow);
  //   }
  // });

  SpreadsheetApp.flush();
  if (sheetLocation.getLastRow() > 1) {
    sheetLocation.getRange(2, 1, sheetLocation.getLastRow() - 1, sheetLocation.getLastColumn()).clearContent();
    SpreadsheetApp.flush();
  }

  if (allLocations.length > 0) {
    sheetLocation.getRange(2, 1, allLocations.length, allLocations[0].length).setValues(allLocations);
  }

  SpreadsheetApp.flush();
  var sheetUniqueAddressList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Unique Address List");

  if (sheetUniqueAddressList.getLastRow() > 1) {
    var sformula = `=if($B2<>"", SUMIFS(CMS_DATA!$R:$R,CMS_DATA!$G:$G,$B2,CMS_DATA!$I:$I,$C2,CMS_DATA!$J:$J,$D2,CMS_DATA!$L:$L,$E2,CMS_DATA!$M:$M,$F2,CMS_DATA!$N:$N,$G2),"")`;
    sheetUniqueAddressList.getRange(2, 9).setFormula(sformula);
    sheetUniqueAddressList.getRange(2, 9).copyTo(sheetUniqueAddressList.getRange(2, 9, sheetUniqueAddressList.getLastRow(), 1));
  }

  SpreadsheetApp.flush();
  var sheetUniqueProviderList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Unique Provider List");

  if (sheetUniqueProviderList.getLastRow() > 1) {
    var sformula = `=if($G2<>"", SUMIFS(CMS_DATA!$R:$R,CMS_DATA!$G:$G,$G2,CMS_DATA!$I:$I,$I2,CMS_DATA!$J:$J,$J2,CMS_DATA!$L:$L,$L2,CMS_DATA!$M:$M,$M2,CMS_DATA!$N:$N,$N2,CMS_DATA!$A:$A,$A2),"")`;
    sheetUniqueProviderList.getRange(2, 15).setFormula(sformula);
    sheetUniqueProviderList.getRange(2, 15).copyTo(sheetUniqueProviderList.getRange(2, 15, sheetUniqueProviderList.getLastRow(), 1));
  }

  console.log(`DONE`);
}

function makeObjectData_(data, bRich) {
  var dataOutput = [];

  for (var rr = 1; rr < data.length; rr++) {
    var obj = {};

    for (var cc = 0; cc < data[0].length; cc++) {
      var sHeader = "";
      if (bRich) {
        sHeader = data[0][cc].getText();
      } else {
        sHeader = data[0][cc];
      }
      if (sHeader != "") {
        obj[sHeader] = data[rr][cc];
      }
    }

    dataOutput.push(obj)
  }

  return dataOutput;
}

function makeObjHeaderDetails_({ allHeaders, bLowerCase }) {
  if (bLowerCase) {
    allHeaders = allHeaders.map(function (r) { return r.toString().trim().toLowerCase(); });
  }

  var obj = {};
  allHeaders.map(function (h, x) {
    if (h.toString().trim() != -1) {
      obj[h.toString().trim()] = {};
      obj[h.toString().trim()].columnIndex = x;
      obj[h.toString().trim()].columnNumber = x + 1;
      obj[h.toString().trim()].columnName = getColumnName_(x + 1);
      obj[h.toString().trim()].header = h;
    }
  });

  return obj;
}

function makeObjHeaderDetails_FromSheet_({ sheet, bLowerCase, headerRowNo, bRich }) {
  if (!headerRowNo) headerRowNo = 1;
  var allHeaders = [];

  if (bRich) {
    allHeaders = sheet.getRange(headerRowNo, 1, 1, Math.max(sheet.getLastColumn(), 2)).getRichTextValues()[0].map(function (r) { return r.getText().toString().trim(); });
  } else {
    allHeaders = sheet.getRange(headerRowNo, 1, 1, Math.max(sheet.getLastColumn(), 2)).getValues()[0].map(function (r) { return r.toString().trim(); });
  }

  return makeObjHeaderDetails_({ allHeaders, bLowerCase });
}

function getColumnName_(columnNumber) {
  if (columnNumber < 1) return "";

  let columnName = "";
  while (columnNumber > 0) {
    let remainder = (columnNumber - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return columnName;
}



/**
 * Build and fetch CMS data with dynamic filters.
 * Works with: https://data.cms.gov/data-api/v1/dataset/{UUID}/data-viewer
 *
 * Example usage at bottom.
 */

// ---------- Core builders ----------

/** Build a repeatable-querystring from entries like [{k, v}, ...]. */
function buildQueryString_(pairs) {
  return pairs
    .map(({ k, v }) => Array.isArray(v)
      ? v.map(val => `${encodeURIComponent(k)}=${encodeURIComponent(val)}`).join("&")
      : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    )
    .join("&");
}

/** Add a filter block (equality, IN, CONTAINS, BETWEEN, etc.). */
function addFilter_(pairs, { id, path, operator, value, groupId } = {}) {
  if (!id) throw new Error("Filter needs a unique id (e.g., f1, f2).");
  if (!path) throw new Error("Filter needs a column name in 'path'.");
  if (!operator) throw new Error("Filter needs an 'operator' (e.g., '=', 'IN', 'CONTAINS', 'BETWEEN').");

  pairs.push({ k: `filter[${id}][condition][path]`, v: path });
  pairs.push({ k: `filter[${id}][condition][operator]`, v: operator });

  // Values: single, array, or two values for BETWEEN
  if (operator === "BETWEEN" || operator === "NOT BETWEEN") {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error("BETWEEN expects value = [min, max].");
    }
    pairs.push({ k: `filter[${id}][condition][value][]`, v: value[0] });
    pairs.push({ k: `filter[${id}][condition][value][]`, v: value[1] });
  } else if (Array.isArray(value)) {
    // IN / NOT IN expect multiple values
    value.forEach(v => pairs.push({ k: `filter[${id}][condition][value][]`, v }));
  } else if (value !== undefined) {
    pairs.push({ k: `filter[${id}][condition][value]`, v: value });
  }

  if (groupId) {
    pairs.push({ k: `filter[${id}][memberOf]`, v: groupId });
  }
}

/** Define a group (to combine filters with OR or AND). */
function addGroup_(pairs, { groupId, conjunction = "AND" }) {
  if (!groupId) throw new Error("Group needs a groupId (e.g., g1).");
  pairs.push({ k: `filter[${groupId}][group][conjunction]`, v: conjunction }); // "AND" or "OR"
}

// ---------- Friendly wrappers for common needs ----------

function filterEq_(id, path, value, groupId) {
  return { id, path, operator: "=", value, groupId };
}
function filterNe_(id, path, value, groupId) {
  return { id, path, operator: "!=", value, groupId };
}
function filterContains_(id, path, value, groupId) {
  // Column-specific substring search
  return { id, path, operator: "CONTAINS", value, groupId };
}
function filterIn_(id, path, values, groupId) {
  return { id, path, operator: "IN", value: values, groupId };
}
function filterRange_(id, path, min, max, groupId) {
  return { id, path, operator: "BETWEEN", value: [min, max], groupId };
}
function filterGt_(id, path, value, groupId) {
  return { id, path, operator: ">", value, groupId };
}
function filterGte_(id, path, value, groupId) {
  return { id, path, operator: ">=", value, groupId };
}
function filterLt_(id, path, value, groupId) {
  return { id, path, operator: "<", value, groupId };
}
function filterLte_(id, path, value, groupId) {
  return { id, path, operator: "<=", value, groupId };
}

// ---------- Main URL builder & fetcher ----------

/**
 * Build a /data-viewer URL with dynamic filters, columns, sort, etc.
 *
 * @param {string} datasetId - the UUID for the dataset
 * @param {Object} opts
 *   - columns?: string[] (repeatable "column=" projection)
 *   - keyword?: string      (full-text across columns)
 *   - sortBy?: string
 *   - sortOrder?: "ASC"|"DESC"
 *   - size?: number         (default 1000; max typically 5000)
 *   - offset?: number
 *   - filters?: Array<ReturnType<filterEq|filterContains|...>>
 *   - groups?: Array<{ groupId: string, conjunction: "AND"|"OR" }>
 */
function buildCmsViewerUrl_(opts = {}) {
  const {
    columns = [],
    keyword,
    sort,
    size = 1000,
    offset = 0,
    filters = [],
    groups = [],
  } = opts;

  const pairs = [];

  // columns
  columns.forEach(c => pairs.push({ k: "column", v: c }));

  // keyword search
  if (keyword) pairs.push({ k: "keyword", v: keyword });

  // sorting
  if (sort) {
    pairs.push({ k: "sort", v: sort });
  }

  // pagination
  pairs.push({ k: "size", v: size });
  pairs.push({ k: "offset", v: offset });

  // groups (define before assigning filters to them)
  groups.forEach(g => addGroup_(pairs, g));

  // filters
  filters.forEach(f => addFilter_(pairs, f));

  const qs = buildQueryString_(pairs);
  return `https://data.cms.gov/data-api/v1/dataset/${cms_datasetId}/data?${qs}`;
}

/** Fetch JSON with dynamic filters. */
function fetchCmsFiltered_(opts) {
  const url = buildCmsViewerUrl_(opts);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const text = res.getContentText();
  let obj;
  try {
    obj = JSON.parse(text);
  } catch (e) {
    throw new Error(`Non-JSON response (${res.getResponseCode()}): ${text.slice(0, 300)}`);
  }
  return { url, data: obj };
}
/**
 * Fetch multiple JSON responses with dynamic filters.
 * @param {Array<Object>} allopts - Array of option objects.
 * @return {Array<Object>} Array of results with URL and parsed JSON data.
 */
function fetchCmsFilteredAll_(allopts) {
  // Build an array of URLs
  const urls = allopts.map(opts => buildCmsViewerUrl_(opts));

  // console.log(urls);

  // Build request objects for fetchAll
  const requests = urls.map(url => ({
    url: url,
    muteHttpExceptions: true
  }));

  // Perform all requests in parallel
  const responses = UrlFetchApp.fetchAll(requests);

  var allData = [];

  // Process responses
  responses.map((res, i) => {
    const text = res.getContentText();
    let obj;
    try {
      obj = JSON.parse(text);
    } catch (e) {
      throw new Error(
        `Non-JSON response (${res.getResponseCode()}) from ${urls[i]}: ${text.slice(0, 300)}`
      );
    }
    allData = allData.concat(obj);
  });

  return allData;
}

function isOverTime_(vTimeOutMili = 240000) {
  const vCurTime = new Date().getTime();
  const vRunTime = vCurTime - vScriptStartTime;
  return vRunTime > vTimeOutMili;
}