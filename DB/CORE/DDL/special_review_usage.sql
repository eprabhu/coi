

--
--  `special_review_usage`
--

DROP TABLE IF EXISTS `special_review_usage`;

CREATE TABLE `special_review_usage` (
  `SPECIAL_REVIEW_USAGE_ID` int(11) NOT NULL,
  `SPECIAL_REVIEW_CODE` varchar(3) DEFAULT NULL,
  `MODULE_CODE` int(11) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `GLOBAL_FLAG` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`SPECIAL_REVIEW_USAGE_ID`)
);

