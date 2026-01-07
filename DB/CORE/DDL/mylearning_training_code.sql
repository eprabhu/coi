

--
--  `mylearning_training_code`
--

DROP TABLE IF EXISTS `mylearning_training_code`;

CREATE TABLE `mylearning_training_code` (
  `MYLEARNING_TRAINING_CODE` varchar(10) PRIMARY KEY NOT NULL,
  `MYLEARNING_TRAINING_TITLE` varchar(1000) NOT NULL,
  `COEUS_TRAINING_CODE` int(11) NOT NULL
);

