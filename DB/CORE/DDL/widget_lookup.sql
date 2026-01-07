

--
--  `widget_lookup`
--

DROP TABLE IF EXISTS `widget_lookup`;

CREATE TABLE `widget_lookup` (
  `WIDGET_ID` int(11) NOT NULL,
  `DESCRIPTION` varchar(1000) DEFAULT NULL,
  `WIDGET_NAME` varchar(200) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `IMAGE_PATH` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`WIDGET_ID`)
);

