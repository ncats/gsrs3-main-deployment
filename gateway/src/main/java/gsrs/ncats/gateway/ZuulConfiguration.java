package gsrs.ncats.gateway;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.cglib.proxy.Callback;
import org.springframework.cglib.proxy.CallbackFilter;
import org.springframework.cglib.proxy.Enhancer;
import org.springframework.cglib.proxy.MethodInterceptor;
import org.springframework.cglib.proxy.MethodProxy;
import org.springframework.cglib.proxy.NoOp;
import org.springframework.cloud.netflix.zuul.filters.RouteLocator;
import org.springframework.cloud.netflix.zuul.filters.ZuulProperties;
import org.springframework.cloud.netflix.zuul.web.ZuulController;
import org.springframework.cloud.netflix.zuul.web.ZuulHandlerMapping;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Zuul configuration. */
@Slf4j
@Configuration
public class ZuulConfiguration {

    // Route order is not preserved with Hocon, so sorting alphabetically by route id controls order.
    // With a Yaml configuration file, you may wish to use the order in which routes are listed in the configuration file.
    @Value("${gsrs.config.gateway.sortRoutes:true}")
    boolean sortRoutes;

    /** The path returned by ErrorContoller.getErrorPath() with Spring Boot < 2.5 (and no longer available on Spring Boot >= 2.5). */
    private static final String ERROR_PATH = "/error";

    /**
     * Constructs a new bean post-processor for Zuul.
     * 
     * @param routeLocator
     *            the route locator.
     * @param zuulController
     *            the Zuul controller.
     * @param errorController
     *            the error controller.
     * @return the new bean post-processor.
     */
    @Bean
    public ZuulPostProcessor zuulPostProcessor(@Autowired RouteLocator routeLocator, @Autowired ZuulController zuulController,
                                               @Autowired ZuulProperties zuulProperties, @Autowired(required = false) ErrorController errorController) {

        if (sortRoutes) {
            log.info("Zuul gateway routes will be sorted by route key.");
            zuulProperties.setRoutes(zuulProperties.getRoutes().entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .collect(Collectors.toMap(
            Map.Entry::getKey,
            Map.Entry::getValue,
            (oldValue, newValue) -> oldValue, LinkedHashMap::new)));
        } else  {
            log.info("Gateway routes will NOT be sorted by route key. If you are using Yaml configuration, route order will reflect the order in the Yaml file. Otherwise route processing order will be random.");
        }
        return new ZuulPostProcessor(routeLocator, zuulController, errorController);
    }

    private static final class ZuulPostProcessor implements BeanPostProcessor {

        private final RouteLocator routeLocator;

        private final ZuulController zuulController;

        private final boolean hasErrorController;

        ZuulPostProcessor(RouteLocator routeLocator, ZuulController zuulController, ErrorController errorController) {
            this.routeLocator = routeLocator;
            this.zuulController = zuulController;
            this.hasErrorController = (errorController != null);
        }

        @Override
        public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
            if (hasErrorController && (bean instanceof ZuulHandlerMapping)) {
                Enhancer enhancer = new Enhancer();
                enhancer.setSuperclass(ZuulHandlerMapping.class);
                enhancer.setCallbackFilter(LookupHandlerCallbackFilter.INSTANCE); // only for lookupHandler
                enhancer.setCallbacks(new Callback[] { LookupHandlerMethodInterceptor.INSTANCE, NoOp.INSTANCE });
                Constructor<?> ctor = ZuulHandlerMapping.class.getConstructors()[0];
                return enhancer.create(ctor.getParameterTypes(), new Object[] { routeLocator, zuulController });
            }
            return bean;
        }
    }

    private static enum LookupHandlerCallbackFilter implements CallbackFilter {

        INSTANCE;

        @Override
        public int accept(Method method) {
            if ("lookupHandler".equals(method.getName())) {
                return 0;
            }
            return 1;
        }

    }

    private static enum LookupHandlerMethodInterceptor implements MethodInterceptor {

        INSTANCE;

        @Override
        public Object intercept(Object target, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
            if (ERROR_PATH.equals(args[0])) {

                /* by entering this branch we avoid the ZuulHandlerMapping.lookupHandler method to trigger the NoSuchMethodError */
                return null;
            }
            return methodProxy.invokeSuper(target, args);
        }

    }

}
