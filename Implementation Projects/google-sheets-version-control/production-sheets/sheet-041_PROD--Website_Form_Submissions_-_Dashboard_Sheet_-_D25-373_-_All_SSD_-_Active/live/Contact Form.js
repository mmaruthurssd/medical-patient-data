
function getContactFormData() {
  
  const SearchQuery = 'in:inbox label:unread subject:New submission from contact';
  const Threads = GmailApp.search(SearchQuery,0,100);

  if (Threads.length > 0) {

    Threads.forEach(Thread => {
      const Messages = Thread.getMessages();

      Messages.forEach(Message => {
        const MsgId = Message.getId();
        const MsgIds = getMsgIds_();
 
        if (MsgIds.indexOf(MsgId) === -1 && Message.isUnread()) {
           
          const MsgDate = Message.getDate();
          const MsgBody = Message.getPlainBody();
          
          addContactData_(MsgBody, MsgDate);
          addMsgId_(MsgId);
            
        }

        Message.markRead();

      });

    });   

    sortData_('Contact_Form');

  }

}


function addContactData_(MsgBody, MsgDate) {

  const ContactsDataSheet = SpreadsheetApp.getActive().getSheetByName('Contact_Form');

  const DateValue = Utilities.formatDate(new Date(MsgDate),'GMT-06:00','M/dd/yyyy');
  const TimeValue = Utilities.formatDate(new Date(MsgDate),'GMT-06:00','H:mm:ss a');

  const DataArray = MsgBody.split('\n').map(row => row.trim()).filter(row => row !== '');
  DataArray.splice(0,1);

  const DataObj = {'*Name*':'', '*Company*':'', '*Email*':'', '*Phone*':'', '*Message*':''}

  let fieldName = '';
  let fieldValue = '';

  DataArray.forEach(row => {
    if (row.includes('*')) {
      fieldName = row
      fieldValue = '';
    }
    else {
      fieldValue = fieldValue === '' ? row : fieldValue + '\n' + row;
      DataObj[fieldName] = fieldValue;
    }    
  });

  const DataValues = [];
  DataValues.push(DateValue);
  DataValues.push(TimeValue);

  for (let key in DataObj) {
    DataValues.push(DataObj[key])
  }

  // console.log(dataValues);
  ContactsDataSheet.appendRow(DataValues);

}
