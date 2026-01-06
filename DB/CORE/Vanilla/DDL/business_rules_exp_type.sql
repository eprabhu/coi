

--
--  `business_rules_exp_type`
--

DROP TABLE IF EXISTS `business_rules_exp_type`;

CREATE TABLE `business_rules_exp_type` (
  `EXPRESSION_TYPE_CODE` varchar(1) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`EXPRESSION_TYPE_CODE`)
);

