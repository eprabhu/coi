

--
--  `audit_report_type`
--

DROP TABLE IF EXISTS `audit_report_type`;

CREATE TABLE `audit_report_type` (
  `REPORT_ID` int(11) NOT NULL,
  `REPORT_TYPE` varchar(45) DEFAULT NULL,
  `REPORT_NAME` varchar(100) DEFAULT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  `MAX_RESULT_COUNT` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`REPORT_ID`)
);

