package com.polus.integration.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.dto.ProposalRequest;
import com.polus.integration.pojo.FibiCOIConnectDummy;
import com.polus.integration.vo.COIActionLogVO;


@Transactional
@Service
public interface IntegrationService {


	/**
	 * @param request
	 * @return
	 */
	public FibiCOIConnectDummy saveOrUpdateRecievedProposalDetail(ProposalRequest request) ;

	/**
	 * @param COIActionLogVO
	 * @return
	 */
	public void logCOIAction(COIActionLogVO request);

}
