

--
--  `appointment_type`
--

DROP TABLE IF EXISTS `appointment_type`;

CREATE TABLE `appointment_type` (
  `APPOINTMENT_TYPE_CODE` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `DURATION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`APPOINTMENT_TYPE_CODE`)
);

