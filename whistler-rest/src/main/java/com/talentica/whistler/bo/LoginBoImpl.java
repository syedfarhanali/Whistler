package com.talentica.whistler.bo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talentica.whistler.common.WConstants;
import com.talentica.whistler.dao.UserDao;
import com.talentica.whistler.entity.RestResponse;
import com.talentica.whistler.entity.User;

@Service
public class LoginBoImpl implements LoginBo{

	@Autowired
	private UserDao userDao;
	
	@Override
	public RestResponse validateLogin(String username, String password) {
		RestResponse response = null;
		User user = userDao.findByUsername(username);
		if(null!=user){
			response = new RestResponse(WConstants.SUCCESS, null, user);
		}else{
			response = new RestResponse(WConstants.FAILURE, "User not found!!!", null);
		}
		return response;
	}

}
