DROP procedure IF EXISTS `jdsp_update_template`;

DELIMITER $$

CREATE PROCEDURE `jdsp_update_template`(
	IN __category_id INT,			
	IN __subcategory_id INT,
	IN __categorymapping_id INT,
	IN __template_type_id INT,
    IN __template_type_name varchar(500),
    IN __template_id INT,
    IN __template_subject VARCHAR(500),
    IN __template_body MEDIUMTEXT,
    IN __template_trigger_id VARCHAR(500), -- comma seperated
    IN __createdby    INT,
    IN __leadtime_number INT,
    IN __leadtime_interval INT,
    IN __leadtime_mode INT,
	OUT __result varchar(100)
)
BEGIN
	DECLARE typeCount INT DEFAULT 0;
	DECLARE temp_template_type_id INT DEFAULT 0;
    DECLARE tempEventId INT  DEFAULT 0;
    DECLARE strIDs varchar(100);
    DECLARE strLen    INT DEFAULT 0;
	DECLARE SubStrLen INT DEFAULT 0;
    -- DECLARE result varchar(1000);
  
    -- insert or udpate templatetypename data
    if (__template_type_id > 0) then
		update templatetypename set name = __template_type_name, updatedby = __createdby where id = __template_type_id;
        SET temp_template_type_id = __template_type_id;
        set __result = 'updated';
	else
		insert into templatetypename (categorymapping_id, name, createdby) 
        values (__categorymapping_id, __template_type_name, __createdby);
        SET temp_template_type_id = LAST_INSERT_ID();
        set __result = 'inserted';
    end if;
    
    if(temp_template_type_id > 0 and __template_id > 0) then
		update templates set 
                                subject = __template_subject,
                                bodycontent = __template_body,
                                category_id = __category_id,
                                subcategory_id = __subcategory_id,
                                leadtime_number = __leadtime_number,
                                leadtime_interval = __leadtime_interval,
                                leadtime_mode = __leadtime_mode,
                                updatedby = __createdby
                                where id = __template_id;
		update trigger_event set active = 0 where template_id = __template_id;
	elseif(temp_template_type_id > 0 and __template_id <= 0) then
		insert into templates (templatetypename_id, subject, bodycontent, createdby,
        category_id, subcategory_id, leadtime_number, leadtime_interval, leadtime_mode) 
			values (temp_template_type_id, __template_subject, __template_body, __createdby, 
            __category_id, __subcategory_id, __leadtime_number, __leadtime_interval, __leadtime_mode);
        set __template_id = LAST_INSERT_ID();
    end if;
    
    -- assign template_trigger_id to strIDs
	IF __template_trigger_id IS NULL or __template_trigger_id = '' THEN
		SET strIDs = '';
	else
		SET strIDs = __template_trigger_id;
	END IF;    
    
    -- update or insert trigger event data with respect to template
    if(__template_id > 0 and __template_trigger_id != '') then
		-- set result = strIDs;
        -- set result = 'aa';
        
		do_this:
		  LOOP
          SET typeCount = 0;
			SET strLen = CHAR_LENGTH(strIDs);
            set tempEventId  = SUBSTRING_INDEX(strIDs, ',', 1);
			select count(distinct concat(template_id, event_id)) into typeCount from trigger_event where template_id = __template_id and event_id = tempEventId;
            -- set result = CONCAT(result, ',', template_id, ',', tempEventId, ',', typeCount); -- , ',', SUBSTRING_INDEX(strIDs, ',', 1), ',', template_id);
            
            if(typeCount > 0) then
				UPDATE trigger_event SET active = 1 WHERE template_id = __template_id and event_id =  tempEventId;
				-- set result = CONCAT(result, ',', SUBSTRING_INDEX(strIDs, ',', 1), ',', template_id);
            else
			 	insert into trigger_event (template_id, event_id, category_id, subcategory_id, created_by)
                 values (__template_id, SUBSTRING_INDEX(strIDs, ',', 1), __category_id, __subcategory_id, __createdby);
            end if;

			SET SubStrLen = CHAR_LENGTH(SUBSTRING_INDEX(strIDs, ',', 1)) + 2;
			SET strIDs = MID(strIDs, SubStrLen, strLen);

			IF strIDs = '' THEN
			  LEAVE do_this;
			END IF;
		END LOOP do_this;
    end if;
    commit;
    select __result, temp_template_type_id as tempTypeId, __template_id as template_id;
