

--
--  `role_type`
--

DROP TABLE IF EXISTS `role_type`;

CREATE TABLE `role_type` (
  `ROLE_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`ROLE_TYPE_CODE`)
);

