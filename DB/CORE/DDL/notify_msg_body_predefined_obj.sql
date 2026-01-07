

--
--  `notify_msg_body_predefined_obj`
--

DROP TABLE IF EXISTS `notify_msg_body_predefined_obj`;

CREATE TABLE `notify_msg_body_predefined_obj` (
  `NOTIFY_PREDEFINED_OBJ_ID` int(11) NOT NULL AUTO_INCREMENT,
  `MODULE_CODE` int(3) NOT NULL,
  `SUB_MODULE_CODE` varchar(3) NOT NULL,
  `OBJECT` text,
  `OBJECT_TYPE` varchar(3) NOT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`NOTIFY_PREDEFINED_OBJ_ID`)
);

