

--
--  `business_rule_function`
--

DROP TABLE IF EXISTS `business_rule_function`;

CREATE TABLE `business_rule_function` (
  `FUNCTION_NAME` varchar(100) NOT NULL,
  `MODULE_CODE` int(11) DEFAULT NULL,
  `SUB_MODULE_CODE` int(11) DEFAULT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `DB_FUNCTION_NAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`FUNCTION_NAME`)
);
