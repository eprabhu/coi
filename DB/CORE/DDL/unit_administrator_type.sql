

--
--  `unit_administrator_type`
--

DROP TABLE IF EXISTS `unit_administrator_type`;

CREATE TABLE `unit_administrator_type` (
  `UNIT_ADMINISTRATOR_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `DEFAULT_GROUP_FLAG` varchar(1) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`UNIT_ADMINISTRATOR_TYPE_CODE`)
);

