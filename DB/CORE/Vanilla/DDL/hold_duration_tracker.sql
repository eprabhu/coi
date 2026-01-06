

--
--  `hold_duration_tracker`
--

DROP TABLE IF EXISTS `hold_duration_tracker`;

CREATE TABLE `hold_duration_tracker` (
  `HDT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `ADT_ID` int(11) DEFAULT NULL,
  `START_TIME` timestamp NULL DEFAULT NULL,
  `END_TIME` timestamp NULL DEFAULT NULL,
  `DURATION` varchar(20) DEFAULT NULL,
  `HOLD_PERSON_ID` varchar(40) DEFAULT NULL,
  `RESUME_PERSON_ID` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`HDT_ID`),
  KEY `HDT_FK1` (`ADT_ID`),
  CONSTRAINT `HDT_FK1` FOREIGN KEY (`ADT_ID`) REFERENCES `activity_duration_tracker` (`ADT_ID`)
);

