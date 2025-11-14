
function addDataToRecurringTasksMetricsLog() {

  return
  
  const QuerySheet = SpreadsheetApp.getActive().getSheetByName('Metrics_Query');
  const LogSheet = SpreadsheetApp.getActive().getSheetByName('Metrics_Log');

  console.log('getting log data for all time frequencies ...');

  const AllLogData = {}

  AllLogData['DailyLogData'] = QuerySheet.getRange('A3:I').getDisplayValues().filter(row => row[0] !== '');
  AllLogData['WeeklyLogData'] = QuerySheet.getRange('K3:S').getDisplayValues().filter(row => row[0] !== '');
  AllLogData['MonthlyLogData'] = QuerySheet.getRange('U3:AC').getDisplayValues().filter(row => row[0] !== '');
  AllLogData['QuarterlyLogData'] = QuerySheet.getRange('AE3:AM').getDisplayValues().filter(row => row[0] !== '');
  AllLogData['YearlyLogData'] = QuerySheet.getRange('AO3:AW').getDisplayValues().filter(row => row[0] !== '');


  console.log('consolidating all log data ...');

  let dataValues = [];

  for (const DataLog in AllLogData) {
    // if (DataLog.length > 0)
      dataValues = [...dataValues, ...AllLogData[DataLog]];
  }

  // console.log(dataValues);

  // return;

  if (dataValues.length > 0) {
    console.log('adding data to log sheet ...');
    const LastRow = LogSheet.getLastRow();
    LogSheet.getRange(LastRow + 1, 1, dataValues.length, dataValues[0].length).setValues(dataValues);
  }
  else {
    console.log('no log data found to be updated ...');
  }

}
