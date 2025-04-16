package gov.nih.ncats.gsrsfrontend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
// (exclude = {DataSourceAutoConfiguration.class })
public class GsrsFrontendApplication {

    @Bean
    public gsrs.config.GsrsServiceInfoEndpointPathConfiguration gsrsServiceInfoEndpointPathConfiguration(){
        return new gsrs.config.GsrsServiceInfoEndpointPathConfiguration();
    }

    @Bean
    public gsrs.config.BasicServiceInfoController basicServiceInfoController(){
        return new gsrs.config.BasicServiceInfoController();
    }

    @Bean
    public gsrs.config.NoEntityConfigurationServiceInfoController noEntityConfigurationServiceInfoController(){
        return new gsrs.config.NoEntityConfigurationServiceInfoController();
    }


    public static void main(String[] args) {
        SpringApplication.run(GsrsFrontendApplication.class, args);
    }
}
