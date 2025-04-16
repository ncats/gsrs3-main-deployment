package gsrs.ncats.gateway;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {
    private static final String prefix = "ginas/app/beta/";
    
    public MvcConfiguration(){
    }
    //This is so all the front end refresh/ non-existing files default back to index.html
//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//           registry.addResourceHandler("/**")
//                .addResourceLocations("classpath:/static/")
//                .resourceChain(true)
//                .addResolver(new PathResourceResolver() {
//                    @Override
//                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
//                        if(resourcePath.startsWith(prefix)){
//                               resourcePath = resourcePath.substring(prefix.length());
//                        }
//                        Resource requestedResource = location.createRelative(resourcePath);
//                        System.out.println("here in res:" + resourcePath);
//
//                        return (requestedResource.exists() && requestedResource.isReadable()) ? requestedResource
//                                : new ClassPathResource("/static/index.html");
//                    }
//                });
//    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
    }
}
