

--
--  `person_role_type`
--

DROP TABLE IF EXISTS `person_role_type`;

CREATE TABLE `person_role_type` (
  `ROLE_TYPE_CODE` int(11) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`ROLE_TYPE_CODE`)
);

