// Bulk Patient Summary Docs v2.3

const prefix_createBulkPatientSumm = 'createBulkPatientSumm-';
const prefix_createIndividualPatientSumm = 'createIndividualPatientSumm-';

const prop_ScriptRunning_Bulk = "scriptRunning";
const prop_ScriptRunning_Ind = "scriptRunning_Ind";

const prop_PriorityIndexBulk = "indexBulk";
const prop_PriorityIndexInd = "indexInd";

const lineBreakChar = String.fromCharCode(10);

function testPpty() {
  var allProps = getAllProperties_();
  Logger.log(allProps)

  let pdList = getPendingListBulk_()
  Logger.log(pdList)
}

function createIndividualPatientSummary() {
  const PatientMrnSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Individual Patient Summary');
  let PatientMrn = PatientMrnSheet.getRange("B2").getDisplayValue();

  if (!PatientMrn || PatientMrn == "Enter the Patient's MRN here without spaces" || PatientMrn == "") {
    ui.alert("Invalid!\nPlease input a valid MRN.");
    return;
  }

  PatientMrn = PatientMrn.toString().trim().toUpperCase();

  setProperty_(`${prefix_createIndividualPatientSumm}${PatientMrn}`, getNewIndex_Ind_());

  updatePendingStatusInd_();

  SpreadsheetApp.getActiveSpreadsheet().toast(`File will be created for ${PatientMrn} soon.`);

  PatientMrnSheet.getRange("B2").clearContent();

  //Clarification for tab users to enter MRN without spaces and in the correct cell
  // PatientMrnSheet.getRange("B2").setValue("Enter the Patient's MRN here without spaces");
}

function getPendingListInd_() {
  var list = [];

  var allProps = getAllProperties_();

  Object.entries(allProps).forEach(function ([propname, value]) {
    var mrn = getMRN_(propname);
    if (!mrn) return;

    list.push(mrn);
  });

  return list;
}

function updatePendingStatusInd_() {
  var list = getPendingListInd_();
  try {
    if (list.length > 0) {
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Individual Patient Summary").getRange("D3").setValue(`Creating files for MRNs: ${list.join(", ")}`);
    } else {
      if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Individual Patient Summary").getRange("D3").getValue() != "") {
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Individual Patient Summary").getRange("D3").clearContent();
      }
    }
  } catch (err) { console.log(err.toString()); }
}

function getPendingListBulk_() {
  var list = [];

  var allProps = getAllProperties_();

  Object.entries(allProps).forEach(function ([propname, value]) {
    var providerName = getProviderName_(propname);
    if (!providerName) return;

    list.push(providerName);
  });

  return list;
}

function updatePendingStatusBulk_() {
  var list = getPendingListBulk_();
  try {
    if (list.length > 0) {
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("bulk_patient_summary (auto)").getRange("E1").setValue(`${timeNow_()} - Creating files for: ${list.join(", ")}...`);
    } else {
      if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName("bulk_patient_summary (auto)").getRange("E1").getValue() != "") {
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName("bulk_patient_summary (auto)").getRange("E1").clearContent().clearNote();
      }
    }
  } catch (err) { console.log(err.toString()); }
}

function autoRun_createSummaryFiles() {
  SpreadsheetApp.flush();

  if (!scriptHandler_Bulk_(true)) return;

  updatePendingStatusBulk_();

  var vCount = 0;
  const vMaxLimit = 1;

  var allProps = getAllProperties_();

  //>>
  var vMinIndex = null;
  var sMinProvider = "";

  Object.entries(allProps).forEach(function ([propname, value]) {
    var providerName = getProviderName_(propname);
    if (!providerName) return;

    const vIndex = Number(value);

    if (!vMinIndex) {
      vMinIndex = vIndex;
      sMinProvider = providerName;
    }
    if (vIndex < vMinIndex) {
      vMinIndex = vIndex;
      sMinProvider = providerName;
    }
  });
  //<<

  Object.entries(allProps).forEach(function ([propname, value]) {
    if (vCount < vMaxLimit) {
      var providerName = getProviderName_(propname);
      if (!providerName) return;

      //>>
      if (sMinProvider != providerName) return;
      //<<

      try {
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName("bulk_patient_summary (auto)").getRange("E1").setNote(`${timeNow_()} - Creating file for ${providerName}...`);
      } catch (err) { console.log(err.toString()); }

      SpreadsheetApp.flush();

      const AppointmentDate = Utilities.formatDate(new Date(), 'GMT-6', 'M/d/yyyy');
      createBulkPatientSummary_(providerName, AppointmentDate);

      console.log({ providerName });

      delProperty_(propname);
      vCount++;

      try {
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName("bulk_patient_summary (auto)").getRange("E1").setNote(`${timeNow_()} - File created for ${providerName}.`);
      } catch (err) { console.log(err.toString()); }
    }
  });

  updatePendingStatusBulk_();

  scriptHandler_Bulk_release_();
}

function timeNow_() {
  return Utilities.formatDate(new Date(), 'GMT-6', 'M/d/yyyy HH:mm:ss');
}

