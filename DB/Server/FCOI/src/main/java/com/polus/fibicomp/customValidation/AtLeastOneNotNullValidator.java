package com.polus.fibicomp.customValidation;

import org.apache.commons.beanutils.BeanUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class AtLeastOneNotNullValidator implements ConstraintValidator<AtLeastOneNotNull, Object> {

    private String[] fields;

    @Override
    public void initialize(AtLeastOneNotNull constraintAnnotation) {
        this.fields = constraintAnnotation.fields();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return false; // The entire object is null
        }

        try {
            for (String field : fields) {
                Object fieldValue = BeanUtils.getProperty(value, field);
                if (fieldValue != null) {
                    return true; // At least one field is not null
                }
            }
        } catch (Exception e) {
            System.out.println("Exception isValid : " + e.getMessage());
        }
        return false; // All fields are null
    }
}
