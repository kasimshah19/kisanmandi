package com.kisanmandi.exception;

public class MandiApiException extends RuntimeException {
    public MandiApiException(String message) {
        super(message);
    }

    public MandiApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
