package com.talentica.whistler.bo;

import org.springframework.beans.factory.annotation.Autowired;

import com.talentica.whistler.dao.WhistleDao;
import com.talentica.whistler.entity.Whistle;

public class WhistleBoImpl implements WhistleBo{

	@Autowired
	private WhistleDao whistleDao;
	
	public void save(Whistle whistle){
		whistleDao.save(whistle);
	}
	
	public Whistle update(Whistle whistle){
		return whistleDao.update(whistle);
	}
}
