package com.polus.fibicomp.quartzscheduler;

import com.polus.core.constants.CoreConstants;
import com.polus.core.quartzscheduler.utils.SchedulerUtils;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@DisallowConcurrentExecution
public class COIMonthlyScheduler extends QuartzJobBean {

	@Autowired
	private SchedulerUtils schedulerUtils;
	
	@Autowired
	private FcoiDisclosureService fcoiDisclosureService;

	@Override
	protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
	    String schedulerName = FcoiDisclosureService.class.getName();
	    Boolean isScheduledJob = context.getNextFireTime() != null ? Boolean.TRUE : Boolean.FALSE;
	    try {
	        schedulerUtils.updateSchedulerInfo(schedulerName, CoreConstants.QUARTZ_JOB_RUNNING, isScheduledJob);
	        schedulerUtils.logExecutionStart(context.getJobDetail().getKey().getName());
			fcoiDisclosureService.sendMonthlyExpiringSummary();
	        schedulerUtils.updateSchedulerInfo(schedulerName, CoreConstants.QUARTZ_JOB_SCHEDULED, isScheduledJob);
	    } catch (Exception e) {
	        schedulerUtils.handleSchedulerError(schedulerName, isScheduledJob, e);
	    } finally {
	        schedulerUtils.logExecutionEnd(context.getJobDetail().getKey().getName());
	    }
	}
}
