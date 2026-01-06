

--
--  `error_details`
--

DROP TABLE IF EXISTS `error_details`;

CREATE TABLE `error_details` (
  `TICKET_NO` int(11) NOT NULL,
  `ERROR_MESSAGE` varchar(255) DEFAULT NULL,
  `REQUEST_BODY` varchar(255) DEFAULT NULL,
  `STACKTRACE_TXT` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TICKET_NO`)
);

