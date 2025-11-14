

const ARCHIVE_FOLDER_ID = "1fgDg__OroZhPoXs9FSQYcv8IyLd6lMqn"



function onEditInstall(e) {

  //return

  const ActiveSheet = e.source.getActiveSheet();

  if (ActiveSheet.getName() === 'Microtasks List') {

    const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
    const StatusColIndex = HeaderRow.indexOf('Status');

    if (e.range.getColumn() === StatusColIndex + 1) {
      sortMicrotasksList()
    }

  }

  else if (ActiveSheet.getName() === 'Applicant Interview Log') {

    //return

    let value = e.value;
    let col = e.range.getColumn();
    if (col === 3 && value != "" && value != null) {
      const RowIndex = e.range.getRow();
      createApplicantNotesDoc_(ActiveSheet, RowIndex, value);
    }

    else if (col === 14 && (value == "TRUE" || value == true)) {
      const RowIndex = e.range.getRow();
      let richTextDoc = ActiveSheet.getRange('H' + RowIndex).getRichTextValue()
      let docUrl = richTextDoc.getLinkUrl()
      if (docUrl != null) {
        try {
          DriveApp.getFileById(docUrl.split("/d/")[1].split("/edit")[0]).setTrashed(true)
          ActiveSheet.getRange('H' + RowIndex).clearContent()
          ActiveSheet.getRange('N' + RowIndex).setValue(false)
        } catch (err) { }
      }

    } else if (col === 15) {

      if (value == "Yes") {
        const RowIndex = e.range.getRow();
        let richTextDoc = ActiveSheet.getRange('H' + RowIndex).getRichTextValue()
        let docUrl = richTextDoc.getLinkUrl()
        if (docUrl != null) {
          try {
            let docID = docUrl.split("/d/")[1].split("/edit")[0]
            const archiveFolder = DriveApp.getFolderById(ARCHIVE_FOLDER_ID);
            DriveApp.getFileById(docID).moveTo(archiveFolder)
          } catch (err) { }
        }
      }


      ActiveSheet.getRange(3, 1, ActiveSheet.getLastRow() - 2, ActiveSheet.getLastColumn()).sort({ column: 1, ascending: true });

    }



  }

}


//https://docs.google.com/document/d/15Wg98xh3cxbti_4OtJE4TnFQZePgPiLuv71q6IVJ_70/edit?usp=drivesdk














