package com.polus.kcintegration.message.service;

public interface MessagingService {

	void sendMessage(String destination, String message, Object object);

}
