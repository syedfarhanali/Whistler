package com.talentica.whistler.dao;

import java.util.List;

import com.talentica.whistler.bean.ClanDto;
import com.talentica.whistler.entity.Clan;

public interface ClanDao extends BaseDao<Clan>{

	public List<ClanDto> findMyClans(Integer userId); 
}
