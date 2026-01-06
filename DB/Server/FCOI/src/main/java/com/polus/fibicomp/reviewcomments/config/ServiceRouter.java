package com.polus.fibicomp.reviewcomments.config;

import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.reviewcomments.service.ReviewCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class ServiceRouter {

    @Autowired
    private ApplicationContext context;

    /**
     * Logic to determine which bean to use based on the moduleCode
     *
     * @param moduleCode
     * @return ReviewCommentService
     */
    public ReviewCommentService getServiceBean(Integer moduleCode) {
        ReviewCommentService reviewCommentService = context.getBean(getBeanName(moduleCode), ReviewCommentService.class);
        return reviewCommentService;
    }

    private String getBeanName(Integer moduleCode) {
        if (moduleCode == null) {
            return "reviewCommentService";
        } else if (Constants.COI_MODULE_CODE == moduleCode) {
            return "reviewCommentService";
        } else if (Constants.OPA_MODULE_CODE == moduleCode) {
            return "reviewCommentService";
        }
        // Default or handle other cases
        return "reviewCommentService";
    }
}
