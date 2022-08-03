package gov.nih.ncats.gsrsfrontend.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {
    @Value("${route.prefix:ginas/app/beta/}")
    private String prefix = "ginas/app/beta/";

    @Value("${gsrs.frontend.config.dir:classpath:/static/assets/data}")
    private String frontendConfigDir = "classpath:/static/assets/data";

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
                        Resource indexPage = new ClassPathResource("/static/index.html");
                        if (!frontendConfigDir.startsWith("classpath:/")) {
                            Path fp = Paths.get(frontendConfigDir + "/index.html");
                            if (Files.isReadable(fp)) {
                                indexPage = new PathResource(fp);
                            }
                            if (resourcePath.startsWith("assets/data/")
                                    || resourcePath.startsWith("assets/images/")
                                    || resourcePath.endsWith("styles.custom.css")) {
                                fp = Paths.get(frontendConfigDir + "/" + resourcePath.substring(resourcePath.lastIndexOf("/")+1));
                                if (Files.isReadable(fp)) {
                                    return new PathResource(fp);
                                }
                            }
                        }
                        Resource requestedResource = location.createRelative(resourcePath);
                        return (requestedResource.exists() && requestedResource.isReadable()) ? requestedResource : indexPage;
                    }
                });
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
    }
}
