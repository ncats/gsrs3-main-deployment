package gov.nih.ncats.ssg4m;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
//import org.springframework.data.jpa.repository.config.ComponentScan;

import gov.hhs.gsrs.ssg4.Ssg4DataSourceConfig;
import gov.hhs.gsrs.ssg4.ssg4m.EnableSsg4m;

//import gov.hhs.gsrs.ssg4.DefaultDataSourceConfig;

//import gsrs.EnableGsrsApi;

//import gsrs.EnableGsrsJpaEntities;
//import gsrs.EnableGsrsLegacyAuthentication;
//import gsrs.EnableGsrsLegacyCache;

//import gsrs.EnableGsrsLegacyPayload;
//import gsrs.EnableGsrsBackup;
//import gsrs.EnableGsrsScheduler;
//import gsrs.EnableGsrsLegacySequenceSearch;
//import gsrs.EnableGsrsLegacyStructureSearch;

@EnableSsg4m

//TODO: eventually remove?
//@EnableGsrsLegacySequenceSearch
//@EnableGsrsLegacyStructureSearch

@SpringBootApplication
@EntityScan(basePackages ={"gov.hhs.gsrs"} )
//@EnableJpaRepositories(
//		basePackages = {"gov.hhs.gsrs"}
//)
//@EntityScan(basePackages ={"gov.hhs.gsrs"} )
//@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.hhs.gsrs"} )
//@ComponentScan("gov.hhs.gsrs")
//@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF,
//		additionalDatabaseSourceConfigs= {Ssg4DataSourceConfig.class}
//)

//@EnableGsrsJpaEntities
//@EnableGsrsLegacyAuthentication
//@EnableGsrsLegacyCache
//@EnableGsrsLegacyPayload
//@EnableGsrsScheduler
//@EnableGsrsBackup
//@EnableAsync

public class Ssg4mApplication {

	public static void main(String[] args) {
		SpringApplication.run(Ssg4mApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurerAdapter() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						//  .allowedOrigins("http://localhost:4200")
						.allowedMethods("GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS")
						.allowedHeaders("origin", "Content-Type", "Authorization", "Accept", "Accept-Language", "X-Authorization", "X-Requested-With", "auth-username", "auth-password", "auth-token", "auth-key", "auth-token")
						.allowCredentials(false).maxAge(300);

			}
		};
	}
}

