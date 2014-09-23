package com.talentica.whistler.dao;

import java.util.List;

import com.talentica.whistler.entity.Whistle;

public interface WhistleDao extends BaseDao<Whistle>{

	List<Whistle> findSharedWhistles(Integer userId, Integer page);
	
	List<Whistle> findMineWhistles(Integer userId, Integer page);
}
