/** @OnlyCurrentDoc */
// Global namespace
var PA = this.PA || (this.PA = {});

// Define once; re-open-safe (won't throw if file is loaded twice)
PA.CFG = PA.CFG || Object.freeze({
  // Sheet & menu
  DEST_SPREADSHEET_ID: '1hOVAmQo3M2kIBoMQZ5fYqMflZh8_iAxL66-nA1ZGTR8',
  DEST_SHEET_NAME: 'PA_Attachments',
  MSG_LOG_SHEET_NAME: 'Msg_Id_Log',
  TARGET_EMAIL: 'pa@ssdspc.com',
  TIMEZONE: 'America/El_Salvador',

  // Collector limits
  TIME_LIMIT_SECONDS: 540,
  MAX_THREADS_PER_RUN: 100,

  // Drive destination for attachments
  FOLDER_ID: '',
  AUTO_FOLDER_NAME: 'PA_Attachments (attachments)',

  // Patient directory (for Id lookup)
  PATIENTS_SS_ID: '10VrrYyiGmOx4cuAMQfJd0A9pDTQ_QVgGdxgjElkasxU',
  PATIENTS_SHEET_NAME: 'Patients_Data',

  // OCR / Vertex
  PROJECT_ID: 'pdf-ocr-extraction-461917',
  SERVICE_ACCOUNT_KEY_FILE_ID: '1G0idfdLuUxrKrfL-oSSW8Gy7RJpQ-BlD',
  MODEL_ID: 'gemini-1.5-flash',
  OCR_MAX_PER_RUN: 15
});