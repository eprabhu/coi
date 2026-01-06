package com.polus.integration.entity.dunsRefresh.processes;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.dunsRefresh.dto.DnBUpdateWrapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.Collections;
import java.util.List;

@Log4j2
@Component
public class MonitoringFileReader {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static DnBOrganizationDetails extractAndBuildOrgDetails(DnBUpdateWrapper wrapper) {
        DnBOrganizationDetails dto = null;
        for (DnBUpdateWrapper.UpdateElement element : wrapper.getElements()) {
            String fieldPath = element.getElement(); // e.g., "organization.registeredAddress.streetName"
            String dtoFieldName = fieldPath.replace("organization.", "").split("\\.")[0]; // get base field name

            try {
                Field dtoField = DnBOrganizationDetails.class.getDeclaredField(dtoFieldName);
                dtoField.setAccessible(true);

                List<Object> currentList = normalizeToList(element.getCurrent());
                Object mappedValue = mapCurrentToFieldType(dtoField, currentList);
                if (dto == null) {
                    dto = new DnBOrganizationDetails();
                }
                dtoField.set(dto, mappedValue);

            } catch (NoSuchFieldException e) {
                log.warn("No such field: {}", dtoFieldName);
            } catch (Exception e) {
                log.warn("Error mapping field: {} → {}", dtoFieldName, e.getMessage());
            }
        }

        return dto;
    }

    private static List<Object> normalizeToList(Object value) {
        if (value == null) return Collections.emptyList();

        if (value instanceof List) {
            return (List<Object>) value;
        } else {
            return List.of(value); // wrap single value
        }
    }

    private static Object mapCurrentToFieldType(Field field, List<Object> currentList) {
        Class<?> fieldType = field.getType();

        // Handle Lists like List<Telephone>, List<IndustryCode>
        if (List.class.isAssignableFrom(fieldType)) {
            ParameterizedType genericType = (ParameterizedType) field.getGenericType();
            Class<?> itemType = (Class<?>) genericType.getActualTypeArguments()[0];

            // Convert current to List<itemType>
            return objectMapper.convertValue(currentList, objectMapper.getTypeFactory().constructCollectionType(List.class, itemType));
        }

        // Handle single object
        if (!currentList.isEmpty()) {
            return objectMapper.convertValue(currentList.get(0), fieldType);
        }

        return null;
    }
}
