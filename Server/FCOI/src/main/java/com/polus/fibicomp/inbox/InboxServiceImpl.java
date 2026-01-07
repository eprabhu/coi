package com.polus.fibicomp.inbox;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.fibicomp.coi.dao.GeneralDao;
import com.polus.fibicomp.constants.Constants;

@Service
@Transactional
public class InboxServiceImpl implements InboxService {

	@Autowired
	private InboxDao inboxDao;

	@Autowired
	private GeneralDao generalDao;

	@Autowired
	private CommonDao commonDao;

	@Override
	public void addToInbox(Inbox inbox) {
		String alertType = generalDao.getAlertTypeByMessageCode(inbox.getMessageTypeCode());
		if (alertType != null) {
			Timestamp timestamp = commonDao.getCurrentTimestamp();
			inbox.setAlertType(alertType);
			inbox.setOpenedFlag(Constants.NO);
			inbox.setArrivalDate(timestamp);
			inbox.setUpdateTimeStamp(timestamp);
			inboxDao.saveBannerEntriesToActionList(inbox);
		} else {
			inboxDao.saveToInbox(inbox);
		}
	}

}
