package gsrs.ncats.substances;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import gsrs.EnableGsrsApi;
import gsrs.EnableGsrsBackup;
import gsrs.EnableGsrsJpaEntities;
import gsrs.EnableGsrsLegacyAuthentication;
import gsrs.EnableGsrsLegacyCache;
import gsrs.EnableGsrsLegacyPayload;
import gsrs.EnableGsrsLegacySequenceSearch;
import gsrs.EnableGsrsLegacyStructureSearch;
import gsrs.EnableGsrsScheduler;
import gsrs.cv.EnableControlledVocabulary;
import ix.core.search.bulk.EnableBulkSearch;

@SpringBootApplication
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EnableGsrsLegacySequenceSearch
@EnableGsrsLegacyStructureSearch
@EnableBulkSearch
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats"} )
//@EnableJpaRepositories(basePackages ={"ix","gsrs", "gov.nih.ncats"} )
@EnableScheduling
@EnableGsrsScheduler
@EnableGsrsBackup
@EnableControlledVocabulary
//@EnableAsync   //disable asynchronous events for now 11/09/2022. 
                 //Technically this can work okay, but something about the transaction
                 //requirements of the existing listeners can cause issues.
public class SubstancesApplication {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Tyler: Without these changes, the browser may set the header for Origin,
                // and spring boot ITSELF will throw an error if the Origin header doesn't
                // match the expected server it thinks its running on (e.g. a proxy).
                //
                // There are likely other places this needs to be fixed, and it probably should
                // be given more thought.
                
                registry.addMapping("/**")
                        .allowedOrigins("*") //debugging
                        .allowedMethods( "POST","GET", "OPTIONS", "DELETE", "PUT")
                        ;
            }
        };
    }

    public static void main(String[] args) {

//        System.out.println("PROPERTY VALUE = "+ System.getProperty("EUREKA_SERVER"));
        SpringApplication.run(SubstancesApplication.class, args);
    }

}
