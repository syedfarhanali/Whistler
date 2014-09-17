package com.talentica.whistler.dao;

import java.util.List;

import com.talentica.whistler.entity.Whistle;

public interface WhistleDao extends BaseDao<Whistle>{

	List<Whistle> findByPage(String username, int page);

}
