

--
--  `attachment`
--

DROP TABLE IF EXISTS `attachment`;

CREATE TABLE `attachment` (
  `ID` varchar(255) NOT NULL,
  `CONTENT` tinyblob,
  PRIMARY KEY (`ID`)
);

