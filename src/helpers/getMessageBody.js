function getMessageBody(msg) {
  const type = msg.mtype;

  switch (type) {
    case 'conversation':
      return msg.message.conversation;
    case 'imageMessage':
      return msg.message.imageMessage.caption;
    case 'videoMessage':
      return msg.message.videoMessage.caption;
    case 'extendedTextMessage':
      return msg.message.extendedTextMessage.text;
    case 'buttonsResponseMessage':
      return msg.message.buttonsResponseMessage.selectedButtonId;
    case 'listResponseMessage':
      return msg.message.listResponseMessage.singleSelectReply.selectedRowId;
    case 'templateButtonReplyMessage':
      return msg.message.templateButtonReplyMessage.selectedId;
    case 'messageContextInfo':
      return (
        msg.message.buttonsResponseMessage?.selectedButtonId ||
        msg.message.listResponseMessage?.singleSelectReply.selectedRowId ||
        msg.text
      );
    case 'documentMessage':
      return msg.message.documentMessage.fileName;  // Optionally return the file name
    default:
      return '';
  }
}

module.exports = getMessageBody;
