const mysql = require('mysql2');
const logger = require('../logger/logconfig');
const auth = require('../config/authpool');
const templateModel = require('./template');
const templateService = require('../services/templateService');

var category = class SubCategory{
    constructor(id, name, type){
        this.id = id;
        this.name = name;

    }
}

var categoryModel = class TemplateCategory{

    constructor(id, name, type ){
        this.id = id;
        this.name = name;
        this.type = type;
        this.children = new list<SubCategory>[];
    }

    static getCategory(){
        try {
            var query = mysql.format(categorysql, []);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static getCategoryMapping(){
        try {
            var query = mysql.format(catmappingsql, []);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }


    static getTemplateTypeNameByCategory(categoryId){
        try {
            var query = mysql.format(templateTypeName_by_category_sql, [categoryId]);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static getTemplateTypeName(categoryId, mappingId){
        try {

            var query = mappingId > 0 ? mysql.format(templateTypeName_by_mapping_sql, [mappingId, categoryId]) 
                                      : mysql.format(templateTypeName_by_category_sql, [categoryId]);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async addTemplateTypeName(templateModelObject){
        var result;
        try {

            var query = templateModelObject.mappingId > 0 && templateModelObject.templateTypeId > 0
                        ? mysql.format(addTemplateTypeUpdateSql, [templateModelObject.name, templateModelObject.createdby, templateModelObject.templateTypeId]) 
                        : mysql.format(addTemplateTypeSql, [templateModelObject.mappingId, templateModelObject.name, templateModelObject.createdby]) 

            logger.info(query);
            var queryResult = auth.query(query);
            // var queryResult = auth.query(query, async (err, results, fields) => {
            //     console.log(results); // results contains rows returned by server
            //     console.log(fields); // fields contains extra meta data about results, if available    
            //     return await results            
            // });
            // await auth.query(query)
            // .then( async([rows,fields]) => {
            //     console.log(rows);
            //     return await rows;
            // })
            // .catch((error) => {
            //     throw error;
            // });
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async addTemplate(templateModelObject){
        var result;
        try {

            var query = templateModelObject.templateTypeId > 0 && templateModelObject.id > 0
                        ? mysql.format(addTemplateUpdateSql, [templateModelObject.subject, templateModelObject.body, templateModelObject.createdby, templateModelObject.id]) 
                        : mysql.format(addTemplateSql, [templateModelObject.templateTypeId, templateModelObject.subject, templateModelObject.body, templateModelObject.createdby])

            logger.info(query);
            var queryResult = auth.query(query);

            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }    

    static async addTemplateTriggerEvent(templateId, templateModel) {
        var result=0;
        try {
            var deactivateEventResult = await this.deactivateEvent(templateId);
            if (templateModel.triggerEvents.length > 0) {
                //await templateModel.triggerEvents.forEach(async element => {
                for(const element of templateModel.triggerEvents){
                    await this.isEventExist(templateId, element.item_id).then(async ([rowExists]) => {
                        if (rowExists.length > 0) {
                            var result = await this.addEvent(templateId, element.item_id, templateModel.categoryId, templateModel.subCategoryId, templateModel.createdby, rowExists[0].rowCount > 0);
                        }
                    });
                    result += 1;
                }
                if(templateModel.triggerEvents.length >= result){
                    return "Event data was updated";
                }
            }
            else {
                return await "No event data to udpate";
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }   

    static async deactivateEvent(templateId){
        try {
            var query = `update trigger_event set active = 0 where template_id = ${templateId}`;
            var queryResult = auth.query(query);
            return await queryResult;
        } 
        catch (error) {
            logger.error(error);
            throw error;
        }  
    }

    static async isEventExist(templateId, eventId){
        try {
            var query = `select count(*) as rowCount from trigger_event where template_id = ${templateId} and event_id = ${eventId}`;
            var queryResult = auth.query(query);
            return await queryResult;
        } 
        catch (error) {
            logger.error(error);
            throw error;
        }  
    }

    static async addEvent(templateId, eventId, categoryId, subCategoryId, userId, eventExist){
        try {
            var query = eventExist ? mysql.format(updateEventSql, [templateId, eventId]) : mysql.format(addEventSql, [templateId, eventId, categoryId, subCategoryId, userId]) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } 
        catch (error) {
            logger.error(error);
            throw error;
        }        

    }

    static async retrieveEvent(templateId){
        try {

            var query = mysql.format(retrieveEventSql, [templateId]) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    static async addTemplateWithEventTrigger(templateModelObject){
        var arrEventId = []; var strEventId = '';
        try {
            
            for(const element of templateModelObject.triggerEvents){
                arrEventId.push(element.item_id);
            }
            strEventId = arrEventId.join(',');
            
            var templateProc = 'call jdsp_update_template(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @result)';
            var query = mysql.format(templateProc, [
                templateModelObject.categoryId,
                templateModelObject.subCategoryId,
                templateModelObject.mappingId,
                templateModelObject.templateTypeId,
                templateModelObject.name,
                templateModelObject.id,
                templateModelObject.subject,
                templateModelObject.body,
                strEventId,
                templateModelObject.createdby,
                templateModelObject.leadTimeNumber,
                templateModelObject.leadTimeInterval,
                templateModelObject.leadTimeMode
            ]);
            logger.info(query);
            var queryResult = auth.query(query); /*, async (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                return results;
            });*/
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }    
    }

    static async retrieveTemplate(templateTypeId){
        try {

            var query = mysql.format(retrieveTemplateSql, [templateTypeId]) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    
}

const categorysql = `select id, name, 'folder' as type from templatecategory where active = 1 order by name`;
const catmappingsql = `select 
                            cmap.id
                            ,cmap.category_id
                            ,tcat.name as categoryname
                            ,cmap.subcategory_id
                            ,tsubcat.name as subcategoryname
                        from templatecategorymapping cmap
                        join templatecategory tcat on tcat.id = cmap.category_id
                        join templatesubcategory tsubcat on tsubcat.id = cmap.subcategory_id
                        where cmap.active = 1
                        order by tcat.name`;

const templateTypeName_by_category_sql = `select 
                                            ttn.id
                                            ,ttn.categorymapping_id
                                            ,tcmg.category_id
                                            ,tcmg.subcategory_id
                                            ,ttn.name
                                            from templatetypename ttn
                                            join templatecategorymapping tcmg on tcmg.id = ttn.categorymapping_id
                                            where 
                                            tcmg.category_id = ? 
                                            and ttn.active = 1;`;

const templateTypeName_by_mapping_sql = `select 
                                            ttn.id
                                            ,ttn.categorymapping_id
                                            ,tcmg.category_id
                                            ,tcmg.subcategory_id
                                            ,ttn.name
                                            from templatetypename ttn
                                            join templatecategorymapping tcmg on tcmg.id = ttn.categorymapping_id
                                            where 
                                            tcmg.id = ? 
                                            and tcmg.category_id = ?
                                            and ttn.active = 1;`;

//const addCategoryMappingSql = `insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (?, ?, ?)`;
const addTemplateTypeSql = `insert into templatetypename (categorymapping_id, name, createdby) values (?, ?, ?)`;
const addTemplateTypeUpdateSql = `update templatetypename set name = ?, updatedby = ? where id = ?`;
const addTemplateSql = `insert into templates (templatetypename_id, subject, bodycontent, createdby) values (?, ?, ?, ?)`;
const addTemplateUpdateSql = `update templates set 
                                subject = ?,
                                bodycontent = ?,
                                createdby = ?
                                where id = ?`;

const retrieveTemplateSql = `select tmpl.id
                                ,typename.id as typename_id
                                ,typename.name as typename
                                ,tmpl.subject 
                                ,tmpl.templatefor 
                                ,tmpl.bodycontent 
                                ,tmpl.createdby
                                ,tmpl.updatedby
                                ,tmpl.createdon
                                ,tmpl.updatedon
                                ,tmpl.category_id
                                ,tmpl.subcategory_id
                                ,tmpl.leadtime_number as leadTimeNumber
                                ,tmpl.leadtime_interval as leadTimeInterval
                                ,tmpl.leadtime_mode as leadTimeMode
                                ,tmpl.comments
                                from templates tmpl
                                join templatetypename typename on typename.id = tmpl.templatetypename_id
                                where templatetypename_id = ?
                                and tmpl.active = 1`;

const retrieveEventSql = `select e.id as item_id, e.name as item_text, e.category_id from event e join trigger_event te on te.event_id = e.id where te.template_id = ? and e.active = 1 and te.active=1 order by e.name;`;                            

var addEventSql = `insert into trigger_event (template_id, event_id, category_id, subcategory_id, created_by)
                     values (?, ?, ?, ?, ?)`;

var updateEventSql = `update trigger_event set active = 1 where template_id = ? and event_id = ?`;
module.exports = categoryModel;