package com.talentica.whistler.bo;

public interface QueryBo {

	String getQueryString(String queryId);
	String getQueryString(String queryId, Object[] params);
	String makeQueryString(String query, Object[] args);

}
