

--
--  `person_login_details`
--

DROP TABLE IF EXISTS `person_login_details`;

CREATE TABLE `person_login_details` (
  `LOGIN_DETAIL_ID` int(11) NOT NULL AUTO_INCREMENT,
  `PERSON_ID` varchar(40) DEFAULT NULL,
  `LOGIN_STATUS` varchar(10) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `FULL_NAME` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`LOGIN_DETAIL_ID`),
  KEY `PERSON_LOGIN_DETAILS_FK1` (`PERSON_ID`)
);

