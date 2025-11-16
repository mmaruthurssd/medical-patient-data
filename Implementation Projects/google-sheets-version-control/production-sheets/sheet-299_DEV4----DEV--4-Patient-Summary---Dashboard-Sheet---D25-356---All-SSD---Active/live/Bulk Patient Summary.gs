
function sortDataFromDataTime_({ data, vIndexDate, vIndexTime }) {
  data.sort(function (a, b) {
    return (new Date(`${a[vIndexDate]} ${a[vIndexTime]}`)).getTime() - (new Date(`${b[vIndexDate]} ${b[vIndexTime]}`)).getTime(); // Ascending sort
  });

  return data;
}

function deleteAllTempFiles() {

  const TempFolder = DriveApp.getFolderById('1t__eFamTfu84UrmpfPyuAKVtAWfIuYm-');
  const AllFiles = TempFolder.getFiles();

  while (AllFiles.hasNext()) {
    try {
      const File = AllFiles.next();
      console.log(File.getName())
      File.setTrashed(true);
    }
    catch (e) {
      console.log(e);
    }
  }

}

function createBulkPatientSummary_(ProviderName, AppointmentDate) {

  const AllIdsObj = {
    'PreEMAAppts': '1-IkpnWYCkEmtMKT9zKFYAXMB16ADEwEhxwCw92pm528',
    'EMAAppts': '10itZumv5xj-LkjfiajY97HMcq-63cXvd4zgZfiQyCxU',
    'AllPreEMABiopsies': '1o_29L0d7mjg_AmUzHhWUZ9hk3Lf63v-V7k4v0Q7MiXk',
    'PreEMABiopsies': '1NCjKtqQ9SBxDC5HH2R968c2-DrouJaGguPPULfAM06U',
    'EMABiopsies': '1SJM5-Gk1QdIcDxN1NMZB0d9yr-mULBKUI_DWdzz3Ebo',
    'RefBiopsies': '1KVO0_p9IvBnKzo6HL5IDy3rq43NKtaeYnMTK4frEj-k',
    'Patients': '10VrrYyiGmOx4cuAMQfJd0A9pDTQ_QVgGdxgjElkasxU',
    'Documents': '14YH1iw1rGDlULfzhXEcbjc2TnKYmxQI55C2VW3iZTuc',
    'HighRiskSkinCancer': '1ER8av6EJc60hl19GycosaXa_yaOk88GOHIQToNlbjKI',
    'DocTemplate': '19pZgfghuU1Gyo2RXW56z76iqKykm7ZSMOReRWRNdqNQ',
    'DocsFolder': '1PHvOEIG2bxLRE047ab1AmAO4t7egcrpd',
    'TempFolder': '1t__eFamTfu84UrmpfPyuAKVtAWfIuYm-'
  }

  const AllSheetsObj = {
    'PreEMAAppts': 'Appointments',
    'EMAAppts': 'Appointments',
    'PreEMABiopsies': 'Pre-EMA Results',
    'PreEMASkinDx': 'Pre-EMA SkinDx',
    'EMABiopsies': 'Pathology Results',
    'EMASkinDx': 'SkinDx',
    'RefBiopsies': 'ExportBulk',
    'Patients': 'Patients_Data',
    'Documents': 'Documents_Log',
    'HighRiskSkinCancer': 'Bulk_Doc_Data'
  }

  const DocTemplate = DriveApp.getFileById(AllIdsObj['DocTemplate']);
  const DocsFolder = DriveApp.getFolderById(AllIdsObj['DocsFolder']);
  const TempFolder = DriveApp.getFolderById(AllIdsObj['TempFolder']);

  console.log('creating bulk patient summary for ' + ProviderName + ' dated ' + AppointmentDate);


  console.log('getting pre-ema appointments data ...');

  const PreEMAApptsSpreadsheet = SpreadsheetApp.openById(AllIdsObj['PreEMAAppts']);
  const PreEMAApptsSheet = PreEMAApptsSpreadsheet.getSheetByName(AllSheetsObj['PreEMAAppts']);

  // patient id, appt date, provider name, appt type, patient name, dob, appt status
  // const PreEMAApptsData = PreEMAApptsSheet.getRange('A2:O').getDisplayValues()
  const PreEMAApptsData = sortDataFromDataTime_({ data: PreEMAApptsSheet.getRange('A2:O').getDisplayValues(), vIndexDate: 1, vIndexTime: 2 })
    .filter(row => row[0] !== '' && row[1] !== '')
    .map(row => [row[0], row[1], row[13], row[4], row[7] + ' ' + row[6], '', '']);


  console.log('getting ema appointments data ...');

  const EMAApptsSpreadsheet = SpreadsheetApp.openById(AllIdsObj['EMAAppts']);
  const EMAApptsSheet = EMAApptsSpreadsheet.getSheetByName(AllSheetsObj['EMAAppts']);

  // patient id, appt date, provider name, appt type, patient name, dob, appt status
  // const EMAApptsData = EMAApptsSheet.getRange('A2:S').getDisplayValues()
  const EMAApptsData = sortDataFromDataTime_({ data: EMAApptsSheet.getRange('A2:S').getDisplayValues(), vIndexDate: 1, vIndexTime: 2 })
    .filter(row => row[5] !== '' && row[1] !== '')
    .map(row => [row[5], row[1], row[15], row[4], row[6], row[7], row[3]]);

  const AllApptsData = [...PreEMAApptsData, ...EMAApptsData];

  const TodaysApptsData = AllApptsData.filter(row => row[1] === AppointmentDate && row[2] === ProviderName &&
    (row[6] === 'Confirmed' || row[6] === 'Pending'));

  if (TodaysApptsData.length === 0) {
    console.log('no data found for the selected provider and/or appointment date ...');
    return 'no data found';
  }

  const ApptPatientIds = TodaysApptsData.map(row => row[0].toString());
  const PatientIds = [...new Set(ApptPatientIds)];


  console.log('creating patients data object ...');

  const PatientsDataObj = {};

  TodaysApptsData.forEach(DataRow => {

    const PatientId = DataRow[0].toString();
    const PatientFullName = DataRow[4];
    const PatientFirstName = PatientFullName.split(' ')[0];
    // const PatientName = [PatientFullName[0], PatientFullName[PatientFullName.length - 1]].join(' ');
    const PatientDob = DataRow[5];
    const ApptType = DataRow[3];

    PatientsDataObj[PatientId] = [
      [PatientFullName, PatientDob].join('_'),
      [PatientId, PatientFirstName, PatientDob].join('_'),
      ApptType
    ];

  });


  console.log('getting pre-ema biopsies data ...');

  const PreEMABiopsySpreadsheet = SpreadsheetApp.openById(AllIdsObj['PreEMABiopsies']);
  const PreEMABiopsySheet = PreEMABiopsySpreadsheet.getSheetByName(AllSheetsObj['PreEMABiopsies']);

  // patient id, coll date, provider, site, diagnosis, primary group, path result status, patient name, dob, spec id
  const PreEMABiopsiesData = PreEMABiopsySheet.getRange('A2:V').getDisplayValues()
    .filter(row => row[1] !== '' && row[8] !== '')
    .map(row => [row[8], row[1], row[20], row[12], row[15],
    row[6], row[4], row[9], row[10], '']);


  console.log('getting pre-ema skindx data ...');

  const PreEMASkinDxSpreadsheet = SpreadsheetApp.openById(AllIdsObj['AllPreEMABiopsies']);
  const PreEMASkinDxSheet = PreEMASkinDxSpreadsheet.getSheetByName(AllSheetsObj['PreEMASkinDx']);

  // patient id, coll date, provider, site, diagnosis, primary group, path result status, patient name, dob, spec id
  const PreEMASkinDxData = PreEMASkinDxSheet.getRange('A2:L').getDisplayValues()
    .filter(row => row[4] !== '' && row[6] !== '')
    .map(row => [row[4], row[6], row[5], row[10], row[11],
      '', '', row[2], row[3], row[9]]);


  console.log('getting ema biopsies & skindx data ...');

  const EMABiopsySpreadsheet = SpreadsheetApp.openById(AllIdsObj['EMABiopsies']);
  const EMAPathologySheet = EMABiopsySpreadsheet.getSheetByName(AllSheetsObj['EMABiopsies']);
  const EMASkinDxSheet = EMABiopsySpreadsheet.getSheetByName(AllSheetsObj['EMASkinDx']);

  // patient id, coll date, provider, site, diagnosis, primary group, path result status, patient name, dob, spec id
  const EMAPathologyData = EMAPathologySheet.getRange('A2:U').getDisplayValues()
    .filter(row => row[1] !== '' && row[7] !== '')
    .map(row => [row[7], row[1], row[19], row[11], row[14],
    row[5], row[4], row[8], row[9], '']);


  // patient id, coll date, provider, site, diagnosis, primary group, path result status, patient name, dob, spec id
  const EMASkinDxData = EMASkinDxSheet.getRange('A2:L').getDisplayValues()
    .filter(row => row[4] !== '' && row[6] !== '')
    .map(row => [row[4], row[6], row[5], row[10], row[11],
      '', '', row[2], row[3], row[9]]);


  console.log('getting ref biopsies & skindx data ...');

  const RefBiopsySpreadsheet = SpreadsheetApp.openById(AllIdsObj['RefBiopsies']);
  const RefBiopsySheet = RefBiopsySpreadsheet.getSheetByName(AllSheetsObj['RefBiopsies']);
  const RefBiopsyData = RefBiopsySheet.getRange('A2:I').getDisplayValues()
    .filter(row => row[0] !== '' && row[3] !== '');

  // patient id, coll date, provider, site, diagnosis, primary group, path result status, patient name, dob, spec id
  const RefPathologyData = RefBiopsyData.map(row => [row[0], row[4], '(Ref) ' + row[5], row[7], row[8],
    'cancerous', row[9] === 'Scheduled' ? row[9] : 'Completed',
  row[1], row[2], '']);

  // patient id, coll date, provider, site, diagnosis, primary group, path result status, patient name, dob, spec id
  const RefSkinDxData = RefBiopsyData.map(row => [row[0], row[4], '(Ref) ' + row[5], row[7],
  row[8], '', '', row[1], row[2], row[6]]);


  console.log('merging all biopsies & skindx data ...');

  const PreEMAPlusPathology = [...PreEMABiopsiesData, ...EMAPathologyData, ...RefPathologyData];
  const PreEMAPlusSkinDx = [...PreEMASkinDxData, ...EMASkinDxData, ...RefSkinDxData];


  console.log('getting high risk patients data ...');

  const HighRiskSpreadsheet = SpreadsheetApp.openById(AllIdsObj['HighRiskSkinCancer']);
  const HighRiskSheet = HighRiskSpreadsheet.getSheetByName(AllSheetsObj['HighRiskSkinCancer']);
  const HighRiskData = HighRiskSheet.getRange('A2:J').getDisplayValues().filter(row => row[0] !== '');


  const AllNewDocIds = [];
  const DocsToDelete = [];

  PatientIds.forEach(PatientId => {

    console.log('creating note for patient id ' + PatientId + ' ...');

    const DocDataObject = {};

    DocDataObject['_PatientId'] = PatientId;
    DocDataObject['_HR'] = '';
    DocDataObject['_ApptType'] = (PatientId in PatientsDataObj) ? PatientsDataObj[PatientId][2] : 'N/A';
    DocDataObject['_PatientName'] = (PatientId in PatientsDataObj) ? PatientsDataObj[PatientId][0] : 'N/A';

    const PastAppts = AllApptsData.filter(row => row[0].toString() === PatientId &&
      new Date(row[1]).getTime() < new Date(AppointmentDate).getTime());

    const FutureAppts = AllApptsData.filter(row => row[0].toString() === PatientId &&
      new Date(row[1]).getTime() > new Date(AppointmentDate).getTime());

    const SearchKey = PatientsDataObj[PatientId][1];
    const PatientBiopsies = PreEMAPlusSkinDx.filter(row =>
      [row[0], row[7].split(' ')[0], row[8]].join('_') === SearchKey
    );

    const UntreatedMalignancies = PreEMAPlusPathology.filter(row => row[0].toString() === PatientId &&
      row[5].toLowerCase() === 'cancerous' &&
      row[6].toLowerCase() !== 'completed');

    const HighRiskSkinCancers = HighRiskData.filter(row => row[0].toString() === PatientId);

    // add (HR) to patient id if is a high risk patient
    if (HighRiskSkinCancers.length > 0 && HighRiskSkinCancers[0][2] > 0) {
      DocDataObject['_HR'] = ' (HR)'
    }

    const NewDocName = PatientId + '_' + PatientsDataObj[PatientId];
    const NewDocId = DocTemplate.makeCopy(NewDocName, TempFolder).getId();
    const NewDoc = DocumentApp.openById(NewDocId);

    const [NewNoteDocId, NewNotePdfId] = fillPatientNoteNew_(NewDoc, TempFolder, DocDataObject,
      PastAppts, FutureAppts, PatientBiopsies,
      UntreatedMalignancies, HighRiskSkinCancers);

    AllNewDocIds.push(NewNotePdfId);

    DocsToDelete.push(NewNoteDocId);
    DocsToDelete.push(NewNotePdfId);

  });

  console.log('creating merged pdf for all patients ...');

  const DataValues = [new Date(), ProviderName, AppointmentDate];
  const LogSheet = SpreadsheetApp.getActive().getSheetByName('Log');

  if (AllNewDocIds.length > 0) {
    const NewDocName = "Bulk_" + ProviderName + '_' + AppointmentDate;

    getMergePdfFileUrl_(AllNewDocIds, DocsFolder, NewDocName)
      .then(MergedPdfUrl => {
        DataValues.push(MergedPdfUrl);
        LogSheet.appendRow(DataValues);
        deleteDocs_(DocsToDelete)
        console.log('summary note was created successfully ...');
        return 'success';
      })
      .catch(error => {
        console.log(error);
        return 'failure';
      });
  }
  else {
    deleteDocs_(DocsToDelete)
    console.log('an error occurred when creating the summary note ...');
    return 'failure';
  }

}










