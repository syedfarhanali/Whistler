package com.talentica.whistler.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talentica.whistler.dao.WhistleDao;
import com.talentica.whistler.entity.Whistle;

@Service
public class WhistleBoImpl implements WhistleBo{

	@Autowired
	private WhistleDao whistleDao;
	
	public void save(Whistle whistle){
		whistleDao.save(whistle);
	}
	
	public Whistle update(Whistle whistle){
		return whistleDao.update(whistle);
	}
	
	public List<Whistle> findByPage(String username, int page){
		return whistleDao.findByPage(username, page);
	}

}
