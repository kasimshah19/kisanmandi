package com.kisanmandi.exception;

// Thrown when a user tries to register with an email that already exists
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
