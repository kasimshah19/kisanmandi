package com.kisanmandi.exception;

public class SyncAlreadyRunningException extends RuntimeException {
    public SyncAlreadyRunningException(String message) {
        super(message);
    }
}
