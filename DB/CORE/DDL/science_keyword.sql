

--
--  `science_keyword`
--

DROP TABLE IF EXISTS `science_keyword`;

CREATE TABLE `science_keyword` (
  `SCIENCE_KEYWORD_CODE` varchar(15) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`SCIENCE_KEYWORD_CODE`)
);

