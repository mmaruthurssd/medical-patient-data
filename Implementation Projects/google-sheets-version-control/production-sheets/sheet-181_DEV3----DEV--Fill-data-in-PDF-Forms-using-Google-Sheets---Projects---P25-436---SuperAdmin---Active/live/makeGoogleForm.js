function createFormFromUniqueFields() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Unique Fields");
  if (!sheet) throw new Error("Sheet 'Unique Fields' not found");

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No data in 'Unique Fields' (need at least one row after header).");
    return;
  }

  // A=question, B=type, C=choices
  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  // Create form
  const form = FormApp.create(ss.getName() + " - Auto Generated Form");
  form.setTitle("Auto Generated Form");

  // Move form to same folder as spreadsheet (fallback to root if no parent)
  const ssFile = DriveApp.getFileById(ss.getId());
  const parents = ssFile.getParents();
  const parentFolder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  const formFile = DriveApp.getFileById(form.getId());
  formFile.moveTo(parentFolder);

  data.forEach(row => {
    const question = row[0] ? row[0].toString().trim() : "";
    const type = row[1] ? row[1].toString().trim().toLowerCase() : "";
    const choicesRaw = row[2] ? row[2].toString().trim() : "";

    if (!question || !type) return;

    // Clean & split choices (handles "," and ", " etc.)
    const choicesArray = choicesRaw
      ? choicesRaw.split(",").map(c => c.trim()).filter(c => c.length > 0)
      : [];

    switch (type) {
      case "short answer":
      case "short":
      case "text":
        form.addTextItem().setTitle(question);
        break;

      case "paragraph":
      case "long answer":
        form.addParagraphTextItem().setTitle(question);
        break;

      case "multiple choice":
      case "radio": {
        const item = form.addMultipleChoiceItem().setTitle(question);
        if (choicesArray.length) {
          item.setChoices(choicesArray.map(c => item.createChoice(c)));
        } else {
          item.setChoices([item.createChoice("Option 1"), item.createChoice("Option 2")]);
        }
        break;
      }

      case "checkboxes":
      case "checkbox": {
        const item = form.addCheckboxItem().setTitle(question);
        if (choicesArray.length) {
          item.setChoices(choicesArray.map(c => item.createChoice(c)));
        } else {
          item.setChoices([item.createChoice("Option 1"), item.createChoice("Option 2")]);
        }
        break;
      }

      case "dropdown":
      case "list": {
        const item = form.addListItem().setTitle(question);
        // Use setChoiceValues for string arrays (avoids passing wrong type to setChoices)
        if (choicesArray.length) {
          item.setChoiceValues(choicesArray);
        } else {
          item.setChoiceValues(["Option 1", "Option 2"]);
        }
        break;
      }

      case "date":
        form.addDateItem().setTitle(question);
        break;

      case "time":
        form.addTimeItem().setTitle(question);
        break;

      default:
        Logger.log("Unknown type: " + type + " for question: " + question);
    }
  });

  // Link responses to the same spreadsheet (creates a new tab for responses)
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Show links
  // SpreadsheetApp.getUi().alert(
  //   "Form created!\n\nEdit URL: " + form.getEditUrl() + "\n\nPublic URL: " + form.getPublishedUrl()
  // );
}
