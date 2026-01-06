

--
--  `holiday_spcl_working_day_cal`
--

DROP TABLE IF EXISTS `holiday_spcl_working_day_cal`;

CREATE TABLE `holiday_spcl_working_day_cal` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DATE_VALUE` date NOT NULL,
  `DESCRIPTION` varchar(300) NOT NULL,
  `REMARKS` text,
  `DATE_TYPE` enum('Holiday','Business_Day') DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `OPEN_TIME` time DEFAULT NULL,
  `CLOSE_TIME` time DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `DATE_VALUE_UNIQUE` (`DATE_VALUE`)
);

