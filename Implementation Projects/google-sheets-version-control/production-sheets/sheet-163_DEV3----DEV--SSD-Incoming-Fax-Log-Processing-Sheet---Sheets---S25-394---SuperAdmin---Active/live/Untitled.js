





function loadServiceAccountKeyTest() {
  const file = DriveApp.getFileById(SERVICE_ACCOUNT_KEY_FILE_ID);
  Logger.log(file.getUrl())
  Logger.log(file.getBlob().getDataAsString())
  Logger.log(JSON.parse(file.getBlob().getDataAsString()))
  Logger.log(JSON.stringify(JSON.parse(file.getBlob().getDataAsString())))

}




function testDateCreat() {
  Logger.log(new Date("09/11/1956"))
}





function testProcessMRNS() {

  let PatientSS = SpreadsheetApp.openById("1nYzpVskLjQfaSBYbt-y_CZzAJfqLmh37Wqw9FHmvd1c");
  let PatientSheet = PatientSS.getSheetByName("Patients")
  let patientIds = PatientSheet.getRange("A2:A").getDisplayValues()
  let patientNames = PatientSheet.getRange("B2:B").getValues()
  let patientDOBD = PatientSheet.getRange("G2:G").getDisplayValues()
  let patientDOB = PatientSheet.getRange("G2:G").getValues()
  let patientLinks = PatientSheet.getRange("H2:H").getValues()


  let patientIdObj = {}
  let patientIdObjV = {}
  patientIds.forEach((id, index) => {
    let firstName = patientNames[index][0].toString().toLowerCase().trim().split(" ")[0]
    patientIdObj[firstName + patientDOBD[index][0]] = { id: id[0], link: patientLinks[index][0] }

    if (isValidDate_(patientDOB[index][0])) {
      let tempDate = Utilities.formatDate(patientDOB[index][0], Session.getScriptTimeZone(), "M/d/yyyy")
      patientIdObjV[firstName + tempDate] = { id: id[0], link: patientLinks[index][0] }
    }
  })




  const DataSheet = SpreadsheetApp.getActive().getSheetByName('Incoming_Fax_Log');
  let RecordIdsD = DataSheet.getRange('H2:J').getDisplayValues()
  let RecordIds = DataSheet.getRange('H2:J').getValues()

  for (var i = 0; i < RecordIdsD.length; i++) {
    let tempKey = RecordIdsD[i][1].toString().toLowerCase().trim().split(" ")[0] + RecordIdsD[i][2]

    let tempDate = RecordIdsD[i][2]
    if (isValidDate_(RecordIds[i][2])) {
      tempDate = Utilities.formatDate(RecordIds[i][2], Session.getScriptTimeZone(), "M/d/yyyy")
    }
    let tempKey2 = RecordIdsD[i][1].toString().toLowerCase().trim().split(" ")[0] + tempDate

    if (patientIdObj.hasOwnProperty(tempKey)) {
      RecordIdsD[i][0] = patientIdObj[tempKey]['id']
    } else if (patientIdObjV.hasOwnProperty(tempKey2)) {
      RecordIdsD[i][0] = patientIdObjV[tempKey2]['id']
    }
  }

  DataSheet.getRange('H2:J').setValues(RecordIdsD)

}





