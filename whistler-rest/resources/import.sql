
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
  `password` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `last_modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;

INSERT INTO `user` (`id`, `username`, `password`, `first_name`, `last_name`, `created`, `last_modified`)
VALUES
	(1,'gurpreet.singh',NULL,'Gurpreet','Singh','2014-09-23 18:47:25','2014-09-23 18:47:25'),
	(2,'farhan.syed',NULL,'Farhan','Syed','2014-09-23 18:47:25','2014-09-23 18:47:25'),
	(3,'suyash.gupta',NULL,'Suyasg','Gupta','2014-09-23 18:47:25','2014-09-23 18:47:25');

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
  `created` datetime DEFAULT NULL,
  `last_modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `whistle` WRITE;
/*!40000 ALTER TABLE `whistle` DISABLE KEYS */;

INSERT INTO `whistle` (`id`, `title`, `description`, `image_url`, `url`, `created`, `last_modified`)
VALUES
	(1,'title1','desc1\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(2,'title2','desc2\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(3,'title3','desc3\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(4,'title4','desc4\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(5,'title5','desc5\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(6,'title6','desc6\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(7,'title7','desc7\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(8,'title8','desc8\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(9,'title9','desc9\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(10,'title10','desc10\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(11,'title11','desc11\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(12,'title12','desc12\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL),
	(13,'title13','desc13\n','http://image.com\n','http://url.com','2014-09-23 19:39:28',NULL);

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

CREATE TABLE `whistle_fav_join` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `whistle_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

UNLOCK TABLES;



