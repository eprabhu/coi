

--
--  `contact_role_type`
--

DROP TABLE IF EXISTS `contact_role_type`;

CREATE TABLE `contact_role_type` (
  `CONTACT_ROLE_CODE` varchar(10) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`CONTACT_ROLE_CODE`)
);

