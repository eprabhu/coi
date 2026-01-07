

--
--  `scheduler_job_info_history`
--

DROP TABLE IF EXISTS `scheduler_job_info_history`;

CREATE TABLE `scheduler_job_info_history` (
  `JOB_HISTORY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `JOB_ID` int(11) DEFAULT NULL,
  `CRON_STATUS` varchar(50) DEFAULT NULL,
  `TRIGGER_TYPE` varchar(50) DEFAULT NULL,
  `UPDATE_USER` varchar(50) DEFAULT NULL,
  `START_JOB_TIME` datetime DEFAULT NULL,
  `JOB_END_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`JOB_HISTORY_ID`),
  KEY `SCH_JOB_INFO_FK1` (`JOB_ID`),
  CONSTRAINT `SCH_JOB_INFO_FK1` FOREIGN KEY (`JOB_ID`) REFERENCES `scheduler_job_info` (`JOB_ID`)
);

