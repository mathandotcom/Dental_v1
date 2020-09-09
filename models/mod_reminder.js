var reminderModel = class Reminder{
    constructor(
        ConfirmationRequestNum,
        ClinicNum,
        IsForSms,
        PatNum,
        ApptNum,
        PhonePat,
        ShortGUID,
        ConfirmCode,
        MsgTextToMobileTemplate,
        MsgTextToMobile,
        DateTimeEntry,
        DateTimeConfirmTransmit,
        DateTimeRSVP,
        RSVPStatus,
        ResponseDescript,
        GuidMessageToMobile,
        GuidMessageFromMobile,
        AptDateTimeOrig,
        TSPrior,
        DoNotResend,
        SmsSentOk,
        ){
            this.ConfirmationRequestNum = (typeof ConfirmationRequestNum !== 'undefined') ? ConfirmationRequestNum : '';
            this.ClinicNum = (typeof ClinicNum !== 'undefined') ? ClinicNum : '';
            this.IsForSms = (typeof IsForSms !== 'undefined') ? IsForSms : '';
            this.IsForEmail = (typeof IsForEmail !== 'undefined') ? IsForEmail : '';
            this.PatNum = (typeof PatNum !== 'undefined') ? PatNum : '';
            this.ApptNum = (typeof ApptNum !== 'undefined') ? ApptNum : '';
            this.PhonePat = (typeof PhonePat !== 'undefined') ? PhonePat : '';
            this.DateTimeConfirmExpire = (typeof DateTimeConfirmExpire !== 'undefined') ? DateTimeConfirmExpire : '';
            this.SecondsFromEntryToExpire = (typeof SecondsFromEntryToExpire !== 'undefined') ? SecondsFromEntryToExpire : '';
            this.ShortGUID = (typeof ShortGUID !== 'undefined') ? ShortGUID : '';
            this.ConfirmCode = (typeof ConfirmCode !== 'undefined') ? ConfirmCode : '';
            this.MsgTextToMobileTemplate = (typeof MsgTextToMobileTemplate !== 'undefined') ? MsgTextToMobileTemplate : '';
            this.MsgTextToMobile = (typeof MsgTextToMobile !== 'undefined') ? MsgTextToMobile : '';
            this.EmailSubjTemplate = (typeof EmailSubjTemplate !== 'undefined') ? EmailSubjTemplate : '';
            this.EmailSubj = (typeof EmailSubj !== 'undefined') ? EmailSubj : '';
            this.EmailTextTemplate = (typeof EmailTextTemplate !== 'undefined') ? EmailTextTemplate : '';
            this.EmailText = (typeof EmailText !== 'undefined') ? EmailText : '';
            this.DateTimeEntry = (typeof DateTimeEntry !== 'undefined') ? DateTimeEntry : '';
            this.DateTimeConfirmTransmit = (typeof DateTimeConfirmTransmit !== 'undefined') ? DateTimeConfirmTransmit : '';
            this.DateTimeRSVP = (typeof DateTimeRSVP !== 'undefined') ? DateTimeRSVP : '';
            this.RSVPStatus = (typeof RSVPStatus !== 'undefined') ? RSVPStatus : '';
            this.ResponseDescript = (typeof ResponseDescript !== 'undefined') ? ResponseDescript : '';
            this.GuidMessageToMobile = (typeof GuidMessageToMobile !== 'undefined') ? GuidMessageToMobile : '';
            this.GuidMessageFromMobile = (typeof GuidMessageFromMobile !== 'undefined') ? GuidMessageFromMobile : '';
            this.ShortGuidEmail = (typeof ShortGuidEmail !== 'undefined') ? ShortGuidEmail : '';
            this.AptDateTimeOrig = (typeof AptDateTimeOrig !== 'undefined') ? AptDateTimeOrig : '';
            this.TSPrior = (typeof TSPrior !== 'undefined') ? TSPrior : '';
            this.DoNotResend = (typeof DoNotResend !== 'undefined') ? DoNotResend : '';
            this.SmsSentOk = (typeof SmsSentOk !== 'undefined') ? SmsSentOk : '';
            this.EmailSentOk = (typeof EmailSentOk !== 'undefined') ? EmailSentOk : '';
        }
}

module.exports = reminderModel;