END$$
DELIMITER ;

-- call jdsp_update_template(1, 1, 1, 71, 'New Appointment - somthing', 44, 'bbb - bbbb', 'ccc - cccc', '4,5,3', 1, @result); select @result;
-- call jdsp_update_template(1, 1, 1, 71, 'New Appointment - somthing', 44, 'bbb', '<p>ccc</p>', '3,5,4', 1, @result);select @result;

-- ***************************************************************************************************************************

DROP procedure IF EXISTS `jdsp_update_schedler_status`;
DELIMITER $$

CREATE PROCEDURE jdsp_update_schedler_status (
	IN __id INT,	
    IN __scheduler_id INT,
    IN __last_job_run DATETIME,
    IN __next_job_frequency INT,
    IN __created_by INT
)
BEGIN
	DECLARE temp_status_id INT DEFAULT 0;
    
	IF(__scheduler_id > 0) then
		Select count(*) into temp_status_id from scheduler_status where scheduler_id = __scheduler_id;
        IF(temp_status_id > 0) THEN
			update scheduler_status set 
			last_job_run = __last_job_run,
            next_job_frequency = __next_job_frequency,
            updated_by = __created_by,
            updatedon = __last_job_run
            where scheduler_id = __scheduler_id;
            SET temp_status_id = __id;
		ELSE
			insert into scheduler_status (scheduler_id, last_job_run, next_job_frequency, created_by) 
            values (__scheduler_id, __last_job_run, __next_job_frequency, __created_by);
            SET temp_status_id = LAST_INSERT_ID();
        END IF;
	ELSE
		SET temp_status_id = 0;
    END IF;
    select temp_status_id;
END$$

DELIMITER ;


-- GetCompletedAppointments
drop procedure IF EXISTS `GetCompletedAppointments`;
DELIMITER $$
CREATE PROCEDURE `GetCompletedAppointments`(
	IN  __leadtime_interval INT,
    IN  __leadtime_mode INT,
    IN  __leadtime INT
)
BEGIN
	DECLARE __leadTimeByMode INT DEFAULT 0;
    DECLARE __leadTimeByMode_attempt INT DEFAULT 0;

	if (__leadtime_mode = 1) then
		set __leadTimeByMode = -__leadtime;
        set __leadTimeByMode_attempt = -(__leadtime + 1);
	elseif(__leadtime_mode = 2) then
    	set __leadTimeByMode = __leadtime;
        set __leadTimeByMode_attempt = __leadtime + 1;
	end if;
    
	if (__leadtime_interval = 1) then
		select _appointment.AptNum
                            ,_appointment.PatNum
                            ,_appointment.AptStatus
                            ,_appointment.Pattern
                            ,_appointment.Confirmed
                            ,_appointment.TimeLocked
                            ,_appointment.AptDateTime
                            ,_appointment.NextAptNum
                            ,_appointment.UnschedStatus
                            ,_appointment.IsNewPatient
                            ,_appointment.ProcDescript
                            ,_histemailsent.campaign_schedule_id
                            ,_histemailsent.appointment_id
                            ,_histemailsent.category_id
                            ,_histemailsent.subcategory_id
                            ,_histemailsent.template_id
                            ,_histemailsent.patient_id
                            ,_histemailsent.email_to
                            ,_histemailsent.email_cc
                            ,_histemailsent.text_to
                            ,_histemailsent.message_status
                            from opendental.appointment _appointment
                            left join histemailsent _histemailsent on _histemailsent.appointment_id = _appointment.AptNum
                            where DATE(_appointment.AptDateTime) = date(date_add(now(), interval __leadTimeByMode day)) 
								or DATE(_appointment.AptDateTime) = date(date_add(now(), interval __leadTimeByMode_attempt day)) ;   
    elseif (__leadtime_interval = 2) then
		select _appointment.AptNum
                            ,_appointment.PatNum
                            ,_appointment.AptStatus
                            ,_appointment.Pattern
                            ,_appointment.Confirmed
                            ,_appointment.TimeLocked
                            ,_appointment.AptDateTime
                            ,_appointment.NextAptNum
                            ,_appointment.UnschedStatus
                            ,_appointment.IsNewPatient
                            ,_appointment.ProcDescript
                            ,_histemailsent.campaign_schedule_id
                            ,_histemailsent.appointment_id
                            ,_histemailsent.category_id
                            ,_histemailsent.subcategory_id
                            ,_histemailsent.template_id
                            ,_histemailsent.patient_id
                            ,_histemailsent.email_to
                            ,_histemailsent.email_cc
                            ,_histemailsent.text_to
                            ,_histemailsent.message_status
                            from opendental.appointment _appointment
                            left join histemailsent _histemailsent on _histemailsent.appointment_id = _appointment.AptNum
                            where DATE(_appointment.AptDateTime) = date(date_add(now(), interval __leadTimeByMode hour))
								or DATE(_appointment.AptDateTime) = date(date_add(now(), interval __leadTimeByMode_attempt day)) ;    
    end if;
