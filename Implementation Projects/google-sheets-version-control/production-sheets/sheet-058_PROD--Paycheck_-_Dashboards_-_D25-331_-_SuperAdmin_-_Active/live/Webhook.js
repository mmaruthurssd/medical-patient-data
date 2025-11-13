



//https://script.google.com/macros/s/AKfycbzxcpEVBwIGThFid318esDP3GETOjeVwh0sC-bVTA72vmsivjEkMuzD1n_smPPBX7ni2Q/usercallback



// function doGet(e) {

//   Logger.log(e)
//   Logger.log(e.parameter)

//   // get authorisation code from returned Url
//   let authCode = JSON.stringify(e.parameter.code);
//   Logger.log(authCode)
//   // remove quotes around the code
//   let authCodeClean = authCode.replace(/['"]+/g, '');


//   // run Function to get Token from AuthCode
//   let accessToken = getToken(authCodeClean);


//   // check status of Access Token and display relevant message on webpage
//   if (accessToken) {

//     // return message to webpage to inform user
//     return HtmlService.createHtmlOutput('Success! You can close this tab.');

//   }
//   else {
//     // there was a problem getting Authentication Code
//     // return message to webpage to inform user
//     return HtmlService.createHtmlOutput('Failed. You can close this tab');
//   }

// }





// use Authorisation Code to get a Token
function getToken(authCodeClean) {

  // set authentication and get OAuthKeys
  let encodedKeys = Utilities.base64Encode(CLIENT_ID + ":" + CLIENT_SECRET);

  //Set the HTTP headers
  let options = {
    'method': "post",
    //'headers': { "Authorization": "Basic " + encodedKeys },
  };

  // Web App URL linked to clearlyip OAuth App
  let returnUrl = "https://script.google.com/macros/s/AKfycbzxcpEVBwIGThFid318esDP3GETOjeVwh0sC-bVTA72vmsivjEkMuzD1n_smPPBX7ni2Q/usercallback";


  //let response = UrlFetchApp.fetch("https://w.clearlyip.cloud/api/oauth/token?grant_type=authorization_code&code=" + authCodeClean + "&redirect_uri=" + returnUrl, options);


  let baseURL = "https://apis.paycor.com/sts/v1/common/token?"

  let responseURL1 = baseURL + "subscription-key=" + SUBSCRIPTION_KEY + "&code=" + authCodeClean + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&grant_type=authorization_code&redirect_uri=" + returnUrl + "code_verifier=" + CODE_VERIFIER

  let responseURL2 = "https://hcm-demo.paycor.com/AppActivation/Authorize?client_id=" + CLIENT_ID + "&scope=" + SCOPE + "+offline_access&response_type=code&redirect_uri=" + returnUrl + "&subscription-key=" + SUBSCRIPTION_KEY + "&code_challenge=" + CODE_CHALLENGE + "&code_challenge_method=s256"

  let response = UrlFetchApp.fetch(responseURL1, options)

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







function getNewToken(refresh_token) {
  let url = "https://apis.paycor.com/sts/v1/common/token?subscription-key="+SUBSCRIPTION_KEY;
  let payload = {
    "grant_type": "refresh_token",
    "refresh_token": refresh_token,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET
  };
  let options = {
    "method": "post",
    "contentType": "application/x-www-form-urlencoded",
    "payload": payload,
    "muteHttpExceptions": true // Optional: set to true to catch HTTP exceptions
  };

  let response = UrlFetchApp.fetch(url, options);
  let result = response.getContentText();

  Logger.log(result); // Outputs the result to the Logs (View > Logs)

  let resultObj = JSON.parse(result);

  Logger.log(resultObj)


  return resultObj
}









