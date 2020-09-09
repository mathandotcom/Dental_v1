
-- Insert some default data

insert into clinic (
name, groupof, address1, address2, city, state, zip, created_by ) 
values(
'Brook hallow familiy dentistry', 'Brook Hallow Group', 'San Padro Avenue', 'Highway 281', 'San Antonio', 'Texas', '78248', 1
);

insert into clinic (
name, groupof, address1, address2, city, state, zip, created_by, primary_contact, primary_phone, primary_email ) 
values(
'Brook hallow familiy dentistry', 'Brook Hallow Group', 'San Padro Avenue', 'Highway 281', 'San Antonio', 'Texas', '78248', 1, 'Dr. Chauan', '2102222222', 'brookfamily@gmail.com'
);


insert into templatecategory (name, createdby) values ('Appointment', 1);
insert into templatecategory (name, createdby) values ('Patient', 1);
insert into templatecategory (name, createdby) values ('Campaign', 1);
insert into templatecategory (name, createdby) values ('Referral', 1);
insert into templatecategory (name, createdby) values ('Survey', 1);


insert into templatesubcategory (name, createdby) values ('Email', 1);
insert into templatesubcategory (name, createdby) values ('Text', 1);
insert into templatesubcategory (name, createdby) values ('Letter', 1);


insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (1, 1, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (1, 2, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (1, 3, 1);

insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (2, 1, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (2, 2, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (2, 3, 1);

insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (3, 1, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (3, 2, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (3, 3, 1);

insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (4, 1, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (4, 2, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (4, 3, 1);

insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (5, 1, 1);
insert into templatecategorymapping (category_id, subcategory_id, createdby ) values (5, 2, 1);


insert into scheduler (name, frequency, created_by) values ('Regular', 2, 1);

insert into event (name, created_by, category_id) values('Add New Patient', 1, 2);
insert into event (name, created_by, category_id) values('Update Patient', 1, 2);
insert into event (name, created_by, category_id) values('Appointment is scheduled', 1, 1);
insert into event (name, created_by, category_id) values('Reschedule Appointment', 1, 1);
insert into event (name, created_by, category_id) values('Cancel Appointment', 1, 1);
insert into event (name, created_by, category_id) values('Feedback when treatment is completed', 1, 2);
insert into event (name, created_by, category_id) values('Birthday Wishes', 1, 3);
insert into event (name, created_by, category_id) values('Reminder', 1, 3);