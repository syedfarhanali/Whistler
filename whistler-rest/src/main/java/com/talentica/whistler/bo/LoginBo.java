package com.talentica.whistler.bo;

import com.talentica.whistler.entity.RestResponse;

public interface LoginBo {

	RestResponse validateLogin(String username, String password);

}
