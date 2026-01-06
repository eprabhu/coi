

--
--  `unit_type`
--

DROP TABLE IF EXISTS `unit_type`;

CREATE TABLE `unit_type` (
  `UNIT_TYPE_ID` varchar(10) NOT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  `UPDATE_TIMESTAMP` timestamp NULL DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`UNIT_TYPE_ID`)
);

