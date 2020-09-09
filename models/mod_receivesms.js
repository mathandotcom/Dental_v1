var reminderModel = class ReceiveSms{
    constructor(
        receivedMessage,
        receivedFrom,
        accountSid,
        messageSid,
        smsMessageSid,
        smsStatus,
        dateTimeConfirmTransmit ){
            this.ReceivedMessage = receivedMessage;
            this.ReceivedFrom = receivedFrom;
            this.AccountSid = accountSid;
            this.MessageSid = messageSid;
            this.SmsMessageSid = smsMessageSid;
            this.SmsStatus = smsStatus;
            this.DateTimeConfirmTransmit = dateTimeConfirmTransmit;
    }
}
module.exports = reminderModel;
