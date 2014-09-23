package com.talentica.whistler.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.talentica.whistler.bean.WhistleDto;
import com.talentica.whistler.dao.WhistleDao;
import com.talentica.whistler.entity.Whistle;

@Service
public class WhistleBoImpl implements WhistleBo{

	@Autowired
	private WhistleDao whistleDao;
	
	@Override
	public void save(Whistle whistle){
		whistleDao.save(whistle);
	}
	
	@Override
	public Whistle update(Whistle whistle){
		return whistleDao.update(whistle);
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

}
