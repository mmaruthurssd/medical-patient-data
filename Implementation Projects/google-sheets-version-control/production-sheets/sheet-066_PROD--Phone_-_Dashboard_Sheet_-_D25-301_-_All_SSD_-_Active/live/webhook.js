
//https://script.google.com/macros/s/AKfycbxVl0vhJXnVpBttExuHDzRIUg73VFr_-spsqIPgDq7DRpZqmF4RYTN6KLlFXsPGWydugw/usercallback


const CLIENT_ID = "ng3tFwDWijfxaiZu1XKOmpe4tKbPe_VWHKWsQSeYlGA";
const CLIENT_SECRET = "vrS76lbbvohXCJKiYk5gYBxdj0XEOUd047OJtlVZTcU";

const API_DETAILS_SHEET = "API_Details"



function doGet(e) {

  // get authorisation code from returned Url
  let authCode = JSON.stringify(e.parameter.code);
  // remove quotes around the code
  let authCodeClean = authCode.replace(/['"]+/g, '');


  // run Function to get Token from AuthCode
  let accessToken = getToken(authCodeClean);


  // check status of Access Token and display relevant message on webpage
  if (accessToken) {

    // return message to webpage to inform user
    return HtmlService.createHtmlOutput('Success! You can close this tab.');

  }
  else {
    // there was a problem getting Authentication Code
    // return message to webpage to inform user
    return HtmlService.createHtmlOutput('Failed. You can close this tab');
  }

}





// use Authorisation Code to get a Token
function getToken(authCodeClean) {

  // set authentication and get OAuthKeys
  let encodedKeys = Utilities.base64Encode(CLIENT_ID + ":" + CLIENT_SECRET);

  //Set the HTTP headers
  let options = {
    'method': "post",
    'headers': { "Authorization": "Basic " + encodedKeys },
  };

  // Web App URL linked to clearlyip OAuth App
  let returnUrl = "https://script.google.com/macros/s/AKfycbxVl0vhJXnVpBttExuHDzRIUg73VFr_-spsqIPgDq7DRpZqmF4RYTN6KLlFXsPGWydugw/usercallback";


  let response = UrlFetchApp.fetch("https://w.clearlyip.cloud/api/oauth/token?grant_type=authorization_code&code=" + authCodeClean + "&redirect_uri=" + returnUrl, options);


  // run Function to add Access Token to Spreadsheet
  let resultText = response.getContentText();
  let resultObj = JSON.parse(resultText);
  let accessToken = resultObj['access_token'];
  let refreshToken = resultObj['refresh_token'];

  saveIntoSheet(accessToken, refreshToken);

  // return the Access Token value to the Parent Function
  return accessToken;

}



// Function to copy values into the Google Sheet.
function saveIntoSheet(accessToken, refreshToken) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(API_DETAILS_SHEET);
  sheet.getRange(2, 1, 1, 3).setValues([[new Date(), accessToken, refreshToken]])
}








/**
 * this function is used to get the new access token and refresh token
 */
function getNewTokenMain() {

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(API_DETAILS_SHEET);

  let oldTokenDetails = sheet.getRange(2, 1, 1, 3).getValues()[0];

  let tokenObj = getNewToken(oldTokenDetails[2]);


  let newAccessToken = tokenObj['access_token'];
  let newRefreshToken = tokenObj['refresh_token'];

  saveIntoSheet(newAccessToken, newRefreshToken);

}










/**
 * this function gets the new access token
 * 
 * @param1 {refresh_token} is the string of refresh token
 */
function getNewToken(refresh_token) {
  // set authentication and get OAuthKeys
  let encodedKeys = Utilities.base64Encode(CLIENT_ID + ":" + CLIENT_SECRET);


  //Set the HTTP headers
  let options = {
    'method': "post",
    'headers': { "Authorization": "Basic " + encodedKeys },
  };


  // Web App URL linked to clearlyip OAuth App
  let returnUrl = "https://script.google.com/macros/s/AKfycbyHmmTDI-Jv0Oo0BcQ_gzConjxgokf-IvgUAZBTfh8zTKYAHxDvrpzUk5tdRgWKKHEm/usercallback";

  let response = UrlFetchApp.fetch("https://w.clearlyip.cloud/api/oauth/token?grant_type=refresh_token&refresh_token=" + refresh_token + "&redirect_uri=" + returnUrl, options);


  // run Function to add Access Token to Spreadsheet
  let resultText = response.getContentText();
  let resultObj = JSON.parse(resultText);


  return resultObj
}


















