package agrismart.agrismart.event;

import agrismart.agrismart.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DataInitializationListener {

    @Autowired
    private RoleService roleService;

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {
        roleService.initializeRoles();
    }
}
