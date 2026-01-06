

--
--  `pre_review_section_type`
--

DROP TABLE IF EXISTS `pre_review_section_type`;

CREATE TABLE `pre_review_section_type` (
  `PRE_REVIEW_SECTION_TYPE_CODE` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `PRE_REVIEW_TYPE_CODE` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`PRE_REVIEW_SECTION_TYPE_CODE`)
);

