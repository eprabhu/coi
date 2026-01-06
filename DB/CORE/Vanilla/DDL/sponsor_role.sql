

--
--  `sponsor_role`
--

DROP TABLE IF EXISTS `sponsor_role`;

CREATE TABLE `sponsor_role` (
  `SPONSOR_ROLE_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`SPONSOR_ROLE_TYPE_CODE`)
);

