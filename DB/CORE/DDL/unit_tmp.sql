

--
--  `unit_tmp`
--

DROP TABLE IF EXISTS `unit_tmp`;

CREATE TABLE `unit_tmp` (
  `ID` int(11) NOT NULL,
  `UNIT_NUMBER` varchar(8) DEFAULT NULL,
  `UNIT_NAME` varchar(60) DEFAULT NULL,
  `PARENT_UNIT_NUMBER` varchar(8) DEFAULT NULL,
  `PARENT_ID` int(11) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`ID`)
);

