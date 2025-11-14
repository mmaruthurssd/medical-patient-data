function findPatientIdTest() {
  let PatientSS = SpreadsheetApp.openById("10VrrYyiGmOx4cuAMQfJd0A9pDTQ_QVgGdxgjElkasxU");
  let PatientSheet = PatientSS.getSheetByName("Patients_Data")
  let patientIds = PatientSheet.getRange("A2:A").getValues()
  //let patientPhones = PatientSheet.getRange("O2:P").getValues().map(r => [extractNumbers(r[0]), extractNumbers(r[1])])
  let patientPhones = PatientSheet.getRange("O2:P").getValues()
  let patientNames = PatientSheet.getRange("AB2:AB").getValues()

  let patientPhoneObj = {}
  patientPhones.forEach((row, index) => {
    let phone1 = extractNumbers_(row[0])
    let phone2 = extractNumbers_(row[1])

    if (phone1 != "" && phone1 != null) {
      patientPhoneObj[phone1] = { name: patientNames[index][0], id: patientIds[index][0] }
    }

    if (phone2 != "" && phone2 != null) {
      patientPhoneObj[phone2] = { name: patientNames[index][0], id: patientIds[index][0] }
    }

  })


  Logger.log(patientPhoneObj)

  let SS = SpreadsheetApp.getActiveSpreadsheet();
  let FaxLogSheet = SS.getSheetByName("Incoming_Fax_Log")
  let faxLogData = FaxLogSheet.getRange("A2:G").getDisplayValues()

  // return
  Logger.log("Yes")



  for (var i = 0; i < faxLogData.length; i++) {

    let fromNumber = extractNumbers_(faxLogData[i][4])
    if (patientPhoneObj[fromNumber]) {
      FaxLogSheet.getRange(i + 2, 8, 1, 2).setValues([[patientPhoneObj[fromNumber]["id"], patientPhoneObj[fromNumber]["name"]]])
    }
    // if (fromNumber == patientPhones[i][0] || fromNumber == patientPhones[i][1]) {
    //   FaxLogSheet.getRange("H3:I3").setValue([[patientIds[i][0], patientNames[i][0]]])
    //   break
    // }
  }
  //Logger.log(extractNumbers("205-814-1515"))
  //Logger.log(patientIds)
}





