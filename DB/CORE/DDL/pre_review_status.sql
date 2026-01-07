

--
--  `pre_review_status`
--

DROP TABLE IF EXISTS `pre_review_status`;

CREATE TABLE `pre_review_status` (
  `PRE_REVIEW_STATUS_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(50) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`PRE_REVIEW_STATUS_CODE`)
);

