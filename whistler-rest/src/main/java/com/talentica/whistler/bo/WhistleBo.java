package com.talentica.whistler.bo;

import java.util.List;

import com.talentica.whistler.bean.WhistleDto;
import com.talentica.whistler.entity.Whistle;

public interface WhistleBo {

	List<WhistleDto> findSharedWhistles(Integer userId, Integer page);
	
	List<WhistleDto> findMineWhistles(Integer userId, Integer page);

	void save(Whistle whistle);

	Whistle update(Whistle whistle);

	List<WhistleDto> findFavWhistles(Integer userId, Integer page);

}
