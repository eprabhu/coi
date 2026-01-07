

--
--  `person_status`
--

DROP TABLE IF EXISTS `person_status`;

CREATE TABLE `person_status` (
  `PERSON_STATUS_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`PERSON_STATUS_CODE`)
);

