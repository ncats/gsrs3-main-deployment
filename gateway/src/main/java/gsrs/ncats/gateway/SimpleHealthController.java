package gsrs.ncats.gateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SimpleHealthController {

    @GetMapping("actuator/health")
    public Status health(){
        return Status.INSTANCE;
    }


    public static class Status{
        public static Status INSTANCE = new Status();

        public String status= "UP";
    }
}