END$$
DELIMITER ;



drop procedure IF EXISTS `GetCompletedAppointments`;
DELIMITER $$
CREATE PROCEDURE `GetCompletedAppointments`(
	IN  __leadtime_interval INT,
    IN  __leadtime_mode INT,
    IN  __leadtime INT
)
BEGIN
	DECLARE __leadTimeByMode INT DEFAULT 0;
    DECLARE __leadTimeByMode_attempt INT DEFAULT 0;

	if (__leadtime_interval = 1) then
		if (__leadtime_mode = 1) then
			set __leadTimeByMode = -__leadtime;
			set __leadTimeByMode_attempt = -(__leadtime + 1);
		elseif(__leadtime_mode = 2) then
			set __leadTimeByMode = __leadtime;
			set __leadTimeByMode_attempt = __leadtime + 1;
		end if;
		select _appointment.AptNum as apptmt_id
                            ,_appointment.PatNum as patient_id
                            ,_appointment.AptStatus
                            ,_appointment.Pattern
                            ,_appointment.Confirmed
                            ,_appointment.TimeLocked
                            ,_appointment.AptDateTime
                            ,_appointment.NextAptNum
                            ,_appointment.UnschedStatus
                            ,_appointment.IsNewPatient
                            ,_appointment.ProcDescript
                            ,_histemailsent.id as histemailsent_id
                            ,_histemailsent.appointment_id
                            ,_histemailsent.category_id
                            ,_histemailsent.subcategory_id
                            ,_histemailsent.template_id
                            ,_histemailsent.patient_id as hist_patient_id
                            ,_histemailsent.email_to
                            ,_histemailsent.email_cc
                            ,_histemailsent.text_to
                            ,_histemailsent.message_status
                            from opendental.appointment _appointment
                            left join campaign_sent_status _histemailsent on _histemailsent.appointment_id = _appointment.AptNum and _histemailsent.category_id = 3
                            where (DATE(_appointment.AptDateTime) = date(date_add(now(), interval __leadTimeByMode day)) 
								or DATE(_appointment.AptDateTime) = date(date_add(now(), interval __leadTimeByMode_attempt day)))
                                and _appointment.AptStatus = 2 
                                and (_histemailsent.message_status is null or _histemailsent.message_status = 0);
                                
--                                 and  _histemailsent.id = (
-- 									select _histemailsent2.id from histemailsent _histemailsent2
-- 									where _histemailsent2.appointment_id =  _histemailsent.appointment_id
-- 									order by _histemailsent2.id desc limit 1);   

