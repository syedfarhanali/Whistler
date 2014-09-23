package com.talentica.whistler;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.talentica.whistler.filter.CORSFilter;

@ComponentScan
@EnableAutoConfiguration
@EnableWebMvc
public class Application {

	public static void main(String[] args) {
		ConfigurableApplicationContext context  = SpringApplication.run(Application.class, args);
	}
	
	@Bean
	public FilterRegistrationBean CORSFilter() {
		FilterRegistrationBean registrationBean = new FilterRegistrationBean();
		CORSFilter corsFilter = new CORSFilter();
		
		List<String> urlPatterns = new ArrayList<String>();
	    urlPatterns.add("/*");
	    
	    registrationBean.setUrlPatterns(urlPatterns);
		registrationBean.setFilter(corsFilter);
		registrationBean.setOrder(1);
		return registrationBean;
		
	}
}
