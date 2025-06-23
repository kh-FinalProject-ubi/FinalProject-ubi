package edu.kh.project.common.config;

import java.nio.charset.Charset;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class APIJOBConfig implements WebMvcConfigurer{

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173")
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .allowCredentials(true);
}
    
    @Bean
    public RestTemplate restTemplate() {
    	 RestTemplate restTemplate = new RestTemplate();
    	    restTemplate.getMessageConverters().add(0,
    	        new StringHttpMessageConverter(Charset.forName("UTF-8")));
    	    restTemplate.getMessageConverters().add(new MappingJackson2XmlHttpMessageConverter());
    	    
        return restTemplate;
    
    }
    
    
}
