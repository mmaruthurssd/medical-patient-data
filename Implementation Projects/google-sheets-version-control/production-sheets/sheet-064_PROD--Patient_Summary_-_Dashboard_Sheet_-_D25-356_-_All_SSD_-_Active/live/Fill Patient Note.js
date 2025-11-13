
function fillPatientNoteNew_(NewDoc, DocsFolder, DocDataObject, PastAppts, FutureAppts,
  PatientBiopsies, UntreatedMalignancies, HighRiskSkinCancers) {

  const NewDocHeader = NewDoc.getHeader();
  const NewDocBody = NewDoc.getBody();
  const NewDocTables = NewDocBody.getTables();

  // fill patient id and name
  for (const [Key, Value] of Object.entries(DocDataObject)) {
    NewDocHeader.replaceText(Key, Value)
  }

  const ClinicApptTyps = ['EG', 'ES', 'NG', 'NP', 'NS'];
  // console.log(DocDataObject['_ApptType']);

  // remove checklist table if it's a clinic appt
  if (ClinicApptTyps.includes(DocDataObject['_ApptType'])) {
    NewDocTables[5].removeRow(0);
  }

  // fill data in table 1 - high risk cancers

  if (HighRiskSkinCancers.length === 0) {
    HighRiskSkinCancers.push(['N/A', 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  if (HighRiskSkinCancers.length !== 0) {

    const Table = NewDocTables[0];

    const DataRow = HighRiskSkinCancers[0];
    const TableRow = Table.getRow(1);

    TableRow.getCell(0).setText(DataRow[2]);
    TableRow.getCell(1).setText(DataRow[3]);
    TableRow.getCell(2).setText(DataRow[4]);
    TableRow.getCell(3).setText(DataRow[5]);
    TableRow.getCell(4).setText(DataRow[6]);
    TableRow.getCell(5).setText(DataRow[7]);
    TableRow.getCell(6).setText(DataRow[8]);
    TableRow.getCell(7).setText(DataRow[9]);

  }

  // fill data in table 2 - untreated malignancies
  if (UntreatedMalignancies.length !== 0) {

    UntreatedMalignancies.sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime());

    const Table = NewDocTables[1];

    for (let i = 0; i < UntreatedMalignancies.length; i++) {
      if (i > 0)
        Table.appendTableRow(Table.getChild(i).copy());

      const DataRow = UntreatedMalignancies[i];
      const TableRow = Table.getRow(i + 1);

      TableRow.getCell(0).setText(DataRow[1]);
      TableRow.getCell(1).setText(DataRow[2]);
      TableRow.getCell(2).setText(DataRow[3]);
      TableRow.getCell(3).setText(DataRow[4]);
      TableRow.getCell(4).setText(DataRow[DataRow.length - 1]);
    }

  }

  // fill data in table 3 - all biopsies
  if (PatientBiopsies.length !== 0) {

    PatientBiopsies.sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime());

    const Table = NewDocTables[2];

    for (let i = 0; i < PatientBiopsies.length; i++) {
      if (i > 0)
        Table.appendTableRow(Table.getChild(i).copy());

      const DataRow = PatientBiopsies[i];
      const TableRow = Table.getRow(i + 1);

      TableRow.getCell(0).setText(DataRow[1]);
      TableRow.getCell(1).setText(DataRow[2]);
      TableRow.getCell(2).setText(DataRow[3]);
      TableRow.getCell(3).setText(DataRow[4]);
      TableRow.getCell(4).setText(DataRow[DataRow.length - 1]);
    }

  }

  // fill data in table 4 - past appointments
  if (PastAppts.length !== 0) {

    PastAppts.sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime());

    const Table = NewDocTables[3];

    for (let i = 0; i < PastAppts.length; i++) {
      if (i > 0)
        Table.appendTableRow(Table.getChild(i).copy());

      const DataRow = PastAppts[i];
      const TableRow = Table.getRow(i + 1);

      TableRow.getCell(0).setText(DataRow[1]);
      TableRow.getCell(1).setText(DataRow[2]);
      TableRow.getCell(2).setText(DataRow[3]);
    }

  }

  // fill data in table 5 - future appointments
  if (FutureAppts.length !== 0) {

    FutureAppts.sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime());

    const Table = NewDocTables[4];

    for (let i = 0; i < FutureAppts.length; i++) {
      if (i > 0)
        Table.appendTableRow(Table.getChild(i).copy());

      const DataRow = FutureAppts[i];
      const TableRow = Table.getRow(i + 1);

      TableRow.getCell(0).setText(DataRow[1]);
      TableRow.getCell(1).setText(DataRow[2]);
      TableRow.getCell(2).setText(DataRow[3]);
    }

  }

  NewDoc.saveAndClose();

  const PdfBlob = NewDoc.getAs('application/pdf').setName(NewDoc.getName() + '.pdf');
  const NewDocPdf = DocsFolder.createFile(PdfBlob);

  return [NewDoc.getId(), NewDocPdf.getId()];

}

