

--
--  `mitkc_unit_with_children`
--

DROP TABLE IF EXISTS `mitkc_unit_with_children`;

CREATE TABLE `mitkc_unit_with_children` (
  `UNIT_NUMBER` varchar(8) NOT NULL,
  `UNIT_NAME` varchar(60) NOT NULL,
  `CHILD_UNIT_NUMBER` varchar(8) NOT NULL,
  `CHILD_UNIT_NAME` varchar(60) NOT NULL,
  PRIMARY KEY (`UNIT_NUMBER`,`UNIT_NAME`,`CHILD_UNIT_NUMBER`,`CHILD_UNIT_NAME`)
);

