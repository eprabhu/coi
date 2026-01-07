

--
--  `salutation`
--

DROP TABLE IF EXISTS `salutation`;

CREATE TABLE `salutation` (
  `SALUATATION_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(50) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`SALUATATION_CODE`)
);

