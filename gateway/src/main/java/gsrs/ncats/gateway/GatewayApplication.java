package gsrs.ncats.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.web.embedded.tomcat.TomcatConnectorCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableEurekaClient
@EnableZuulProxy
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
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

    private static class EmbeddedTomcatCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

        @Override
        public void customize(TomcatServletWebServerFactory factory) {
            factory.addConnectorCustomizers((TomcatConnectorCustomizer) connector -> {
                connector.setProperty("relaxedPathChars", "<>[\\]^`{|}");
                connector.setProperty("relaxedQueryChars", "<>[\\]^`{|}");
            });
        }
    }
}
