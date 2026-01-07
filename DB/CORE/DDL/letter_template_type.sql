

--
--  `letter_template_type`
--

DROP TABLE IF EXISTS `letter_template_type`;

CREATE TABLE `letter_template_type` (
  `LETTER_TEMPLATE_TYPE_CODE` varchar(10) NOT NULL,
  `FILE_NAME` varchar(300) DEFAULT NULL,
  `CORRESPONDENCE_TEMPLATE` longblob,
  `CONTENT_TYPE` varchar(100) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `MODULE_CODE` int(11) DEFAULT NULL,
  `SUB_MODULE_CODE` int(11) DEFAULT NULL,
  `PRINT_FILE_TYPE` varchar(20) DEFAULT 'pdf',
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`LETTER_TEMPLATE_TYPE_CODE`)
);

