
const WEBAPP_URL=""




function downloadAliasMailAttachmentsManuall(){
  let request = {
    //"url":WEBAPP_URL,
    "method" : "post",
    "muteHttpExceptions": true,
    "headers": {
      "Authorization" : "Bearer "+ScriptApp.getOAuthToken(),
    },
  }


  let response = UrlFetchApp.fetch(WEBAPP_URL, request);

  Logger.log(response)

}






function doPost(e) {
  let result = "Success";

  try {
    //downloadAliasMailAttachments()

    Logger.log("Function Will Run Here")

  } catch (err) {
    result = err.message;
    Logger.log("FAILED: " + result)
  }

  return ContentService.createTextOutput(result)
}










