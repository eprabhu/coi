package com.polus.integration.person.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "FIBI_COI_PERSON")
public class FibiCoiPerson implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "LAST_NAME")
	private String lastName;

	@Column(name = "FIRST_NAME")
	private String firstName;

	@Column(name = "MIDDLE_NAME")
	private String middleName;

	@Column(name = "FULL_NAME")
	private String fullName;

	@Column(name = "PRIOR_NAME")
	private String priorName;

	@Column(name = "USER_NAME", unique = true)
	private String principalName;

	@Column(name = "EMAIL_ADDRESS")
	private String emailAddress;

	@Column(name = "DATE_OF_BIRTH")
	private Timestamp dateOfBirth;

	@Column(name = "AGE")
	private Integer age;

	@JsonProperty(access = Access.WRITE_ONLY)
	@Column(name = "AGE_BY_FISCAL_YEAR ")
	private Integer ageByFiscalYear;

	@Column(name = "EDUCATION_LEVEL")
	private String educationLevel;

	@Column(name = "OFFICE_LOCATION")
	private String officeLocation;

	@Column(name = "SECONDRY_OFFICE_LOCATION")
	private String secOfficeLocation;

	@Column(name = "SECONDRY_OFFICE_PHONE")
	private String secOfficePhone;

	@Column(name = "SCHOOL")
	private String school;

	@Column(name = "DIRECTORY_DEPARTMENT")
	private String directoryDepartment;

	@JsonProperty(access = Access.WRITE_ONLY)
	@Column(name = "SALUTATION")
	private String salutation;

	@Column(name = "COUNTRY_OF_CITIZENSHIP")
	private String countryOfCitizenshipCode;

	@Column(name = "PRIMARY_TITLE")
	private String primaryTitle;

	@Column(name = "DIRECTORY_TITLE")
	private String directoryTitle;

	@Column(name = "HOME_UNIT")
	private String homeUnit;

	@Column(name = "IS_FACULTY")
	private Character isFaculty;

	@Column(name = "IS_GRADUATE_STUDENT_STAFF")
	private Character isGraduateStudentStaff;

	@Column(name = "IS_RESEARCH_STAFF")
	private Character isResearchStaff;

	@Column(name = "IS_SERVICE_STAFF")
	private Character isServiceStaff;

	@Column(name = "IS_SUPPORT_STAFF")
	private Character isSupportStaff;

	@Column(name = "IS_OTHER_ACCADEMIC_GROUP")
	private Character isOtherAcadamic;

	@Column(name = "IS_MEDICAL_STAFF")
	private Character isMedicalStaff;

	@Column(name = "ADDRESS_LINE_1")
	private String addressLine1;

	@Column(name = "ADDRESS_LINE_2")
	private String addressLine2;

	@Column(name = "ADDRESS_LINE_3")
	private String addressLine3;

	@Column(name = "CITY")
	private String city;

	@Column(name = "COUNTY")
	private String country;

	@Column(name = "STATE")
	private String state;

	@Column(name = "POSTAL_CODE")
	private String postalCode;

	@Column(name = "COUNTRY_CODE")
	private String countryCode;

	@Column(name = "FAX_NUMBER")
	private String faxNumber;

	@Column(name = "PAGER_NUMBER")
	private String pagerNumber;

	@Column(name = "VISA_CODE")
	private String visaCode;

	@Column(name = "VISA_TYPE")
	private String visaType;

	@Column(name = "VISA_RENEWAL_DATE")
	private Timestamp visaRenewalDate;

	@Column(name = "MOBILE_PHONE_NUMBER")
	private String mobileNumber;

	@Column(name = "STATUS")
	private Character status;

	@Column(name = "SALARY_ANNIVERSARY_DATE")
	private Timestamp salaryAnniversary;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "OFFICE_PHONE")
	private String officePhone;

	@Column(name = "VALIDATION_STATUS")
	private String validationStatus = "PENDING";

	@Column(name = "VALIDATION_MESSEGE")
	private String validationMessage;

}
