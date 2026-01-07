

--
--  `feed_award_details`
--

DROP TABLE IF EXISTS `feed_award_details`;

CREATE TABLE `feed_award_details` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `AWARD_ID` int(11) DEFAULT NULL,
  `AWARD_NUMBER` varchar(255) DEFAULT NULL,
  `CREATE_USER` varchar(255) DEFAULT NULL,
  `IS_ACTIVE` varchar(255) DEFAULT NULL,
  `PI_FULL_NAME` varchar(255) DEFAULT NULL,
  `PI_USER_NAME` varchar(255) DEFAULT NULL,
  `SCENARIO` varchar(255) DEFAULT NULL,
  `TITLE` varchar(1000) DEFAULT NULL,
  `UNIT_NAME` varchar(255) DEFAULT NULL,
  `UNIT_NUMBER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
);

