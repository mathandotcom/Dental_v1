
create view vw_templatewithevent as 
select te.id as trigger_event_id 
	,te.event_id
    ,te.category_id
    ,te.subcategory_id
    ,te.template_id
    ,template.templatetypename_id
    ,typename.name as template_type_name
    ,template.subject
    ,template.bodycontent
    ,evnt.name as event_name
    ,tc.name as category_name
    ,tsc.name as subcategory_name
  from trigger_event te
  left join templates template on template.id = te.template_id
  left join event evnt on evnt.id = te.event_id
  left join templatetypename typename on typename.id = template.templatetypename_id
  left join templatecategory tc on tc.id = evnt.category_id and tc.id = te.category_id
  left join templatesubcategory tsc on tsc.id = te.subcategory_id
  where te.active = 1 and evnt.active = 1;



