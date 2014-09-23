
# Dump of table clan
# ------------------------------------------------------------

DROP TABLE IF EXISTS `clan`;

CREATE TABLE `clan` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `last_modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `clan` WRITE;
/*!40000 ALTER TABLE `clan` DISABLE KEYS */;

INSERT INTO `clan` (`id`, `name`, `created`, `last_modified`)
VALUES
	(1,'All','2014-09-18 21:21:04','2014-09-18 21:21:04'),
	(2,'Fidelis','2014-09-18 21:21:04','2014-09-18 21:21:04'),
	(3,'Mobile','2014-09-18 21:21:04','2014-09-18 21:21:04');

/*!40000 ALTER TABLE `clan` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `last_modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;

INSERT INTO `user` (`id`, `username`, `created`, `last_modified`)
VALUES
	(1,'gurpreet.singh','2014-09-18 21:16:08','2014-09-18 21:16:08'),
	(2,'farhan.syed','2014-09-18 21:16:08','2014-09-18 21:16:08'),
	(3,'suyash.gupta','2014-09-18 21:16:08','2014-09-18 21:16:08');

/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user_clan_join
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_clan_join`;

CREATE TABLE `user_clan_join` (
  `user_id` int(11) unsigned NOT NULL,
  `clan_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `user_clan_join` WRITE;
/*!40000 ALTER TABLE `user_clan_join` DISABLE KEYS */;

INSERT INTO `user_clan_join` (`user_id`, `clan_id`)
VALUES
	(1,1),
	(1,2),
	(2,1),
	(2,2),
	(3,1),
	(3,3);

/*!40000 ALTER TABLE `user_clan_join` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table whistle
# ------------------------------------------------------------

DROP TABLE IF EXISTS `whistle`;

CREATE TABLE `whistle` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `image_url` tinytext,
  `url` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `whistle` WRITE;
/*!40000 ALTER TABLE `whistle` DISABLE KEYS */;

INSERT INTO `whistle` (`id`, `title`, `description`, `image_url`, `url`)
VALUES
	(1,'title1','desc1\n','http://image.com\n','http://url.com'),
	(2,'title2','desc2\n','http://image.com\n','http://url.com'),
	(3,'title3','desc3\n','http://image.com\n','http://url.com'),
	(4,'title4','desc4\n','http://image.com\n','http://url.com'),
	(5,'title5','desc5\n','http://image.com\n','http://url.com'),
	(6,'title6','desc6\n','http://image.com\n','http://url.com'),
	(7,'title7','desc7\n','http://image.com\n','http://url.com'),
	(8,'title8','desc8\n','http://image.com\n','http://url.com'),
	(9,'title9','desc9\n','http://image.com\n','http://url.com'),
	(10,'title10','desc10\n','http://image.com\n','http://url.com'),
	(11,'title11','desc11\n','http://image.com\n','http://url.com'),
	(12,'title12','desc12\n','http://image.com\n','http://url.com'),
	(13,'title13','desc13\n','http://image.com\n','http://url.com');

/*!40000 ALTER TABLE `whistle` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table whistle_clan_join
# ------------------------------------------------------------

DROP TABLE IF EXISTS `whistle_clan_join`;

CREATE TABLE `whistle_clan_join` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `whistle_id` int(11) DEFAULT NULL,
  `clan_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `whistle_clan_join` WRITE;
/*!40000 ALTER TABLE `whistle_clan_join` DISABLE KEYS */;

INSERT INTO `whistle_clan_join` (`id`, `whistle_id`, `clan_id`)
VALUES
	(1,1,1),
	(2,2,1),
	(3,3,1),
	(4,4,1),
	(5,5,1),
	(6,6,2),
	(7,7,2),
	(8,8,2),
	(9,9,2),
	(10,10,2);

/*!40000 ALTER TABLE `whistle_clan_join` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table whistle_user_join
# ------------------------------------------------------------

DROP TABLE IF EXISTS `whistle_user_join`;

CREATE TABLE `whistle_user_join` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `whistle_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `whistle_user_join` WRITE;
/*!40000 ALTER TABLE `whistle_user_join` DISABLE KEYS */;

INSERT INTO `whistle_user_join` (`id`, `whistle_id`, `user_id`)
VALUES
	(1,11,1),
	(2,12,2),
	(3,13,3);

/*!40000 ALTER TABLE `whistle_user_join` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
