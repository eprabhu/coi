

--
--  `custom_data_elements_options`
--

DROP TABLE IF EXISTS `custom_data_elements_options`;

CREATE TABLE `custom_data_elements_options` (
  `CUSTOM_DATA_OPTION_ID` int(11) NOT NULL,
  `CUSTOM_DATA_ELEMENTS_ID` int(11) DEFAULT NULL,
  `OPTION_NAME` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CUSTOM_DATA_OPTION_ID`)
);

