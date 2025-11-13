


const PASTE_401K_SHEET = "Paste_401K"


const DATA_401K_SHEET = "401K Data"


// function onOpen() {
//   let ui = SpreadsheetApp.getUi();

//   let menu = ui.createMenu("Custom")

//   menu.addItem("Process Raw 401K", "process401KData").addToUi()
// }



function process401KData() {


  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sourceSheet = ss.getSheetByName(PASTE_401K_SHEET)


  let data = sourceSheet.getRange('A8:K').getValues();
  let headers = data.splice(0, 1)[0];

  let firstNameIndex = headers.indexOf("First Name")
  let lastNameIndex = headers.indexOf("Last Name")
  let totalBalanceIndex = headers.indexOf("Total Balance")

  let statusIndex = headers.indexOf("Participant Status")



  // Get the date from cell C6
  let dateStr = sourceSheet.getRange('B6').getValue().split("As of: ")[1];
  let dateStrSplit = dateStr.split("/")
  let date = new Date(2000 + Number(dateStrSplit[2]), Number(dateStrSplit[0]) - 1, Number(dateStrSplit[1]))

  // Prepare an array to hold the processed data
  let outputData = [];

  // Loop through the data rows
  for (var i = 0; i < data.length; i++) {
    let firstName = data[i][firstNameIndex];
    let lastName = data[i][lastNameIndex];
    let totalBalance = data[i][totalBalanceIndex];
    let status = data[i][statusIndex];

    if (firstName.toString().trim() == "" && lastName.toString().trim() == "") continue

    // Combine first and last name with a space
    let fullName = firstName + ' ' + lastName;

    // Add the processed row to the output array
    outputData.push([fullName.toString().trim(), date, totalBalance, status]);
  }



  let targetSheet = ss.getSheetByName(DATA_401K_SHEET)


  // Write the output data to the target sheet starting from A1
  targetSheet.getRange(targetSheet.getLastRow() + 1, 1, outputData.length, outputData[0].length).setValues(outputData);

  targetSheet.getRange(2, 1, targetSheet.getLastRow() - 1, targetSheet.getLastColumn()).sort([{ column: 2, ascending: false }])

  sourceSheet.clear()
}


















