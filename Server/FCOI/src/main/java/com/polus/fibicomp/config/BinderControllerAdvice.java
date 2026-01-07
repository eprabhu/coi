package com.polus.fibicomp.config;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

@ControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class BinderControllerAdvice {

	// This code protects Spring Core from a "Remote Code Execution" attack ("Spring4Shell").
    // By applying this mitigation, you prevent the "Class Loader Manipulation" attack vector from firing.
    // For more details, see this post: https://www.lunasec.io/docs/blog/spring-rce-vulnerabilities/
	@InitBinder
    public void setAllowedFields(WebDataBinder dataBinder) {
        String[] denylist = new String[]{"class.*", "Class.*", "*.class.*", "*.Class.*"};
        dataBinder.setDisallowedFields(denylist);
    }
}
