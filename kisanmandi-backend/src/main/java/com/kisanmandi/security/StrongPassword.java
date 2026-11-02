package com.kisanmandi.security;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface StrongPassword {

    String message() default "PASSWORD_TOO_SHORT";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

