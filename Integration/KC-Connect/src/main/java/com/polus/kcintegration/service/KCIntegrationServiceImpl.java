package com.polus.kcintegration.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
public class KCIntegrationServiceImpl implements KCIntegrationService {

	protected static Logger logger = LogManager.getLogger(KCIntegrationServiceImpl.class.getName());

}
