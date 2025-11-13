

//https://script.google.com/macros/s/AKfycbxvI8IKjxMy6tKpMNCfdgXN939_4bVcOU4MQ9z7twFq1Aj7ap67SjMeeIj8464lsmcp/exec





const PROVIDERS_VISITS_TO_FIX_SS_ID = "1WdMe_QKAjO25mXKrNIOf75mRUDXdoo7n0KOuyBOJZNw"
const AK_SHEET_ID = '0'
const LM_SHEET_ID = '2083119868'
const MM_SHEET_ID = '836562873'
const KP_SHEET_ID = '1938576176'
const ES_SHEET_ID = '1785541561'
const MD_SHEET_ID = '270451626'
const MG_SHEET_ID = '1730006615'



function doGet(e) {

  let page = handleRequest(e)
  return page.evaluate();

}



function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  return handleRequest({ parameter: params });
}




function handleRequest(e) {


  const title = e.parameter.title || "No Title Provided";
  const date = e.parameter.date || "No Date Provided";
  const patientName = e.parameter.name || "No Name Provided";
  const mrn = e.parameter.mrn || "No Mrn Provided";
  const provider = e.parameter.provider || "No Provider Provided";
  const facility = e.parameter.facility || "No Mrn Provided";



  const ss = SpreadsheetApp.openById(PROVIDERS_VISITS_TO_FIX_SS_ID);
  let sheet = null
  let page = ""

  if (provider == "Keely, Adrienne") {
    sheet = getSheetByID_(ss, AK_SHEET_ID)
    page = "akPage"
  } else if (provider == "Miller, Lauren") {
    sheet = getSheetByID_(ss, LM_SHEET_ID)
    page = "lmPage"
  } else if (provider == "Maruthur, Mario") {
    sheet = getSheetByID_(ss, MM_SHEET_ID)
    page = "mmPage"
  } else if (provider == "Parker, Kaitlyn") {
    sheet = getSheetByID_(ss, KP_SHEET_ID)
    page = "kpPage"
  } else if (provider == "Stephens, Emma") {
    sheet = getSheetByID_(ss, ES_SHEET_ID)
    page = "esPage"
  } else if (provider == "Downing, Malia") {
    sheet = getSheetByID_(ss, MD_SHEET_ID)
    page = "mdPage"
  } else if (provider == "McMahan, Grace") {
    sheet = getSheetByID_(ss, MG_SHEET_ID)
    page = "mgPage"
  }








  let allIds = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().map(r => r[0]);


  let fixedId = title + date + mrn;
  let fixedIdIndex = allIds.indexOf(fixedId);


  if (fixedIdIndex > -1) {
    sheet.getRange(fixedIdIndex + 1, 14).setValue("Yes")
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{ column: 14, ascending: false }])
  }


  return HtmlService.createTemplateFromFile(page)


}





function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();

  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
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























