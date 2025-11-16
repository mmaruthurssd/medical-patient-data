

const API_DETAILS_SHEET = "API_Details"




const CLIENT_ID = "ABEShxvUqD3TTVHtSDsUOgAI120foZEoaCDxbjZoGS8baiCAwX"
const CLIENT_SECRET = "Fgmi6abjqOSneS8SkKZLK4lU2uNZ9LpNfb17VM2H"
//9130351010041306





function createTriggerNew() {
  ScriptApp.newTrigger("apiProcessTrigger")
    .timeBased()
    .everyDays(1)
    .atHour(16)
    .nearMinute(0)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}




/**
 * this function is used to get the new access token and refresh token
 */
function getNewTokenMain_() {

  return

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(API_DETAILS_SHEET);

  let oldTokenDetails = sheet.getRange(2, 1, 1, 3).getValues()[0];

  let tokenObj = getNewToken_(oldTokenDetails[2]);


  let newAccessToken = tokenObj['access_token'];
  let newRefreshToken = tokenObj['refresh_token'];

  sheet.getRange(2, 1, 1, 3).setValues([[new Date(), newAccessToken, newRefreshToken]])
}




/**
 * this function gets the new access token
 * 
 * @param1 {refresh_token} is the string of refresh token
 */
function getNewToken_(refresh_token) {
  // set authentication and get OAuthKeys
  let encodedKeys = Utilities.base64Encode(CLIENT_ID + ":" + CLIENT_SECRET);


  let url = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': "Basic " + encodedKeys
  };
  let payload = {
    'grant_type': 'refresh_token',
    'refresh_token': refresh_token
  };

  let options = {
    'method': 'post',
    'headers': headers,
    'payload': payload
  };

  let response = UrlFetchApp.fetch(url, options);
  let resultText = response.getContentText();
  let resultObj = JSON.parse(resultText);


  return resultObj
}














