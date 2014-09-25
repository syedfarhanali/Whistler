package com.talentica.whistler.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.talentica.whistler.dao.ClanDao;
import com.talentica.whistler.entity.Clan;

@Service
public class ClanBoImpl implements ClanBo{

	@Autowired
	private ClanDao clanDao;
	
	@Override
	public void save(Clan clan){
		clanDao.save(clan);
	}
	
	@Override
	@Transactional(readOnly=true)
	public List<Clan> findMyClans(Integer userId) {
		return clanDao.findMyClans(userId);
	}

	
	
}
