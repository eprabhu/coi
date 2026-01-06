package com.polus.fibicomp.quartzscheduler;

import java.time.Duration;
import java.time.LocalDateTime;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Service;

import com.polus.core.constants.CoreConstants;
import com.polus.core.quartzscheduler.utils.SchedulerUtils;
import com.polus.fibicomp.compliance.declaration.service.CoiDeclarationService;

import lombok.extern.slf4j.Slf4j;

@Service
@DisallowConcurrentExecution
@Slf4j
public class CoiDeclarationScheduler extends QuartzJobBean {

	@Autowired
	private SchedulerUtils schedulerUtils;

	@Autowired
	private CoiDeclarationService coiDeclarationService;

	@Override
	protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
		LocalDateTime startTime = LocalDateTime.now();
		String jobName = context.getJobDetail().getKey().getName();
		String schedulerName = CoiDeclarationScheduler.class.getName();
		boolean isScheduledJob = context.getNextFireTime() != null;

		log.info("===> [Expiration Check :: {}] Job STARTED at: {}", jobName, startTime);

		try {
			schedulerUtils.updateSchedulerInfo(schedulerName, CoreConstants.QUARTZ_JOB_RUNNING, isScheduledJob);
			schedulerUtils.logExecutionStart(jobName);

			log.info("===> [Expiration Check :: {}] Processing expiring declarations...", jobName);
			coiDeclarationService.processExpiringDeclarations();

			log.info("===> [Expiration Check :: {}] Processing completed successfully.", jobName);
			schedulerUtils.updateSchedulerInfo(schedulerName, CoreConstants.QUARTZ_JOB_SCHEDULED, isScheduledJob);

		} catch (Exception e) {
			log.error("===> [Expiration Check :: {}] Job FAILED due to exception: {}", jobName, e.getMessage(), e);
			schedulerUtils.handleSchedulerError(schedulerName, isScheduledJob, e);
		} finally {
			LocalDateTime endTime = LocalDateTime.now();
			Duration duration = Duration.between(startTime, endTime);
			long totalSeconds = duration.getSeconds();
			String formattedDuration = (totalSeconds >= 60)
					? String.format("%d minute(s) %d second(s)", totalSeconds / 60, totalSeconds % 60)
					: String.format("%d second(s)", totalSeconds);

			log.info("===> [Expiration Check :: {}] Job ENDED at: {}", jobName, endTime);
			log.info("===> [Expiration Check :: {}] Total execution time: {}", jobName, formattedDuration);

			schedulerUtils.logExecutionEnd(jobName);
		}
	}

}
