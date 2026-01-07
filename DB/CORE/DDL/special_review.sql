

--
--  `special_review`
--

DROP TABLE IF EXISTS `special_review`;

CREATE TABLE `special_review` (
  `SPECIAL_REVIEW_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) NOT NULL,
  `SORT_ID` int(11) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  `IS_INTEGRATED` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`SPECIAL_REVIEW_CODE`)
);

