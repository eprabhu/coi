

--
--  `unit_with_children_errlog`
--

DROP TABLE IF EXISTS `unit_with_children_errlog`;

CREATE TABLE `unit_with_children_errlog` (
  `UNIT_WITH_CHILDER_ERRLOG_ID` int PRIMARY KEY AUTO_INCREMENT,
  `STATUS` varchar(20) DEFAULT NULL,
  `TEXT` varchar(2000) DEFAULT NULL,
  `DATE_LOGGED` datetime DEFAULT NULL
);
