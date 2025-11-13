
//https://script.google.com/a/macros/ssdspc.com/s/AKfycbz-lSeeT1cF7fSbhlmdeOVH-y3cf_kII9rXwaFbIpayPOhFAxOmUXLgDnf9l05-oBlz/exec?name=Rashid%20Khan&Date=01/01/2024

//anyone with ssdc
//https://script.google.com/a/macros/ssdspc.com/s/AKfycby7VxjaOoaduatGguSMXX5_YMmW2_Rf8t3M3KICfZQaAdT0mGZoxPOKUbCiEynxLLMq/exec

function doGet(e) {
  return handleRequest(e);
}



function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  return handleRequest({ parameter: params });
}



function handleRequest(e) {
  const ss = SpreadsheetApp.openById("1ocFHiT3bCrMcEVZBQqIdUPbL544pgOE8M2KLDoGHub0");

  const sheet = ss.getSheetByName("Providers Fixed Mips")

  const title = e.parameter.title || "No Title Provided";
  const date = e.parameter.date || "No Date Provided";
  const patientName = e.parameter.name || "No Name Provided";
  const mrn = e.parameter.mrn || "No Mrn Provided";
  const provider = e.parameter.provider || "No Provider Provided";
  const facility = e.parameter.facility || "No Mrn Provided";


  // Append data to the sheet
  //sheet.appendRow([new Date(), title, date, patientName, mrn, provider, facility]);


  sheet.getRange(sheet.getLastRow() + 1, 1, 1, 7).setValues([[new Date(), title, date, patientName, mrn, provider, facility]])

  let uniqueMipsSheet = ss.getSheetByName(UNIQUE_MIPS_SHEET);
  let allIds = uniqueMipsSheet.getRange(1, 3, uniqueMipsSheet.getLastRow(), 1).getValues().map(r => r[0]);


  let fixedId = title + date + mrn;
  let fixedIdIndex = allIds.indexOf(fixedId);


  if (fixedIdIndex > -1) {
    uniqueMipsSheet.getRange(fixedIdIndex + 1, 16).setValue("Yes")
  }



  return ContentService.createTextOutput("Successfull")


  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Data added successfully", data: { name, date } })
  ).setMimeType(ContentService.MimeType.JSON);
}




function testSendingEmail() {


  let subject = "Test button";

  let htmlBody = `<html><body><p>
        <a href="https://script.google.com/a/macros/ssdspc.com/s/AKfycbz-lSeeT1cF7fSbhlmdeOVH-y3cf_kII9rXwaFbIpayPOhFAxOmUXLgDnf9l05-oBlz/exec?name=Rashid%20Khan&Date=01/01/2024" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Approve</a>
      </p>
    </body>
  </html>`

  GmailApp.sendEmail("rashid_khan143@yahoo.com", subject, "", {
    htmlBody: htmlBody
  });


}








