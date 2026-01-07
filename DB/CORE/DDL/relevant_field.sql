

--
--  `relevant_field`
--

DROP TABLE IF EXISTS `relevant_field`;

CREATE TABLE `relevant_field` (
  `RELEVANT_FIELD_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UNIT_NUMBER` varchar(6) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(40) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`RELEVANT_FIELD_CODE`)
);

