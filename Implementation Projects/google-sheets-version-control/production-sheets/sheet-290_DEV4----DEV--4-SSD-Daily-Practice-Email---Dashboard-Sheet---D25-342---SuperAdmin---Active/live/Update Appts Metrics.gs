
const APPOINTMENTS_DATA_SS_ID = "1u3j2fqx7jlVXaQOynpuxs_0KHNiHSkUX53nz7L_7s54";
const APP_DATA_SHEET = "Future Appointments";

const TWO_DAYS_DATABASE_SHEET = "Future_Appt_Data";
const APP_METRICS_SHEET = "Appt_Metrics";


function updateAppointmentsMetrics() {

  return

  let appSS = SpreadsheetApp.openById(APPOINTMENTS_DATA_SS_ID);
  let appSheet = appSS.getSheetByName(APP_DATA_SHEET);

  let allData = appSheet.getRange(1, 1, appSheet.getLastRow(), appSheet.getLastColumn()).getValues();

  let headers = allData.splice(0, 1);

  let dateIndex = headers[0].indexOf("Appointment Date");
  let typeIndex = headers[0].indexOf("Type");
  let drIndex = headers[0].indexOf("Dr");
  let providerIndex = headers[0].indexOf("Provider");
  let locationIndex = headers[0].indexOf("Location");

  let todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  //let day = todayDate.getDay();
  let todayTime = todayDate.getTime()



  //here filtering data to get 2 days data
  let filteredData = []
  allData.forEach(function (row) {
    if (isValidDate_(row[dateIndex])) {

      let rowFullDate = Utilities.formatDate(new Date(row[dateIndex]), 'GMT-6', 'yyyy/M/d')

      if (row[dateIndex].getTime() >= todayTime) {
        filteredData.push([rowFullDate, row[typeIndex], row[drIndex], row[providerIndex], row[locationIndex]])
      }

    }
  })

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataBaseSheet = ss.getSheetByName(TWO_DAYS_DATABASE_SHEET);
  let apptMatricSheet = ss.getSheetByName(APP_METRICS_SHEET);

  if (dataBaseSheet.getLastRow() > 1) {
    dataBaseSheet.getRange(2, 1, dataBaseSheet.getLastRow() - 1, dataBaseSheet.getLastColumn()).clearContent()
  }

  if (apptMatricSheet.getLastRow() > 1) {
    apptMatricSheet.getRange(2, 1, apptMatricSheet.getLastRow() - 1, 5).clearContent()
  }

  if (filteredData.length > 0) {
    dataBaseSheet.getRange(2, 1, filteredData.length, filteredData[0].length).setValues(filteredData)

    //findind and filtering the provider and location
    let uniqueValues = {};
    let providerDetails = [];
    for (var i = 0; i < filteredData.length; i++) {
      let key = filteredData[i][0] + " " + filteredData[i][2].toString().trim() + " " + filteredData[i][3].toString().trim() + " " + filteredData[i][4].toString().trim()

      if (!uniqueValues[key]) {
        providerDetails.push(["", filteredData[i][0], filteredData[i][2], filteredData[i][3], filteredData[i][4]])
        uniqueValues[key] = true; // Mark it as seen
      }
    }

    apptMatricSheet.getRange(2, 1, providerDetails.length, providerDetails[0].length).setValues(providerDetails)
  }

}

