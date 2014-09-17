package com.talentica.whistler.dao;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface BaseDao<T> {
	public void save(T entity);

	public void save(Collection<T> entity);

	public T update(T entity);

	public void remove(T entity);

	public T findById(int entityId);

	public T load(Object id);

	public List<T> findAll();

	public List<T> findPaginatedResults(String queryStr, int currentPage, int pageSize);

	public List<T> findParamsPaginatedResults(String queryStr, Object[] params, int currentPage, int pageSize);

	public List<T> findParamsPaginatedResults(String queryStr, Map<String, Object> params, int currentPage, int pageSize);

	public List<T> getResults(String queryStr);

	void refresh(T object);

	void clearEntityManager();

	void flush();

	public <V> List<V> getSQLQueryResult(String query, Class<V> klass);

	public Object getSQLQueryResult(String query);

	List<T> findAllWithJoin(String property);

}
