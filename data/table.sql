
CREATE TABLE `appt_reminder` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientid` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `appointment_sr_no` bigint NOT NULL,
  `appointment_date` varchar(20) DEFAULT NULL,
  `appointment_time` varchar(10) DEFAULT NULL,
  `appointment_cell` varchar(10) DEFAULT NULL,
  `appointment_reminder` varchar(255) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedby` int DEFAULT NULL,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(1000) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `createdby` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `chat_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `recipient_id` int NOT NULL,
  `conversation_id` varchar(10) NOT NULL,
  `conversation_dir` varchar(10) NOT NULL,
  `message` varchar(1000) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `createdby` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


CREATE TABLE `clinic` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `groupof` varchar(255) DEFAULT NULL,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `city` varchar(55) DEFAULT NULL,
  `state` varchar(55) DEFAULT NULL,
  `zip` varchar(10) DEFAULT NULL,
  `primary_contact` varchar(255) DEFAULT NULL,
  `primary_phone` varchar(10) DEFAULT NULL,
  `secondary_phone` varchar(10) DEFAULT NULL,
  `primary_email` varchar(255) DEFAULT NULL,
  `comments` varchar(2000) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


CREATE TABLE `consent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientid` bigint NOT NULL,
  `clinic_id` int NOT NULL,
  `filename` varchar(45) DEFAULT NULL,
  `filePath` varchar(255) DEFAULT NULL,
  `doctype` varchar(55) DEFAULT NULL,
  `comments` varchar(2000) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  CONSTRAINT `consent_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinic` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `payoption` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clinic_id` int NOT NULL,
  `treatplannum` bigint NOT NULL,
  `filename` varchar(45) DEFAULT NULL,
  `filePath` varchar(255) DEFAULT NULL,
  `comments` varchar(2000) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  CONSTRAINT `payoption_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinic` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `templatecategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(250) DEFAULT NULL,
  `createdby` int DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;



CREATE TABLE `templatesubcategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(250) DEFAULT NULL,
  `createdby` int DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


CREATE TABLE `templatecategorymapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `createdby` int DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `subcategory_id` (`subcategory_id`),
  CONSTRAINT `subcategory_idfk_1` FOREIGN KEY (`subcategory_id`) REFERENCES `templatesubcategory` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


CREATE TABLE `templatetypename` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categorymapping_id` int DEFAULT NULL,
  `name` varchar(250) DEFAULT NULL,
  `createdby` int DEFAULT NULL,
  `updatedby` int DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedon` datetime DEFAULT CURRENT_TIMESTAMP,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `categorymapping_id` (`categorymapping_id`),
  CONSTRAINT `categorymapping_idfk_1` FOREIGN KEY (`categorymapping_id`) REFERENCES `templatecategorymapping` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;



CREATE TABLE `templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `templatetypename_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `subject` varchar(250) DEFAULT NULL,
  `templatefor` varchar(250) DEFAULT NULL,
  `leadtime_number` int DEFAULT '0',
  `leadtime_interval` int DEFAULT '0',
  `leadtime_mode` int DEFAULT '0',
  `bodycontent` MEDIUMTEXT DEFAULT NULL,
  `createdby` int DEFAULT NULL,
  `updatedby` int DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedon` datetime DEFAULT CURRENT_TIMESTAMP,
  `active` int DEFAULT '1',
  `comments` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `templatetypename_id` (`templatetypename_id`),
  CONSTRAINT `templatetypename_idfk_1` FOREIGN KEY (`templatetypename_id`) REFERENCES `templatetypename` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clinic_id` int NOT NULL,
  `username` varchar(250) DEFAULT NULL,
  `password` text,
  `firstname` varchar(250) DEFAULT NULL,
  `lastname` varchar(250) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `roleid` int DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedon` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedby` int DEFAULT NULL,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinic` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


CREATE TABLE `event` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `category_id` 	int  NOT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `active` int DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;



CREATE TABLE `trigger_event` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` 		int  NOT NULL,
  `category_id` 	int  NOT NULL,
  `subcategory_id` int  NOT NULL,
  `template_id` 	int  NOT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `active` int DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

 
CREATE TABLE `scheduler` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `frequency` 		int  NOT NULL, -- in min
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;




CREATE TABLE `scheduler_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scheduler_id` int NOT NULL,
  `last_job_run` datetime NOT NULL,
  `next_job_frequency` int NOT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updatedon` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `active` int DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;



CREATE TABLE `campaign_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `subcategory_id` int NOT NULL,
  `template_id` int NOT NULL,
  `leadtime_number` int NOT NULL,
  `leadtime_interval` varchar(20) NOT NULL,
  `leadtime_mode` varchar(20) NOT NULL,
  `createdby` int DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `subcategory_id` (`subcategory_id`),
  CONSTRAINT `subcategory_idfk_2` FOREIGN KEY (`subcategory_id`) REFERENCES `templatesubcategory` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


CREATE TABLE `histemailsent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_schedule_id` int DEFAULT NULL,
  `appointment_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `template_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `email_to` varchar(250) DEFAULT NULL,
  `email_cc` varchar(250) DEFAULT NULL,
  `text_to` varchar(10) DEFAULT NULL,
  `message_status` bit DEFAULT 0,
  `message_error` varchar(2500) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `createdby` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `templates` (`id`),
  CONSTRAINT `template_id_idfk_1` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE `campaign_sent_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `template_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `email_to` varchar(250) DEFAULT NULL,
  `email_cc` varchar(250) DEFAULT NULL,
  `text_to` varchar(10) DEFAULT NULL,
  `message_status` bit DEFAULT 0,
  `message_error` varchar(2500) DEFAULT NULL,
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `createdby` int DEFAULT NULL,
  `updatedon` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedby` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `templates` (`id`),
  CONSTRAINT `template_id_idfk_2` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;


