const mysql = require('mysql2');
const logger = require('../logger/logconfig');
const justdental = require('../config/authpool');
const pool = require('../config/remoteopendentalpool');


const commModel = class CommunicationModel {

    constructor(){
    }

    static fetchPhoneNumbers(id)    {
        var query = "";
        try {
            if(id > 0)
                query = mysql.format(sqlGetPhoneNumber, [id]);
            else
                query = sqlGetPhoneNumbers;
            
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;

        } catch (error) {
            throw error; 
        }

    }

    static fetchPatientWithLastMessage(){
        var query = "";
        try{
            var query = query = mysql.format(sqlpatientWithLastMessage);
            logger.info(query);
            var queryResult = justdental.query(query);
            return queryResult;            
        } catch (error) {
            logger.error(error);
            throw error; 
        }
    }

    static fetchChatMessages(patientId){ //PatientId
        var query = "";
        try{
            query = mysql.format(sqlpatientWithMessage, [patientId]);
            logger.info(query);
            var queryResult = justdental.query(query);
            return queryResult;            
        } catch (error) {
            logger.error(error);
            throw error; 
        }
    }

    static async addChat(token, userId){
        try {
            var query = mysql.format(sqlInsertChat, [token, userId]);
            logger.info(query);
            var queryResult = justdental.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    
    static async addReceivedMessage(patientId, message, sid, userId){
        try {
            var chatId = await this.addChat(sid, userId);
            if(chatId === null || chatId.length <= 0) throw "Unable to add message information";
            var conversationDirection = 'p-u';
            var conversationId = userId > patientId ? `${patientId}-${userId}`: (`${userId}-${patientId}`);
            var query = mysql.format(sqlInsertChatMessage, [chatId[0].insertId, 
                                                            patientId,
                                                            patientId,
                                                            userId,
                                                            conversationId,
                                                            conversationDirection,
                                                            message,
                                                            userId
                                                        ]);
            logger.info(query);
            var queryResult = justdental.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async addChatMessage(patientId, message, smsResult, userId){
        try {
            var chatId = await this.addChat(smsResult.sid, userId);
            if(chatId === null || chatId.length <= 0) throw "Unable to add message information";
            var conversationDirection = 'u-p';
            var conversationId = userId > patientId ? `${patientId}-${userId}`: (`${userId}-${patientId}`);
            var query = mysql.format(sqlInsertChatMessage, [chatId[0].insertId, 
                                                            patientId,
                                                            userId,
                                                            patientId,
                                                            conversationId,
                                                            conversationDirection,
                                                            message,
                                                            userId
                                                        ]);
            logger.info(query);
            var queryResult = justdental.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }


};

const sqlGetPhoneNumber = "Select * from patient where WirelessPhone <> '' and PatNum = ?";
const sqlGetPhoneNumbers = "Select * from patient where WirelessPhone <> ''";

const sqlpatientWithLastMessage = `select pat.patnum as patientId, 
                                CONCAT(pat.FName, ' ', IFNULL(CONCAT(pat.MiddleI, ''),' '), pat.LName) as patient_name,
                                pat.gender,
                                pat.WirelessPhone as cell,
                                pat.HmPhone as homephone,
                                singleMessage.*
                                FROM opendental.patient pat
                                left join (
                                    SELECT  
                                    cm.*, 
                                    cm.createdby as user_id
                                    FROM chat_message cm 
                                    WHERE cm.id IN (
                                    SELECT max(id)
                                    FROM chat_message 
                                    group by patient_id)
                                ) singleMessage on pat.PatNum = singleMessage.patient_id
                                order by patient_name`;

const sqlpatientWithMessage = `SELECT cm.*
                                ,CONCAT(pat.FName, ' ', IFNULL(CONCAT(pat.MiddleI, ''),' '), pat.LName) as patient_name
                                ,pat.gender 
                                ,DATE_FORMAT(cm.createdon, '%m/%d/%Y') as received_date
                                ,DATE_FORMAT(cm.createdon, '%h:%i %p') as received_time
                                FROM justdentaldb.chat_message cm
                                join opendental.patient pat on cm.patient_id = pat.patnum
                                where pat.PatNum = ? 
                                order by cm.id`;


const sqlInsertChat = `insert into chat(token, createdby) values(?, ?)`;
const sqlInsertChatMessage = `insert into chat_message(chat_id, patient_id, sender_id, recipient_id, conversation_id, conversation_dir, message, createdby) 
                                    values(?, ?, ?, ?, ?, ?, ?, ?)`;

module.exports = commModel;