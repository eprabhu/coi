

--
--  `business_rule_variable`
--

DROP TABLE IF EXISTS `business_rule_variable`;

CREATE TABLE `business_rule_variable` (
  `VARIABLE_NAME` varchar(30) NOT NULL,
  `MODULE_CODE` int(11) DEFAULT NULL,
  `SUB_MODULE_CODE` int(11) DEFAULT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `TABLE_NAME` varchar(30) DEFAULT NULL,
  `COLUMN_NAME` varchar(30) DEFAULT NULL,
  `SHOW_LOOKUP` varchar(1) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(40) DEFAULT NULL,
  `LOOKUP_WINDOW_NAME` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`VARIABLE_NAME`)
);

