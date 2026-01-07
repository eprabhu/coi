

--
--  `remote_detail`
--

DROP TABLE IF EXISTS `remote_detail`;

CREATE TABLE `remote_detail` (
  `IP` varchar(255) NOT NULL,
  `REMOTE_USER` varchar(255) DEFAULT NULL,
  `URL` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IP`)
);

