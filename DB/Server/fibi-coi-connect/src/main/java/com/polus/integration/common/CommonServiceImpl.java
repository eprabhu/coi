package com.polus.integration.common;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CommonServiceImpl implements CommonService {

	@Override
	public String getDateFormat(Date date, String dateFormat) {
		String changeDate = "";
		try {
			DateFormat df = new SimpleDateFormat(dateFormat);
			changeDate = df.format(date);
		} catch (Exception e) {
			log.error("Error occured in getDateFormat : {}", e.getMessage());
		}
		return changeDate;
	}
}
