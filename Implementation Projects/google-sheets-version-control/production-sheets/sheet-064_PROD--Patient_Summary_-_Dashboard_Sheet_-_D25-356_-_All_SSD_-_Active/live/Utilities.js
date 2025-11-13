
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('Utilities')
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('Bulk Patient Summary')
        .addItem('Maruthur, Mario', 'createBulkPatientSummaryForMario')
        .addSeparator()
        .addItem('Parker, Kaitlyn', 'createBulkPatientSummaryForParker')
        .addSeparator()
        .addItem('Stephens, Emma', 'createBulkPatientSummaryForStephens')
        .addSeparator()
        .addItem('McMahan, Grace', 'createBulkPatientSummaryForMcmahan')
        .addSeparator()
        .addItem('Downing, Malia', 'createBulkPatientSummaryForDowning')
        .addSeparator()
        .addItem('Yearwood, Dena', 'createBulkPatientSummaryForYearwood')
    )
    .addToUi()
}

