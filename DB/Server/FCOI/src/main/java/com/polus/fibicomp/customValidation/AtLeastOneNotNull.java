package com.polus.fibicomp.customValidation;


import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = AtLeastOneNotNullValidator.class)
@Target({ElementType.TYPE, ElementType.FIELD}) // Allow application at class and field level
@Retention(RetentionPolicy.RUNTIME)
public @interface AtLeastOneNotNull {
    String message() default "At least one of the specified fields must not be null";

    Class<?>[] groups() default {}; // Support for validation groups
    Class<? extends Payload>[] payload() default {};

    String[] fields(); // Fields to validate
}