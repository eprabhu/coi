package com.polus.fibicomp.quartzscheduler;

import java.util.List;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Service;

import com.polus.core.constants.CoreConstants;
import com.polus.core.quartzscheduler.utils.SchedulerUtils;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;
import com.polus.fibicomp.coi.hierarchy.dto.DisclosureDto;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;

@Service
@DisallowConcurrentExecution
public class COIScheduler extends QuartzJobBean {

	@Autowired
	private SchedulerUtils schedulerUtils;
	
	@Autowired
	private ConflictOfInterestService conflictOfInterestService;

	@Override
	protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
	    String schedulerName = FcoiDisclosureService.class.getName();
	    Boolean isScheduledJob = context.getNextFireTime() != null ? Boolean.TRUE : Boolean.FALSE;
	    try {
	        schedulerUtils.updateSchedulerInfo(schedulerName, CoreConstants.QUARTZ_JOB_RUNNING, isScheduledJob);
	        schedulerUtils.logExecutionStart(context.getJobDetail().getKey().getName());
			addExpiringDisclToInbox(schedulerName, isScheduledJob);
			checkAndMarkDisclosuresAsExpired(schedulerName, isScheduledJob);
	        schedulerUtils.updateSchedulerInfo(schedulerName, CoreConstants.QUARTZ_JOB_SCHEDULED, isScheduledJob);
	    } catch (Exception e) {
	        schedulerUtils.handleSchedulerError(schedulerName, isScheduledJob, e);
	    } finally {
	        schedulerUtils.logExecutionEnd(context.getJobDetail().getKey().getName());
	    }
	}

	private void checkAndMarkDisclosuresAsExpired(String schedulerName, Boolean isScheduledJob)
			throws JobExecutionException {
		try {
			List<DisclosureDto> expiredDisclosures = conflictOfInterestService.checkAndMarkDisclosuresAsExpired();
			conflictOfInterestService.addExpiringDisclosuresToInbox(expiredDisclosures, false);
			conflictOfInterestService.notifyUsers(expiredDisclosures, false);	
		} catch (Exception e) {
			schedulerUtils.handleSchedulerError(schedulerName, isScheduledJob, e);
		}
	}

	public void addExpiringDisclToInbox(String schedulerName, Boolean isScheduledJob)
			throws JobExecutionException {
		try {
			List<DisclosureDto> expiringDisclosures = conflictOfInterestService.getExpiringFcoiAndOpaDisclosures();
			conflictOfInterestService.addExpiringDisclosuresToInbox(expiringDisclosures, true);
			conflictOfInterestService.notifyUsers(expiringDisclosures, true);	
		} catch (Exception e) {
			schedulerUtils.handleSchedulerError(schedulerName, isScheduledJob, e);
		}
	}
}
