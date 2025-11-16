
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Test Email");

  menu.addItem("Provider Monthly Stats", "testDynamicEmailTrigger").addToUi()
}
