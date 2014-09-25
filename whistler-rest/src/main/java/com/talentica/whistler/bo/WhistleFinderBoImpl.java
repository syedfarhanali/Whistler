package com.talentica.whistler.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.talentica.whistler.bean.SaveWhistleDto;
import com.talentica.whistler.bean.WhistleDto;
import com.talentica.whistler.common.Util;
import com.talentica.whistler.dao.WhistleClanJoinDao;
import com.talentica.whistler.dao.WhistleDao;
import com.talentica.whistler.dao.WhistleFavJoinDao;
import com.talentica.whistler.dao.WhistleUserJoinDao;
import com.talentica.whistler.entity.Whistle;
import com.talentica.whistler.entity.WhistleGroupJoin;
import com.talentica.whistler.entity.WhistleUserJoin;

@Service
public class WhistleFinderBoImpl implements WhistleFinderBo{

	@Autowired
	private WhistleDao whistleDao;
	@Autowired
	private WhistleFavJoinDao whistleFavJoinDao;
	@Autowired
	private WhistleUserJoinDao whistleUserJoinDao;
	@Autowired
	private WhistleClanJoinDao whistleClanJoinDao;
	
	@Override
	public void save(Whistle whistle){
		whistleDao.save(whistle);
	}
	
	@Override
	public Whistle update(SaveWhistleDto whistleDto){
		Whistle whistle = new Whistle(whistleDto);
		whistle =  whistleDao.update(whistle);
		
		WhistleUserJoin wuj = new WhistleUserJoin(whistle.getId().intValue(),whistleDto.getUserId());
		whistleUserJoinDao.update(wuj);
		
		if(!Util.nullOrEmpty(whistleDto.getClanIds())){
			for(Integer clanId : whistleDto.getClanIds()){
				WhistleGroupJoin wgj = new WhistleGroupJoin(whistle.getId().intValue(),clanId);
				whistleClanJoinDao.update(wgj);
			}
		}
		
		return whistle;
	}
	
	@Override
	@Transactional(readOnly=true)
	public List<WhistleDto> findSharedWhistles(Integer userId, Integer page) {
		return whistleDao.findSharedWhistles(userId, page);
	}

	@Override
	@Transactional(readOnly=true)
	public List<WhistleDto> findMineWhistles(Integer userId, Integer page) {
		return whistleDao.findMineWhistles(userId, page);
	}

	@Override
	public List<WhistleDto> findFavWhistles(Integer userId, Integer page) {
		return whistleDao.findFavWhistles(userId, page);
	}
	
	@Override
	@Transactional(readOnly=true)
	public List<WhistleDto> findClanWhistles(Integer clanId, Integer page) {
		return whistleDao.findClanWhistles(clanId, page);
	}
	
}
