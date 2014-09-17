package com.talentica.whistler.dao;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.Group;

@Repository
public class GroupDaoImpl extends BaseDaoImpl<Group> implements GroupDao{

	public GroupDaoImpl() {
		super(Group.class);
	}

}
