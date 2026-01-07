

--
--  `review_status`
--

DROP TABLE IF EXISTS `review_status`;

CREATE TABLE `review_status` (
  `REVIEW_STATUS_CODE` int(11) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`REVIEW_STATUS_CODE`)
);

