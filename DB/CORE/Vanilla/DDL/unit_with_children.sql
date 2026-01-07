

--
--  `unit_with_children`
--

DROP TABLE IF EXISTS `unit_with_children`;

CREATE TABLE `unit_with_children` (
  `UNIT_NUMBER` varchar(8) NOT NULL,
  `CHILD_UNIT_NUMBER` varchar(8) NOT NULL,
  `UNIT_NAME` varchar(200) DEFAULT NULL,
  `CHILD_UNIT_NAME` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`UNIT_NUMBER`,`CHILD_UNIT_NUMBER`)
);