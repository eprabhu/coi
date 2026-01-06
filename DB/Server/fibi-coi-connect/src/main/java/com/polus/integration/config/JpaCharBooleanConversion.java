package com.polus.integration.config;

import jakarta.persistence.AttributeConverter;

public class JpaCharBooleanConversion implements AttributeConverter<Boolean, String> {

    public JpaCharBooleanConversion() {
    }

    public String convertToDatabaseColumn(Boolean b) {
        if (b == null) {
            return null;
        } else {
            return b ? "Y" : "N";
        }
    }

    public Boolean convertToEntityAttribute(String s) {
        if (s == null) {
            return null;
        } else {
            return !s.equals("Y") && !s.equals("y") ? Boolean.FALSE : Boolean.TRUE;
        }
    }
}
