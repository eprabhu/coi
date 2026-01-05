

--
--  `rate_class_type`
--

DROP TABLE IF EXISTS `rate_class_type`;

CREATE TABLE `rate_class_type` (
  `SORT_ID` int(11) DEFAULT NULL,
  `PREFIX_ACTIVITY_TYPE` varchar(1) DEFAULT 'N',
  `RATE_CLASS_TYPE` varchar(1) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`RATE_CLASS_TYPE`)
);

