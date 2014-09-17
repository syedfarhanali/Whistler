package com.talentica.whistler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;

import com.talentica.whistler.dao.UserDao;
import com.talentica.whistler.entity.User;

@ComponentScan
@EnableAutoConfiguration
public class Application {

	public static void main(String[] args) {
		ConfigurableApplicationContext context  = SpringApplication.run(Application.class, args);

		UserDao userDao = context.getBean(UserDao.class);

		User user1 = new User();
		user1.setUsername("gurpreet.singh");
		userDao.save(user1);
		
		User user2 = new User();
		user2.setUsername("farhan.syed");
		userDao.save(user2);
	}
}
