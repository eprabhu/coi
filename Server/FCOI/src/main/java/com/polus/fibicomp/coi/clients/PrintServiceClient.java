package com.polus.fibicomp.coi.clients;

import com.polus.fibicomp.coi.clients.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.polus.fibicomp.coi.clients.model.PrintRequestDto;

@FeignClient(name = "FIBI-PRINT-SERVICE", configuration = FeignConfig.class)
public interface PrintServiceClient {

	@PostMapping("/printService/print/generateDocument")
    byte[] generateDocument(@RequestBody PrintRequestDto request);

}