--                             where _appointment.AptStatus = 2
-- 								and (_histemailsent.message_status is null or _histemailsent.message_status = 0)
-- 								and (DATE(_appointment.AptDateTime) = date(date_add(now(), interval -11 day)) 
-- 								  or DATE(_appointment.AptDateTime) = date(date_add(now(), interval -12 day))) ;
                                    
    elseif (__leadtime_interval = 2) then
		if (__leadtime_mode = 1) then
			set __leadTimeByMode = __leadtime;
			set __leadTimeByMode_attempt = (__leadtime + 1);
		elseif(__leadtime_mode = 2) then
			set __leadTimeByMode = -__leadtime;
			set __leadTimeByMode_attempt = -__leadtime + 1;
		end if;
    
		select _appointment.AptNum as apptmt_id
                            ,_appointment.PatNum as patient_id
                            ,_appointment.AptStatus
                            ,_appointment.Pattern
                            ,_appointment.Confirmed
                            ,_appointment.TimeLocked
                            ,_appointment.AptDateTime
                            ,_appointment.NextAptNum
                            ,_appointment.UnschedStatus
                            ,_appointment.IsNewPatient
                            ,_appointment.ProcDescript
                            ,_histemailsent.id as histemailsent_id
                            ,_histemailsent.appointment_id
                            ,_histemailsent.category_id
                            ,_histemailsent.subcategory_id
                            ,_histemailsent.template_id
                            ,_histemailsent.patient_id as hist_patient_id
                            ,_histemailsent.email_to
                            ,_histemailsent.email_cc
                            ,_histemailsent.text_to
                            ,_histemailsent.message_status
                            from opendental.appointment _appointment
                            left join campaign_sent_status _histemailsent on _histemailsent.appointment_id = _appointment.AptNum and _histemailsent.category_id = 3
                            where _appointment.AptStatus = 2
                            and (_histemailsent.message_status is null or _histemailsent.message_status = 0)
                            and (_appointment.AptDateTime) between (date_add(now(), interval __leadTimeByMode hour)) and (date_add(now(), interval __leadTimeByMode_attempt hour));
                                
                                -- and  _histemailsent.id = (
								-- 	select _histemailsent2.id from histemailsent _histemailsent2
								-- 	where _histemailsent2.appointment_id =  _histemailsent.appointment_id
								-- 	order by _histemailsent2.id desc limit 1);   
    end if;
END$$
DELIMITER ;

-- call GetCompletedAppointments(2, 2, 6);




drop procedure IF EXISTS `GetActiveCampaignTemplate`;
DELIMITER $$
CREATE PROCEDURE `GetActiveCampaignTemplate`(
	IN  __category_id INT
)
BEGIN
    
select _template.id as template_id
                            ,_template.templatetypename_id
                            ,(_template.subject)
                            ,_template.bodycontent
                            ,_template.leadtime_number
                            ,_template.leadtime_interval
                            ,case 
                                when leadtime_interval = 1 then 'day(s)'
                                when leadtime_interval = 2 then 'hour(s)'
                            end as leadtime_interval_desc
                            ,_template.leadtime_mode
                            ,case 
                                when leadtime_mode = 1 then 'before'
                                when leadtime_mode = 2 then 'after'
                            end as leadtime_mode_desc
                            ,_template.category_id
                            ,_template.subcategory_id
                            from templates _template
                            where _template.category_id = __category_id
                                and _template.active = 1
                                and lcase(_template.subject) not like'%birthday%';
END$$
DELIMITER ;

-- call GetActiveCampaignTemplate(3);



