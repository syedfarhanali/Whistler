package com.talentica.whistler.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.talentica.whistler.bo.QueryBo;
import com.talentica.whistler.entity.Whistle;

@Repository
public class WhistleDaoImpl extends BaseDaoImpl<Whistle> implements WhistleDao{

	public WhistleDaoImpl() {
		super(Whistle.class);
	}
	
	@Autowired
	private QueryBo queryBo;

	@Override
	public List<Whistle> findByPage(String username, int page) {
		return null;
	}

}
