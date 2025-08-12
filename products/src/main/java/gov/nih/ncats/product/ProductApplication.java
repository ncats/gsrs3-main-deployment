package gov.nih.ncats.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.scheduling.annotation.EnableScheduling;
import gov.hhs.gsrs.products.product.EnableProduct;
import gov.hhs.gsrs.products.ProductDataSourceConfig;
import gsrs.*;

//TODO: This may be an issue, and we may need to refactor to make less
// explicit reference to FDA-specific systems.
@EnableProduct

//TODO: eventually remove?
@EnableGsrsLegacySequenceSearch
@EnableGsrsLegacyStructureSearch
@EnableScheduling
@SpringBootApplication
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.hhs.gsrs"} )
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF,
		additionalDatabaseSourceConfigs= {ProductDataSourceConfig.class}
)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EnableGsrsScheduler
@EnableGsrsBackup
//@EnableAsync

public class ProductApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductApplication.class, args);
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

