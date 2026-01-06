package com.polus.kcintegration.service;

import java.io.UnsupportedEncodingException;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.constant.Constant;

@Transactional
@Service(value = "commonService")
public class CommonServiceImpl implements CommonService {

	protected static Logger logger = LogManager.getLogger(CommonServiceImpl.class.getName());

	@Override
	public String hash(Object valueToHide) throws GeneralSecurityException {
		if (valueToHide != null && !StringUtils.isEmpty(valueToHide.toString())) {
			try {
				MessageDigest md = MessageDigest.getInstance(Constant.HASH_ALGORITHM);
				return new String(Base64.encodeBase64(md.digest(valueToHide.toString().getBytes(Constant.CHARSET))),
						Constant.CHARSET);
			} catch (UnsupportedEncodingException arg2) {
				return "";
			}
		} else {
			return "";
		}
	}

}
