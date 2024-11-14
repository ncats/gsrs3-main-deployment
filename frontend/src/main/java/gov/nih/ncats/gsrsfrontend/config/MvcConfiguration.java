package gov.nih.ncats.gsrsfrontend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {
    private static String STATIC_PREFIX;
    private static String ALT_STATIC_PREFIX;

    @Value("${gsrs.frontend.prefix:ginas/app/ui/}")
    public void setStaticPrefix(String prefix) {
        STATIC_PREFIX = prefix;
    }

    public static String getStaticPrefix() {
        return STATIC_PREFIX;
    }

    @Value("${gsrs.frontend.altPrefix:ginas/app/beta/}")
    public void setAltStaticPrefix(String altPrefix) {
        ALT_STATIC_PREFIX = altPrefix;
    }

    public static String getAltStaticPrefix() {
        return ALT_STATIC_PREFIX;
    }


    public MvcConfiguration(){
    }

    //This is so all the front end refresh/ non-existing files default back to index.html
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        System.out.println("The frontend prefix is: " + getStaticPrefix());
        System.out.println("The frontend altPrefix is: " + getAltStaticPrefix());

        registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/static/")
        .resourceChain(true)
        .addResolver(new PathResourceResolver() {
            @Override
            protected Resource getResource(String resourcePath, Resource location) throws IOException {
                if(resourcePath.startsWith(STATIC_PREFIX)){
                    resourcePath = resourcePath.substring(STATIC_PREFIX.length());
                } else if(resourcePath.startsWith(ALT_STATIC_PREFIX)){
                    resourcePath = resourcePath.substring(ALT_STATIC_PREFIX.length());
                }
                Resource requestedResource = location.createRelative(resourcePath);
                // System.out.println("here in res:" + resourcePath);

                return (requestedResource.exists() && requestedResource.isReadable()) ? requestedResource
                : new ClassPathResource("/static/index.html");
            }
        });
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
    }
}
