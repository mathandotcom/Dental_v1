import { TriggerEvent } from '../event/event.model';

export interface TemplateTypeResponse{
    status: string,
    message: string,
    typenames: TemplateTypes[]
}

export interface TemplateTypes{
    id: number,
    categorymapping_id: number,
    category_id: number,
    subcategory_id: number,
    name: string
}

export interface TemplateSubmitResponse{
    status: string,
    message: string,
    result: string;
    tempTypeId: number;
}

export interface TemplateModelResponse{
    status: string,
    message: string,
    template: TemplateItem;
}

export interface TemplateTriggerEvent{
    item_id: number,
    item_text: string,
    category_id: number
}

export interface TemplateItem{
    id: number,
    typename_id: number,
    typename: string,
    subject: string,
    templatefor: string,
    bodycontent: string,
    createdby: number,
    updatedby: number,
    createdon: Date,
    updatedon: Date,
    comments: string,
    leadTimeNumber: number;
    leadTimeInterval: number;
    leadTimeMode: number;
    triggerEvents: TriggerEvent[]
}


export class TemplateModel{
    categoryId: number;
    subCategoryId: number;
    mappingId: number;
    templateTypeId: number;
    id: number;
    name: string;
    subject: string;
    body: string;
    createdby: number;
    updatedby: number;
    leadTimeNumber: number;
    leadTimeInterval: number;
    leadTimeMode: number;
    triggerEvents: TriggerEvent[];

    constructor(categoryId, subCategoryId, mappingId, templateTypeId, id, name, subject, body, createdby, updatedby, triggerEvents, leadTimeNumber, leadTimeInterval, leadTimeMode){
        this.categoryId = categoryId;
        this.subCategoryId = subCategoryId;
        this.mappingId = mappingId;
        this.templateTypeId = templateTypeId;
        this.id = id;
        this.name = name;
        this.subject = subject;
        this.body = body;
        this.createdby = createdby;
        this.updatedby = updatedby;
        this.triggerEvents = triggerEvents;
        this.leadTimeNumber = leadTimeNumber;
        this.leadTimeInterval = leadTimeInterval;
        this.leadTimeMode = leadTimeMode;
    }
}
