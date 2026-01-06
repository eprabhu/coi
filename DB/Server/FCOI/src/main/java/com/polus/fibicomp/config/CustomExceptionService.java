package com.polus.fibicomp.config;

import com.polus.core.applicationexception.dao.ApplicationExceptionDao;
import com.polus.core.applicationexception.pojo.ApplicationErrorDetails;
import com.polus.core.security.AuthenticatedUser;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CustomExceptionService {

    protected static Logger logger = LogManager.getLogger(CustomExceptionService.class.getName());

    @Autowired
    private ApplicationExceptionDao applicationExceptionDao;

    public void saveErrorDetails(String message, Exception cause, String errorCode){
        String requesterPersonId = null;
        String createUser = null;
        try {
            requesterPersonId = AuthenticatedUser.getLoginPersonId();
            createUser = AuthenticatedUser.getLoginUserName();
        } catch (Exception e) {
            logger.error("Exception in CustomExceptionService.saveErrorDetails AuthenticatedUser is null: {} ", e.getMessage());
        }
        try {
            ApplicationErrorDetails applicationError = new ApplicationErrorDetails();
            applicationError.setErrorMessage(message);
            applicationError.setDebugMessage(message);
            applicationError.setStackTrace(ExceptionUtils.getStackTrace(cause));
            applicationError.setErrorCode(errorCode);
            applicationError.setRequesterPersonId(requesterPersonId);
            applicationError.setCreateUser(createUser);
            applicationExceptionDao.saveErrorDetails(applicationError);
        } catch(Exception ex){
            logger.error("Exception in CustomExceptionService.saveErrorDetails: {} ", ex.getMessage());
        }
    }
}
