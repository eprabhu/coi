

--
--  `job_code`
--

DROP TABLE IF EXISTS `job_code`;

CREATE TABLE `job_code` (
  `JOB_CODE` varchar(6) NOT NULL,
  `JOB_TITLE` varchar(50) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `MONTHLY_SALARY` decimal(12,2) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`JOB_CODE`)
);