function autoRun_createSummaryFiles_Ind() {
  SpreadsheetApp.flush();

  if (!scriptHandler_Ind_(true)) return;

  updatePendingStatusInd_();

  var vCount = 0;
  const vMaxLimit = 1;

  var allProps = getAllProperties_();

  //>>
  var vMinIndex = null;
  var sMinMrn = "";

  Object.entries(allProps).forEach(function ([propname, value]) {
    var mrn = getMRN_(propname);
    if (!mrn) return;

    const vIndex = Number(value);

    if (!vMinIndex) {
      vMinIndex = vIndex;
      sMinMrn = mrn;
    }
    if (vIndex < vMinIndex) {
      vMinIndex = vIndex;
      sMinMrn = mrn;
    }
  });
  //<<

  Object.entries(allProps).forEach(function ([propname, value]) {
    if (vCount < vMaxLimit) {
      var mrn = getMRN_(propname);
      if (!mrn) return;

      //>>
      if (sMinMrn != mrn) return;
      //<<

      try {
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Individual Patient Summary").getRange("D2").setValue(`${timeNow_()} - Creating file for ${mrn}.`);
      } catch (err) { console.log(err.toString()); }

      SpreadsheetApp.flush();

      var fileCreated = createIndividualPatientSummaryViaMRN_(mrn);

      console.log({ mrn });

      delProperty_(propname);
      vCount++;

      if (fileCreated == true) {
        try {
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Individual Patient Summary").getRange("D2").setValue(`${timeNow_()} - File created for ${mrn}.`);
        } catch (err) { console.log(err.toString()); }
      } else if (fileCreated.toString() != "") {
        try {
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Individual Patient Summary").getRange("D2").setValue(`${timeNow_()} - ${fileCreated.toString()}.`);
        } catch (err) { console.log(err.toString()); }
      }
    }
  });

  updatePendingStatusInd_();

  scriptHandler_Ind_release_();
}

function getProviderName_(propname) {
  if (left_(propname, prefix_createBulkPatientSumm.length) == prefix_createBulkPatientSumm) {
    var providerName = right_(propname, propname.length - prefix_createBulkPatientSumm.length).toString().trim();
    if (providerName == "") return false;
    return providerName;
  }
  return false;
}

function getMRN_(propname) {
  if (left_(propname, prefix_createIndividualPatientSumm.length) == prefix_createIndividualPatientSumm) {
    var mrn = right_(propname, propname.length - prefix_createIndividualPatientSumm.length).toString().trim();
    if (mrn == "") return false;
    return mrn;
  }
  return false;
}

function delProperty_(propname) {
  PropertiesService.getScriptProperties().deleteProperty(propname);
}

function getProperty_(propname) {
  return PropertiesService.getScriptProperties().getProperty(propname);
}

function getAllProperties_() {
  return PropertiesService.getScriptProperties().getProperties();
}

function setProperty_(propname, value) {
  PropertiesService.getScriptProperties().setProperty(propname, value);
}

function right_(sData, vLen) {
  return sData.substring(sData.length - vLen, sData.length);
}

function left_(sData, vLen) {
  return sData.toString().substring(0, vLen);
}

function scriptHandler_Bulk_(instantReject) {
  var sMiliSecs = new Date().getTime().toFixed(0).toString();

  var prop = getProperty_(prop_ScriptRunning_Bulk);

  var bLoop = true;

  if (prop != null) {
    while (bLoop) {
      if (prop != "") {
        prop = getProperty_(prop_ScriptRunning_Bulk);
        if ((Number(sMiliSecs) - Number(prop)) > 1000 * 60 * 30) {
          setProperty_(prop_ScriptRunning_Bulk, sMiliSecs);
          bLoop = false;
        } else if (instantReject == true) {
          console.log("same script is already running, returning to avoid collision.");
          return false;
        }
      } else {
        setProperty_(prop_ScriptRunning_Bulk, sMiliSecs);
        bLoop = false;
      }

    }
  } else {
    setProperty_(prop_ScriptRunning_Bulk, sMiliSecs);
  }

  Utilities.sleep(1000);

  var prop = getProperty_(prop_ScriptRunning_Bulk);

  if (prop != sMiliSecs) {
    return;
  }

  return true;
}

function scriptHandler_Bulk_release_() {
  setProperty_(prop_ScriptRunning_Bulk, "");
}

function scriptHandler_Ind_(instantReject) {
  var sMiliSecs = new Date().getTime().toFixed(0).toString();

  var prop = getProperty_(prop_ScriptRunning_Ind);

  var bLoop = true;

  if (prop != null) {
    while (bLoop) {
      if (prop != "") {
        prop = getProperty_(prop_ScriptRunning_Ind);
        if ((Number(sMiliSecs) - Number(prop)) > 1000 * 60 * 15) {
          setProperty_(prop_ScriptRunning_Ind, sMiliSecs);
          bLoop = false;
        } else if (instantReject == true) {
          console.log("same script is already running, returning to avoid collision.");
          return false;
        }
      } else {
        setProperty_(prop_ScriptRunning_Ind, sMiliSecs);
        bLoop = false;
      }

    }
  } else {
    setProperty_(prop_ScriptRunning_Ind, sMiliSecs);
  }

  Utilities.sleep(1000);

  var prop = getProperty_(prop_ScriptRunning_Ind);

  if (prop != sMiliSecs) {
    return;
  }

  return true;
}

function scriptHandler_Ind_release_() {
  setProperty_(prop_ScriptRunning_Ind, "");
}

function getNewIndex_Bulk_() {
  var prop = getProperty_(prop_PriorityIndexBulk);
  var vNewIndex = 1;
  if (prop) {
    vNewIndex = Number(prop) + 1;
  }
  setProperty_(prop_PriorityIndexBulk, vNewIndex);
  return vNewIndex;
}

function getNewIndex_Ind_() {
  var prop = getProperty_(prop_PriorityIndexInd);
  var vNewIndex = 1;
  if (prop) {
    vNewIndex = Number(prop) + 1;
  }
  setProperty_(prop_PriorityIndexInd, vNewIndex);
  return vNewIndex;
}
