const mysql = require('mysql2');
const pool = require('../config/authpool');


var userModel = class User {

    constructor(id, firstname, lastname, username, password, roleid, phone, clinicid){
        this.id  = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.password = password;
        this.roleid = roleid;
        this.phone = phone;
        this.clinicid = clinicid;
    }
    
    save() {
        const sqlQuery = `insert into user (username, password, firstname, lastname, roleid, phone, clinic_id) values (?, ?, ?, ?, ?, ?, ?)`;
        var sql = mysql.format(sqlQuery, [this.username, this.password, this.firstname, this.lastname, this.roleid, this.phone, this.clinicid]);
        console.log(sql);
        return pool.query(sql);

    }

    update(){
        let sqlQuery = `update  user set firstname =?,
                        lastname = ?,
                        roleid = ?,
                        phone = ?
                        where ?? = ?`;
                        
        if(this.username != ''){
            sqlQuery = mysql.format(sqlQuery, [this.firstname, this.lastname, this.roleid, this.phone, 'username', this.username]);
        }
        else{
            sqlQuery = mysql.format(sqlQuery, [this.firstname, this.lastname, this.roleid, this.phone, 'id', this.id]);
        }
        return pool.query(sqlQuery);
    }

    updatePassword(){
        let sqlQuery = `update  user set password =? 
                        where ?? = ?`;
        if(this.username != ''){
            sqlQuery = mysql.format(sqlQuery, [this.password, 'username', this.username]);
        }
        else{
            sqlQuery = mysql.format(sqlQuery, [this.password, 'id', this.id]);
        }
        return pool.query(sqlQuery);
    }

    static fetchAll(){
        return pool.query('select * from user');
    }

    static fetchAllUser(){
        return pool.query(`select
                        u.id 
                        ,u.clinic_id 
                        ,u.username 
                        ,u.password 
                        ,u.firstname 
                        ,u.lastname 
                        ,u.phone 
                        ,u.roleid
                        ,u.createdon 
                        ,u.updatedon 
                        ,u.updatedby 
                        ,c.name as clinic_name
                        ,c.groupof
                        ,c.address1
                        ,c.address2
                        ,c.city
                        ,c.state
                        ,c.zip
                        ,c.primary_contact
                        ,c.primary_phone
                        ,c.secondary_phone
                        ,c.primary_email
                from user u left join clinic c on c.id = u.clinic_id`, []);
    }

        static fetchById(id){
        return pool.query(`select
                        u.id 
                        ,u.clinic_id 
                        ,u.username 
                        ,u.password 
                        ,u.firstname 
                        ,u.lastname 
                        ,u.phone 
                        ,u.roleid
                        ,u.createdon 
                        ,u.updatedon 
                        ,u.updatedby 
                        ,c.name as clinic_name
                        ,c.groupof
                        ,c.address1
                        ,c.address2
                        ,c.city
                        ,c.state
                        ,c.zip
                        ,c.primary_contact
                        ,c.primary_phone
                        ,c.secondary_phone
                        ,c.primary_email
                from user u left join clinic c on c.id = u.clinic_id where u.id = ?`, [id]);
    }

    static fetchByEmail(email){
        return pool.query(`select
                        u.id 
                        ,u.clinic_id 
                        ,u.username 
                        ,u.password 
                        ,u.firstname 
                        ,u.lastname 
                        ,u.phone 
                        ,u.roleid
                        ,u.createdon 
                        ,u.updatedon 
                        ,u.updatedby 
                        ,c.name as clinic_name
                        ,c.groupof
                        ,c.address1
                        ,c.address2
                        ,c.city
                        ,c.state
                        ,c.zip
                        ,c.primary_contact
                        ,c.primary_phone
                        ,c.secondary_phone
                        ,c.primary_email
                from user u left join clinic c on c.id = u.clinic_id where u.username  =  ?`, [email]);
    }

    static fetchByIdOrEmail(id)
    {
        var query = mysql.format(`select 
                                u.id 
                                ,u.clinic_id 
                                ,u.username 
                                ,u.password 
                                ,u.firstname 
                                ,u.lastname 
                                ,u.phone 
                                ,u.roleid
                                ,u.createdon 
                                ,u.updatedon 
                                ,u.updatedby 
                                ,c.name as clinic_name
                                ,c.groupof
                                ,c.address1
                                ,c.address2
                                ,c.city
                                ,c.state
                                ,c.zip
                                ,c.primary_contact
                                ,c.primary_phone
                                ,c.secondary_phone
                                ,c.primary_email
                                from user u left join clinic c on c.id = u.clinic_id where u.username = ? or u.id = ?`, [id, id]);
        console.log(query);
        var queryResult = pool.query(query);
        return queryResult;
    }


}

module.exports = userModel;