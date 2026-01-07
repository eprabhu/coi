

--
--  `sponsor_term_type`
--

DROP TABLE IF EXISTS `sponsor_term_type`;

CREATE TABLE `sponsor_term_type` (
  `SPONSOR_TERM_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`SPONSOR_TERM_TYPE_CODE`)
);

