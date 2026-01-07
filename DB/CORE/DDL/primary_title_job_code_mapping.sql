

--
--  `primary_title_job_code_mapping`
--

DROP TABLE IF EXISTS `primary_title_job_code_mapping`;

CREATE TABLE `primary_title_job_code_mapping` (
  `MAPPING_ID` int(11) NOT NULL AUTO_INCREMENT,
  `JOB_CODE` varchar(6) DEFAULT NULL,
  `PRIMARY_TITLE` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`MAPPING_ID`),
  KEY `JOB_CODE_FK1` (`JOB_CODE`),
  CONSTRAINT `JOB_CODE_FK1` FOREIGN KEY (`JOB_CODE`) REFERENCES `job_code` (`JOB_CODE`)
);

