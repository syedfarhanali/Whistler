package com.talentica.whistler.dao;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.User;

@Repository
public class UserDaoImpl extends BaseDaoImpl<User> implements UserDao{

	public UserDaoImpl() {
		super(User.class);
	}

	@Override
	public User findByUsername(String username) {
		List<User> userList = entityManager
				.createQuery(
						"from "
								+ User.class.getName()
								+ " where username=:username",
								User.class).setParameter("username", username)
								.getResultList();
		if (userList != null && userList.size() != 0) {
			User user = userList.get(0);
			return user;
		} else {
			return null;
		}
	}

	
}
