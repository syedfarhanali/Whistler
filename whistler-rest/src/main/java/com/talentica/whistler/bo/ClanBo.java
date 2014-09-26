package com.talentica.whistler.bo;

import java.util.List;

import com.talentica.whistler.bean.ClanDto;
import com.talentica.whistler.entity.Clan;

public interface ClanBo {

	void save(Clan clan);
	List<ClanDto> findMyClans(Integer userId);
	
	
}
