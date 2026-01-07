

--
--  `arg_value_lookup`
--

DROP TABLE IF EXISTS `arg_value_lookup`;

CREATE TABLE `arg_value_lookup` (
  `ARG_VALUE_LOOKUP_ID` int(11) NOT NULL,
  `ARGUMENT_NAME` varchar(30) DEFAULT NULL,
  `ARGUMENT_VALUE` varchar(200) DEFAULT NULL,
  `DESCRIPTION` varchar(500) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`ARG_VALUE_LOOKUP_ID`)
);

