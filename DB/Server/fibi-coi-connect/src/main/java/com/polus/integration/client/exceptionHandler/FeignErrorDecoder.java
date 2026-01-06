package com.polus.integration.client.exceptionHandler;

import feign.Response;
import feign.codec.ErrorDecoder;

import java.io.IOException;

public class FeignErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default(); // Default error decoder to fallback on

    @Override
    public Exception decode(String methodKey, Response response) {
        try {
            if (response.status() >= 400 && response.status() < 600) {
                // Read the response body
                String body = readResponseBody(response);

                // Optionally, you can parse the body as an error object
                // CustomError error = new ObjectMapper().readValue(body, CustomError.class);

                // Throw CustomException with response body and status code
                return new FeignException("Error response from API", body, response.status());
            }
        } catch (IOException e) {
            // Handle IOException or any issue reading the response
            return new RuntimeException("Error decoding the response", e);
        }
        return defaultErrorDecoder.decode(methodKey, response);
    }

    private String readResponseBody(Response response) throws IOException {
        // Read the response body as a string
        return new String(response.body().asInputStream().readAllBytes());
    }
}
