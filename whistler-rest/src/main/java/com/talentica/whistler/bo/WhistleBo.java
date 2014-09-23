package com.talentica.whistler.bo;

import java.util.List;

import com.talentica.whistler.entity.Whistle;

public interface WhistleBo {

	List<Whistle> findSharedWhistles(Integer userId, Integer page);
	
	List<Whistle> findMineWhistles(Integer userId, Integer page);

	void save(Whistle whistle);

	Whistle update(Whistle whistle);

	List<Whistle> findFavWhistles(Integer userId, Integer page);

}
