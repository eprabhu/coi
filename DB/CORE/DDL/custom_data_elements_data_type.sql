

--
--  `custom_data_elements_data_type`
--

DROP TABLE IF EXISTS `custom_data_elements_data_type`;

CREATE TABLE `custom_data_elements_data_type` (
  `DATA_TYPE_CODE` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`DATA_TYPE_CODE`)
);

