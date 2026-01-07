

--
--  `unit_level`
--

DROP TABLE IF EXISTS `unit_level`;

CREATE TABLE `unit_level` (
  `UNIT_NUMBER` varchar(8) NOT NULL,
  `UNIT_NAME` varchar(200) DEFAULT NULL,
  `PARENT_UNIT_NUMBER` varchar(8) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `LVL` int(11) DEFAULT NULL,
  PRIMARY KEY (`UNIT_NUMBER`)
);

