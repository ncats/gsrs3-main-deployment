package gsrs.ncats.substances.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Tyler: Without these changes, the browser may set the header for Origin,
        // and spring boot ITSELF will throw an error if the Origin header doesn't
        // match the expected server it thinks its running on (e.g. a proxy).
        //
        // There are likely other places this needs to be fixed, and it probably should
        // be given more thought.

        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods( "POST","GET", "OPTIONS", "DELETE", "PUT")
                ;
    }
}
