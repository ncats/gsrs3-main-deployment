package gsrs.ncats.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.web.embedded.tomcat.TomcatConnectorCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@SpringBootApplication
@EnableZuulProxy

public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS");

            }
        };
    }
    
    @Bean
    public ExtraHeaderHandlingFilter simpleExtraHeaderFilter(){
        return new ExtraHeaderHandlingFilter();
    }
    
    @Bean
    public SimpleFilter simpleFilter(){
        return new SimpleFilter();
    }
    

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory>
    containerCustomizer(){
        return new EmbeddedTomcatCustomizer();
    }

    @Bean
    public gsrs.config.GsrsServiceInfoEndpointPathConfiguration gsrsServiceInfoEndpointPathConfiguration(){
        return new gsrs.config.GsrsServiceInfoEndpointPathConfiguration();
    }

    @Bean
    public gsrs.config.GatewayConfigurationServiceInfoController gatewayConfigurationServiceInfoController(){
        return new gsrs.config.GatewayConfigurationServiceInfoController();
    }

    @Bean
    public gsrs.config.BasicServiceInfoController basicServiceInfoController(){
        return new gsrs.config.BasicServiceInfoController();
    }

    private static class EmbeddedTomcatCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

        @Override
        public void customize(TomcatServletWebServerFactory factory) {
            factory.addConnectorCustomizers((TomcatConnectorCustomizer) connector -> {
                connector.setAttribute("relaxedPathChars", "<>[\\]^`{|}");
                connector.setAttribute("relaxedQueryChars", "<>[\\]^`{|}");
            });
        }
    }
}
