const logger = require('../logger/logconfig');
const categoryModel = require('../models/category');
const templateModel = require('../models/template');
const templateService = require('../services/templateService');
const imageRootpath = 'uploads/template'

exports.categoryApi =  (req, res, next) => {

    categoryModel.getCategory()
    .then(([categorydata]) => {
        console.log('category: ', categorydata);
        categoryModel.getCategoryMapping()
        .then(([mapping]) => {
            categorydata.forEach(element => {
                element.children = [];
                var mappingData = mapping.filter(x => x.category_id === element.id);
                mappingData.forEach(elementmap => {
                    element.children.push({id:elementmap.subcategory_id, category_id:elementmap.category_id, mapping_id: elementmap.id, name: elementmap.subcategoryname, type: 'file'});
                });
            });
            return res.json({status: 'true', message: '', category: categorydata});
        })
        .catch(err => {
            return res.status(401).json({status: 'false', message:"Unable to get category mapping details" + err.message});
        });
    })
    .catch(err => {
        return res.status(401).json({status: 'false', message:"Unable to get category details" + err.message});
    });
};

exports.templateTypeName =  (req, res, next) => {
    let categoryId = req.body.categoryId;
    let subCategoryId = req.body.subCategoryId;
    let mappingId = req.body.mappingId;

    categoryModel.getTemplateTypeName(categoryId, mappingId)
    .then(([response]) => {
        if(response.length > 0){
            return res.json({status: 'true', message: '', typenames: response});
        }
        else{
            return res.json({status: 'false', message: 'Yet to create template', typenames: []});
        }
    })
    .catch(err => {
        return res.status(401).json({status: 'false', message:"Unable to get category details" + err.message});
    });
};

/*
 {
     "templateInfo": {
         "categoryId" : 1,
         "subCategoryId" : 1,
         "mappingId" : 1,
         "templateTypeId": 0,
         "id" : 0,
         "name" : "Schedule appointment 6",
         "subject" : "Appointment is scheduled 6",
         "body": "<strong>test mail from node js</strong> 6",
         "createdby": 1,
         "updatedby": 1
     }
 } */
exports.addTemplate1 = async (req, res, next) => {
    let templateInfo = req.body.templateInfo;
    var templateModelObject = new templateModel(templateInfo.categoryId, templateInfo.subCategoryId, templateInfo.mappingId, templateInfo.templateTypeId, templateInfo.id, templateInfo.name, templateInfo.subject, templateInfo.body, templateInfo.createdby, templateInfo.updatedby);

    await categoryModel.addTemplateTypeName(templateModelObject)
        .then(async ([response]) => {
            if (response.affectedRows > 0) {
                //response.insertId
                templateModelObject.templateTypeId = (templateInfo.templateTypeId <= 0) ? response.insertId : templateInfo.templateTypeId;
                await categoryModel.addTemplate(templateModelObject)
                .then(async ([responseTemplate]) => {
                    if(templateInfo.triggerEvents !== null){
                        var templateId = (templateInfo.id <=0 ) ? responseTemplate.insertId:  templateInfo.id;
                        var addTriggerEvents = await categoryModel.addTemplateTriggerEvent(templateId, templateInfo).then(([responseTriggerEvent]) => {
                            if (responseTemplate.affectedRows > 0 && responseTemplate.insertId > 0){
                                return  res.json({ status: 'true', message: '', result: `Template '${templateInfo.name}' has been successfully created` });
                            }
                            else if(responseTemplate.affectedRows > 0 && responseTemplate.changedRows > 0){
                                return  res.json({ status: 'true', message: '', result: `Template '${templateInfo.name}' has been successfully updated` });
                            }
                            else{
                                return  res.json({ status: 'true', message: '', result: `Template '${templateInfo.name}' didn't have change` });
                            }
                        });
                    }
                    else{
                        if (responseTemplate.affectedRows > 0 && responseTemplate.insertId > 0){
                            return  res.json({ status: 'true', message: '', result: `Template '${templateInfo.name}' has been successfully created` });
                        }
                        else if(responseTemplate.affectedRows > 0 && responseTemplate.changedRows > 0){
                            return  res.json({ status: 'true', message: '', result: `Template '${templateInfo.name}' has been successfully updated` });
                        }
                        else{
                            return  res.json({ status: 'true', message: '', result: `Template '${templateInfo.name}' didn't have change` });
                        }
                    }
                })
                .catch(err => {
                    return res.status(401).json({ status: 'false', message: `Unable to get category details ${err.message}` });
                });

            }
            else {
                return await res.json({ status: 'false', message: 'Yet to create template', typenames: [] });
            }
        })
        .catch(err => {
            return res.status(401).json({ status: 'false', message: `Unable to get category details ${err.message}` });
        });

};