drop procedure IF EXISTS `addHistCampaignStatus`;
DELIMITER $$
CREATE PROCEDURE `AddHistCampaignStatus`(
		IN  __campaign_schedule_id INT
		,IN  __appointment_id INT
		,IN  __category_id INT
		,IN  __subcategory_id INT
		,IN  __template_id INT
		,IN  __patient_id INT
		,IN  __email_to varchar(250)
		,IN  __email_cc varchar(250)
		,IN  __text_to varchar(10)
		,IN  __message_status bit
		,IN  __message_error varchar(2500)
		,IN  __createdon varchar(20)
		,IN  __createdby INT    
        ,OUT __result varchar(100)
)
BEGIN
	DECLARE __tempAppointment_id INT DEFAULT 0;
    DECLARE __tempPatient_id INT DEFAULT 0;
    DECLARE __tempCampaign_sent_status_count INT DEFAULT 0;
    
    insert into histemailsent (
                                campaign_schedule_id
                                ,appointment_id
                                ,category_id
                                ,subcategory_id
                                ,template_id
                                ,patient_id
                                ,email_to
                                ,email_cc
                                ,text_to
                                ,message_status
                                ,message_error
                                ,createdon
                                ,createdby
                            ) values (
                                __campaign_schedule_id
                                ,__appointment_id
                                ,__category_id
                                ,__subcategory_id
                                ,__template_id
                                ,__patient_id
                                ,__email_to
                                ,__email_cc
                                ,__text_to
                                ,__message_status
                                ,__message_error
                                ,__createdon
                                ,__createdby	
                            );

	if(__category_id = 3 ) then
		select count(*) into __tempCampaign_sent_status_count from campaign_sent_status where appointment_id = __appointment_id and patient_id = patient_id;
		if(__tempCampaign_sent_status_count = 0) then
			insert into campaign_sent_status (
                                appointment_id
                                ,category_id
                                ,subcategory_id
                                ,template_id
                                ,patient_id
                                ,email_to
                                ,email_cc
                                ,text_to
                                ,message_status
                                ,message_error
                                ,createdon
                                ,createdby
                            ) values (
                                __appointment_id
                                ,__category_id
                                ,__subcategory_id
                                ,__template_id
                                ,__patient_id
                                ,__email_to
                                ,__email_cc
                                ,__text_to
                                ,__message_status
                                ,__message_error
                                ,__createdon
                                ,__createdby	
                            );                            
                            
		elseif(__tempCampaign_sent_status_count > 0) then
			update campaign_sent_status set 
								category_id = __category_id
                                ,subcategory_id = __subcategory_id
                                ,template_id = __template_id
                                ,email_to = __email_to
                                ,email_cc = __email_cc
                                ,text_to = __text_to
                                ,message_status = __message_status
                                ,updatedon = __createdon
                                ,updatedby = __createdby
							where appointment_id = __appointment_id 
								and patient_id = __patient_id;
		end if;
	end if;
END$$
DELIMITER ;



drop procedure IF EXISTS `patientAppointmentById`;
DELIMITER $$
CREATE PROCEDURE `patientAppointmentById`(
	IN  __patient_id INT,
    IN  __appointment_id INT
)
BEGIN
    select pat.PatNum as patient_id 
    ,pat.FName as firstName 
    ,pat.LName as lastName 
	,CONCAT(pat.FName, ' ', IFNULL(CONCAT(pat.MiddleI, ' '),''), pat.LName) as patient_name 
    ,pat.PatStatus as patstatus 
	,pat.Gender as gender 
    ,pat.Position
    ,pat.Birthdate as dob 
    ,pat.Address as address 
    ,pat.Address2 as address2 
	,pat.City as city 
    ,pat.State as state 
    ,pat.wirelessphone as cell 
    ,pat.HmPhone as homephone 
    ,pat.WkPhone as workphone 
	,pat.Email as email 
    ,pat.TxtMsgOk as sendtext 
    ,pat.DateFirstVisit as firstvisit ,pat.Zip as zip 
    ,_appointment.AptNum as appointment_id 
	,_appointment.AptStatus as appointment_status 
    ,DATE_FORMAT(_appointment.AptDateTime, '%m/%d/%Y %h:%i %p') as apptdatetime 
    ,ImageFolder as imagefolder 
	from opendental.patient pat 
    left join opendental.appointment _appointment on pat.PatNum = _appointment.PatNum
	 where pat.PatNum = __patient_id and _appointment.AptNum = __appointment_id;
	 
END$$
DELIMITER ;

-- call patientAppointmentById(3, 37);
