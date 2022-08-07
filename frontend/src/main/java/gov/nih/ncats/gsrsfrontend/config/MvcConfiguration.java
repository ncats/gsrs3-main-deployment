package gov.nih.ncats.gsrsfrontend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {
    @Value("${route.prefix:ginas/app/beta/}")
    private String prefix = "ginas/app/beta/";

    @Value("${gsrs.frontend.config.dir:classpath:/static/assets/data}")
    private String frontendConfigDir = "classpath:/static/assets/data";

    private final Resource indexPage = new ClassPathResource("/static/index.html");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        if(resourcePath.startsWith(prefix)){
                            resourcePath = resourcePath.substring(prefix.length());
                        }
                        Resource requestedResource;
                        if (!frontendConfigDir.startsWith("classpath:/")) {
                            if (resourcePath.startsWith("assets/data/")
                                    || resourcePath.startsWith("assets/images/")
                                    || resourcePath.endsWith("styles.custom.css")) {
                                requestedResource = new FileSystemResource(frontendConfigDir + "/" + resourcePath.substring(resourcePath.lastIndexOf("/")+1));
                                if (requestedResource.exists() && requestedResource.isReadable()) {
                                    return requestedResource;
                                }
                            }
                        }
                        requestedResource = location.createRelative(resourcePath);
                        return (requestedResource.exists() && requestedResource.isReadable()) ? requestedResource : indexPage;
                    }
                });
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
    }
}
