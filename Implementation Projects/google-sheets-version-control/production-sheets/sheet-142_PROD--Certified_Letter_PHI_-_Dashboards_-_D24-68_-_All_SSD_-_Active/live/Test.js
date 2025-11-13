


function testMergingDocs() {
  const masterDoc = DocumentApp.openById("1J2jhqSdrYfwojNNAU0Tr5GBghZOfu7nFuoPdxqcXAms")
  const masterBody = masterDoc.getBody();

  // Open template once; we’ll clone its body for each row.
  const templateDoc = DocumentApp.openById("1PE2SXuJ-eZ8R6qALiCdSN9En_nMSkvHvEDZllyrr7Ug");
  const templateBody = templateDoc.getBody();

  masterBody.appendPageBreak();

  appendTemplateSection_Test(templateBody, masterBody);
}


// Append a copy of all template body children to dst body.
// Returns the child index range [start, end) in the destination body
// so we can target replacements to just this section.
function appendTemplateSection_Test(srcBody, dstBody) {
  const startIndex = dstBody.getNumChildren();
  const n = srcBody.getNumChildren();
  for (let i = 0; i < n; i++) {
    const childCopy = srcBody.getChild(i).copy();
    switch (childCopy.getType()) {
      case DocumentApp.ElementType.PARAGRAPH:
        dstBody.appendParagraph(childCopy);
        break;
      case DocumentApp.ElementType.LIST_ITEM:
        dstBody.appendListItem(childCopy);
        break;
      case DocumentApp.ElementType.TABLE:
        dstBody.appendTable(childCopy);
        break;
      case DocumentApp.ElementType.HORIZONTAL_RULE:
        dstBody.appendHorizontalRule();
        break;
      default:
        // Fallback for any other types; try to append as paragraph if possible
        try { dstBody.appendParagraph(childCopy.asParagraph()); } catch (e) { }
        break;
    }
  }
  const endIndex = dstBody.getNumChildren();
  return { startChildIndex: startIndex, endChildIndex: endIndex };
}