//addTemplateWithEventTrigger
exports.addTemplate = async (req, res, next) => {
    let templateInfo = req.body.templateInfo;
    let startImagePositionArray = req.body.startImageIndex;
    let endImagePositionArray = req.body.endImageIndex;
    
    var templateTransformedBody = await transformBase64ToUrl(startImagePositionArray, templateInfo.body, req); // await templateService.transformTemplateBodyMessage(templateInfo.body);
    if(templateTransformedBody === undefined || templateTransformedBody === '') templateTransformedBody = templateInfo.body;

    var templateModelObject = new templateModel(templateInfo.categoryId, templateInfo.subCategoryId, templateInfo.mappingId, templateInfo.templateTypeId, templateInfo.id, templateInfo.name, templateInfo.subject, templateTransformedBody, templateInfo.createdby, templateInfo.updatedby, templateInfo.triggerEvents, templateInfo.leadTimeNumber, templateInfo.leadTimeInterval, templateInfo.leadTimeMode);
    
    await categoryModel.addTemplateWithEventTrigger(templateModelObject)
        .then(([response]) => {
            if (response.length > 0 && response[0][0].__result === 'inserted') {
                return res.status(200).json({ status: 'true', message: '', result: `Template '${templateInfo.name}' has been successfully created`, tempTypeId: response[0][0].tempTypeId });
            }
            else if (response.length > 0 && response[0][0].__result === 'updated') {
                return res.status(200).json({ status: 'true', message: '', result: `Template '${templateInfo.name}' has been successfully updated`, tempTypeId: response[0][0].tempTypeId });
            }
            else {
                return res.status(200).json({ status: 'true', message: `Unable to get category details`, tempTypeId: templateInfo.templateTypeId });
            }
        })
        .catch(err => {
            return res.status(401).json({ status: 'false', message: `Unable to get category details ${err.message}` });
        });
}

// {
//     "templateTypeId": 45
// }
exports.retrieveTemplate = async (req, res, next) => {
    let templateTypeId = req.body.templateTypeId;

    categoryModel.retrieveTemplate(templateTypeId)
    .then(async ([response]) => {
        if(response.length > 0){

            var selectedEvents = await categoryModel.retrieveEvent(response[0].id);
            if(selectedEvents.length > 0){
                response[0].triggerEvents = selectedEvents[0];
            }
            return res.json({status: 'true', message: '', template: response[0]});
        }
        else{
            return res.json({status: 'false', message: 'Yet to create template', template: []});
        }
    })
    .catch(err => {
        return res.status(401).json({status: 'false', message:"Unable to get template detail" + err.message});
    });
};

async function transformBase64ToUrl(spa, content, req){
    var index = 0;
    var word = 'data:image';
    var transformedContent = content;

    for (var imageLine = spa.length -1; imageLine >= 0 ; imageLine--){
        var base64Content = content.substr(spa[imageLine]-1);
        var endBase64Content = base64Content.indexOf('"');
        base64Content = base64Content.substr(0, endBase64Content);

        var fileName = await templateService.transformTemplateImage(base64Content, index);
        var imageUrl = fileName ;// `${req.protocol}://${req.headers.host}/${imageRootpath}/${fileName}`;
        transformedContent = transformedContent.replace(base64Content, imageUrl);
        index++;
        console.log(imageLine, imageUrl);
    }
    
    return await transformedContent;
}