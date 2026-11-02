package com.kisanmandi.security;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Method;
import java.util.List;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, Object> {

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            // Null fields should be handled by @NotBlank or @NotNull
            return true;
        }

        if (value instanceof CharSequence charSeq) {
            String password = charSeq.toString();
            List<String> errors = PasswordPolicy.validate(password, null);
            if (errors.isEmpty()) {
                return true;
            }
            String code = errors.get(0);
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(code).addConstraintViolation();
            return false;
        }

        // If placed on a class (e.g. RegisterRequest)
        try {
            Method getPasswordMethod = value.getClass().getMethod("getPassword");
            Object pwdObj = getPasswordMethod.invoke(value);
            String password = pwdObj != null ? pwdObj.toString() : null;

            String email = null;
            try {
                Method getEmailMethod = value.getClass().getMethod("getEmail");
                Object emailObj = getEmailMethod.invoke(value);
                if (emailObj != null) {
                    email = emailObj.toString();
                }
            } catch (NoSuchMethodException ignored) {
            }

            if (password == null) {
                return true;
            }

            List<String> errors = PasswordPolicy.validate(password, email);
            if (errors.isEmpty()) {
                return true;
            }

            String code = errors.get(0);
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(code)
                    .addPropertyNode("password")
                    .addConstraintViolation();
            return false;
        } catch (Exception e) {
            return true;
        }
    }
}

