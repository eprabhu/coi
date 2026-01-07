

--
--  `pre_review_type`
--

DROP TABLE IF EXISTS `pre_review_type`;

CREATE TABLE `pre_review_type` (
  `PRE_REVIEW_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(50) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`PRE_REVIEW_TYPE_CODE`)
);

