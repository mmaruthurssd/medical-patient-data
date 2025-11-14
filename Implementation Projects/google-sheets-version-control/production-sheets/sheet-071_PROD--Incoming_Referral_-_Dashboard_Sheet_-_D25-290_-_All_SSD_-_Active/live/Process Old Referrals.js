

const EMA_APPT_SS_ID = "10itZumv5xj-LkjfiajY97HMcq-63cXvd4zgZfiQyCxU"

function oldReferralsProcessPostEma() {


  const scriptProperties = PropertiesService.getScriptProperties();

  const data = scriptProperties.getProperties();





  if (data.executeScript === "No") return

  scriptProperties.setProperties({ "executeScript": "No" })



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(INCOMING_REFERRAL_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues()



  let apptCompleteSheet = ss.getSheetByName("Visit Complete")

  let postNotesSheet = ss.getSheetByName("Visit Complete - Post-Visit Notes To Be Sent")

  let unscheSheet = ss.getSheetByName("Unable to Scheduled")

  let scheAttemptsSheet = ss.getSheetByName("Scheduling Attempts")



  let endTime_ = new Date(2024, 3, 20).getTime()
  let startTime_ = new Date(2024, 0, 1).getTime()


  let emaApptSS = SpreadsheetApp.openById(EMA_APPT_SS_ID)
  let apptSheet = emaApptSS.getSheetByName("Appointments")
  let allAppts = apptSheet.getRange(1, 1, apptSheet.getLastRow(), 21).getValues();
  let allApptsDisp = apptSheet.getRange(1, 1, apptSheet.getLastRow(), 21).getDisplayValues();





  for (var i = 0; i < allData.length; i++) {

    if (isValidDate_(allData[i][2])) {
      if (allData[i][2].getTime() >= startTime_ && allData[i][2].getTime() <= endTime_ && (allData[i][11] != "" && allData[i][11] != null) && allData[i][4] == "" && allData[i][8] == "" && allData[i][0] == 0) {

        let patientAppts = allAppts.filter(row => row[5] == allData[i][11])
        let patientApptsDisp = allApptsDisp.filter(row => row[5].toString() == allData[i][11])
        // Logger.log(patientAppt)
        // break

        for (var j = 0; j < patientAppts.length; j++) {

          if (isValidDate_(patientAppts[j][1]) && patientAppts[j][1].getTime() > allData[i][2].getTime()) {
            if (patientAppts[j][3] == "Checked Out") {

              let rowData = [allData[i][1], allData[i][2], allData[i][3], allData[i][11], allData[i][12], allData[i][13], "", "", "", patientAppts[j][13], patientApptsDisp[j][1], patientApptsDisp[j][2], "Scheduled", "", allData[i][14], allData[i][15], allData[i][16], allData[i][17], allData[i][19], allData[i][20], "", "Complete"]
              apptCompleteSheet.appendRow(rowData);



              if (allData[i][17] == "Mohs/Surgery") {
                let notesRowData = [allData[i][1], allData[i][2], allData[i][3], "", allData[i][11], allData[i][12], allData[i][13], "", "", "", patientAppts[j][13], patientApptsDisp[j][1], patientApptsDisp[j][2], "Scheduled", "Yes", allData[i][14], allData[i][15], allData[i][16], allData[i][17], allData[i][19], allData[i][20], "", "Complete"]
                postNotesSheet.appendRow(notesRowData);

                sheet.getRange(i + 1, 19).setValue("Yes")
              }

              sheet.getRange(i + 1, 5).setValue("Complete")
              //sheet.getRange(i + 1, 5).setValue("Yes")
              sheet.getRange(i + 1, 9).setValue(patientAppts[j][1])

              break

            } else if (patientAppts[j][3] == "CX" || patientAppts[j][3] == "NS") {

              let apptStatus = "";
              if (patientAppts[j][3] == "NS") {
                apptStatus = "Patient no-showed appointment"
              } else if (patientAppts[j][3] == "CX") {
                apptStatus = "Patient Declined"
              }

              let rowData = [allData[i][1], allData[i][2], allData[i][3], allData[i][11], allData[i][12], allData[i][13], "", "", "", patientAppts[j][13], patientApptsDisp[j][1], patientApptsDisp[j][2], apptStatus, "", allData[i][14], allData[i][15], allData[i][16], allData[i][17], allData[i][19], allData[i][20]]
              unscheSheet.appendRow(rowData);

              if (patientAppts[j][3] == "NS") {
                sheet.getRange(i + 1, 5).setValue("Patient no-showed appointment")
                sheet.getRange(i + 1, 9).setValue(patientAppts[j][1])
              } else if (patientAppts[j][3] == "CX") {
                sheet.getRange(i + 1, 5).setValue("Patient Declined")
                sheet.getRange(i + 1, 9).setValue(patientAppts[j][1])
              }

              sheet.getRange(i + 1, 8).setValue("No Show/Cancelled")

              break



            } else if (patientAppts[j][3] == "Pending" || patientAppts[j][3] == "Confirmed") {


              let rowData = [[allData[i][1], allData[i][2], allData[i][3], allData[i][11], allData[i][12], allData[i][13], patientAppts[j][20], "", "", patientAppts[j][13], patientApptsDisp[j][1], patientApptsDisp[j][2], "Scheduled", allData[i][19], allData[i][20], allData[i][18], allData[i][14], allData[i][15], allData[i][16], allData[i][17], allData[i][22]]]


              let scheAttempRow = scheAttemptsSheet.getRange("SCHE_NO_ATTEMPTS").getRow();
              scheAttemptsSheet.insertRows(scheAttempRow + 1, rowData.length);
              scheAttemptsSheet.getRange(scheAttempRow + 1, 1, rowData.length, rowData[0].length).setValues(rowData)

              break

            }


          }

        }


        //break


      }

    }
  }



  scriptProperties.setProperties({ "executeScript": "Yes" })




}















function oldReferralsProcess() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(INCOMING_REFERRAL_SHEET);

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues()



  let apptCompleteSheet = ss.getSheetByName("Visit Complete")

  let postNotesSheet = ss.getSheetByName("Visit Complete - Post-Visit Notes To Be Sent")

  let unscheSheet = ss.getSheetByName("Unable to Scheduled")

  //let scheAttemptsSheet = ss.getSheetByName("Scheduling Attempts")



  let endTime_ = new Date(2024, 3, 20).getTime()
  let startTime_ = new Date(2024, 0, 1).getTime()


  let emaApptSS = SpreadsheetApp.openById("1u3j2fqx7jlVXaQOynpuxs_0KHNiHSkUX53nz7L_7s54")
  let apptSheet = emaApptSS.getSheetByName("Appointments_Data")
  let allAppts = apptSheet.getRange(1, 1, apptSheet.getLastRow(), 4).getValues();
  let allApptsDisp = apptSheet.getRange(1, 1, apptSheet.getLastRow(), 4).getDisplayValues();


  let pstSS = SpreadsheetApp.openById("1jLZtwyI1ekqO86VV03tZIbx3TAlHZdm4viuznnJGDVM")
  let pstSheet = pstSS.getSheetByName("ApptsRD (Legacy)")
  let allApptsPST = pstSheet.getRange(1, 1, pstSheet.getLastRow(), 10).getValues();
  let allApptsDispPST = pstSheet.getRange(1, 1, pstSheet.getLastRow(), 10).getDisplayValues();





  for (var i = 0; i < allData.length; i++) {

    if (isValidDate_(allData[i][2])) {
      if (allData[i][2].getTime() >= startTime_ && allData[i][2].getTime() <= endTime_ && (allData[i][11] != "" && allData[i][11] != null) && allData[i][0] == 0) {

        let patientApptsPST = allApptsPST.filter(row => row[0] == allData[i][11] && row[9] != "RES")
        let patientApptsDispPST = allApptsDispPST.filter(row => row[0].toString() == allData[i][11] && row[9] != "RES")

        let patientAppts = allAppts.filter(row => row[0] == allData[i][11])
        let patientApptsDisp = allApptsDisp.filter(row => row[0].toString() == allData[i][11])

        // Logger.log(patientAppt)
        // break

        for (var j = 0; j < patientApptsPST.length; j++) {

          if (isValidDate_(patientApptsPST[j][2]) && patientApptsPST[j][2].getTime() > allData[i][2].getTime()) {

            for (var k = 0; k < patientAppts.length; k++) {

              if (patientApptsDisp[k][1] == patientApptsDispPST[j][2]) {

                if (patientApptsDispPST[j][9] == "X") {

                  let rowData = [allData[i][1], allData[i][2], allData[i][3], allData[i][11], allData[i][12], allData[i][13], "", "", "", "", patientApptsDispPST[j][2], patientApptsDisp[k][2] + " " + patientApptsDisp[k][3], "Scheduled", "", allData[i][14], allData[i][15], allData[i][16], allData[i][17], allData[i][19], allData[i][20], "", "Complete"]
                  apptCompleteSheet.appendRow(rowData);



                  if (allData[i][17] == "Mohs/Surgery") {
                    let notesRowData = [allData[i][1], allData[i][2], allData[i][3], "", allData[i][11], allData[i][12], allData[i][13], "", "", "", patientAppts[j][13], patientApptsDispPST[j][2], patientApptsDisp[k][2] + " " + patientApptsDisp[k][3], "Scheduled", "Yes", allData[i][14], allData[i][15], allData[i][16], allData[i][17], allData[i][19], allData[i][20], "", "Complete"]
                    postNotesSheet.appendRow(notesRowData);

                    sheet.getRange(i + 1, 19).setValue("Yes")
                  }

                  sheet.getRange(i + 1, 5).setValue("Complete")
                  //sheet.getRange(i + 1, 5).setValue("Yes")
                  sheet.getRange(i + 1, 9).setValue(patientAppts[j][1])

                  break

                }



                else if (patientApptsDispPST[j][9] == "Cancel" || patientApptsDispPST[j][9] == "NS" || patientApptsDispPST[j][9] == "Void") {

                  let apptStatus = "";
                  if (patientAppts[j][3] == "NS") {
                    apptStatus = "Patient no-showed appointment"
                  } else {
                    apptStatus = "Patient Declined"
                  }

                  let rowData = [allData[i][1], allData[i][2], allData[i][3], allData[i][11], allData[i][12], allData[i][13], "", "", "", "", patientApptsDispPST[j][2], patientApptsDisp[k][2] + " " + patientApptsDisp[k][3], apptStatus, "", allData[i][14], allData[i][15], allData[i][16], allData[i][17], allData[i][19], allData[i][20]]
                  unscheSheet.appendRow(rowData);

                  if (patientAppts[j][9] == "NS") {
                    sheet.getRange(i + 1, 5).setValue("Patient no-showed appointment")
                    sheet.getRange(i + 1, 9).setValue(patientAppts[j][1])
                  } else {
                    sheet.getRange(i + 1, 5).setValue("Patient Declined")
                    sheet.getRange(i + 1, 9).setValue(patientAppts[j][1])
                  }

                  sheet.getRange(i + 1, 8).setValue("No Show/Cancelled")

                  break



                }



              }

            }

            break

          }

        }


        //break


      }

    }
  }


}







//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}



