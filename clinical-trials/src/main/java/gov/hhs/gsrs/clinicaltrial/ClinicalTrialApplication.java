package gov.hhs.gsrs.clinicaltrial;

import gov.hhs.gsrs.clinicaltrial.us.EnableClinicalTrialUS;
import gov.hhs.gsrs.clinicaltrial.europe.EnableClinicalTrialEurope;
import gsrs.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@EnableClinicalTrialUS
@EnableClinicalTrialEurope
//TODO: This may be an issue, and we may need to refactor to make less
// explicit reference to FDA-specific systems.

@SpringBootApplication
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF,
        additionalDatabaseSourceConfigs = {ClinicalTrialDataSourceConfig.class}
)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
// @EnableGsrsLegacySequenceSearch
// @EnableGsrsLegacyStructureSearch
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.hhs.gsrs.clinicaltrial"} )

// if using automatic database for substances and one config database for clinical trials, do this:
// @EnableJpaRepositories(basePackages ={"ix","gsrs", "gov.nih.ncats"} )

// if using config database for substances and one config database for clinical trials, do this:
// do not have any @EnableJpaRepositories annotation

// if a single automatic datasource for both substances and clinical trials, do this:
// @EnableJpaRepositories(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.nih.ncats2"} )

@EnableGsrsScheduler
@EnableGsrsBackup
@EnableAsync
// tried this
// @EnableAutoConfiguration(exclude = {  DataSourceAutoConfiguration.class })
public class ClinicalTrialApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicalTrialApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // .allowedOrigins("http://localhost:4200")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("origin", "Content-Type", "Authorization", "Accept", "Accept-Language", "X-Authorization", "X-Requested-With", "auth-username", "auth-password", "auth-token", "auth-key", "auth-token")
                        .allowCredentials(false).maxAge(300);
            }
        };
    }
}