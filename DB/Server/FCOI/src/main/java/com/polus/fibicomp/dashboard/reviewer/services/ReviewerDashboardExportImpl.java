package com.polus.fibicomp.dashboard.reviewer.services;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.fibicomp.coi.dto.CoiTravelDashboardDto;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.dashboard.reviewer.dao.ReviewerDashboardDao;
import com.polus.fibicomp.dashboard.reviewer.dto.FCOIDisclosureDto;
import com.polus.fibicomp.opa.dto.OPADashboardDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Log4j2
@Transactional
@AllArgsConstructor
public class ReviewerDashboardExportImpl implements ReviewerDashboardExport {

    private final ReviewerDashboardDao reviewerDashboardDao;
    private final CommonDao commonDao;

    private static final String IS_COUNT_NEEDED = "IS_COUNT";
    private static final String FETCH_TYPE = "FETCH_TYPE";
    private static final String IS_UNLIMITED = "IS_UNLIMITED";
    private static final String TITLE_FCOI_DISCLOSURE_EXPORT = "FCOI Disclosures";
    private static final String TITLE_OPA_DISCLOSURE_EXPORT = "OPA Disclosures";
    private static final String TITLE_TRAVEL_DISCLOSURE_EXPORT = "Travel Disclosures";
    private static final String TAB_TITLE = "TAB_TITLE";


    @Override
    public ResponseEntity<byte[]> exportReviewerDashboardDetails(DashboardRequest dashboardRequest) {
        ResponseEntity<byte[]> attachmentData = null;
        XSSFWorkbook workbook = new XSSFWorkbook();
        try {
            XSSFSheet sheet = null;
            XSSFCellStyle tableBodyStyle = workbook.createCellStyle();
            dashboardRequest.getDashboardData().put(IS_COUNT_NEEDED, false);
            dashboardRequest.getDashboardData().put(FETCH_TYPE, "DATA");
            dashboardRequest.getDashboardData().put(IS_UNLIMITED, true);
            DashboardResponseDto dashboardData = reviewerDashboardDao.fetchReviewerDashboardDetails(dashboardRequest);
            String heading = "";
            String tabTitle = dashboardRequest.getDashboardData().get(TAB_TITLE) != null ?
                    " : " + dashboardRequest.getDashboardData().get(TAB_TITLE).toString() : "";
            if (dashboardRequest.getModuleCode().equals(com.polus.fibicomp.constants.Constants.COI_MODULE_CODE)) {
                heading = TITLE_FCOI_DISCLOSURE_EXPORT + tabTitle;
                sheet = workbook.createSheet(TITLE_FCOI_DISCLOSURE_EXPORT);
                Object[] tableHeadingRow = { "Reporter Name", "Department", "Disclosure type", "Certification Date", "Expiration", "Disclosure Status", "Review Status",
                    "Approval Status", "Administrator", "Admin Group", "Reviewers", "Last Updated By", "Last Updated On"};
                prepareFCOIDisclosure(tableHeadingRow, sheet, tableBodyStyle, (List<FCOIDisclosureDto>)dashboardData.getDashboardData(), workbook, heading);
            } else if (dashboardRequest.getModuleCode().equals(Constants.OPA_MODULE_CODE)) {
                heading = TITLE_OPA_DISCLOSURE_EXPORT + tabTitle;
                sheet = workbook.createSheet(TITLE_OPA_DISCLOSURE_EXPORT);
                Object[] tableHeadingRow = { "Reporter Name", "Department", "Disclosure type", "Certification Date", "Expiration",  "Review Status",
                        "Approval Status","Administrator", "Admin Group", "Reviewers", "Last Updated By", "Last Updated On"};
                prepareOPADisclosure(tableHeadingRow, sheet, tableBodyStyle, (List<OPADashboardDto>)dashboardData.getDashboardData(), workbook, heading);
            } else if (dashboardRequest.getModuleCode().equals(Constants.TRAVEL_MODULE_CODE)) {
                heading = TITLE_TRAVEL_DISCLOSURE_EXPORT + tabTitle;
                sheet = workbook.createSheet(TITLE_TRAVEL_DISCLOSURE_EXPORT);
                Object[] tableHeadingRow = {"Reporter Name", "Department", "Certification Date", "Review Status",
                        "Disclosure Status", "Trip Title", "Purpose", "Travel Date", "Country", "Reimbursed Cost", "Last Updated By", "Last Updated On"};
                prepareTravelDisclosure(tableHeadingRow, sheet, tableBodyStyle, (List<CoiTravelDashboardDto>)dashboardData.getDashboardData(), workbook, heading);
            }
            attachmentData = getResponseEntityForDownload(heading,"xlsx", workbook);
        } catch (Exception e) {
            log.error("Error in method exportReviewerDashboardDetails", e);
        } finally {
            try {
                workbook.close();
            } catch (Exception e) {
                log.error("Error occured exportReviewerDashboardDetails");
            }
        }
        return attachmentData;
    }


    public ResponseEntity<byte[]> getResponseEntityForDownload(String documentHeading, String exportType, XSSFWorkbook workbook) throws Exception {
        log.info("--------- getResponseEntityForExcelOrPDFDownload ---------");
        byte[] byteArray = null;
        log.info("exportType : {}", exportType);
        log.info("documentHeading : {}", documentHeading);
        if (exportType.equals("pdf")) {
//            byteArray = generatePDFFileByteArray(documentHeading, workbook);
        } else {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            byteArray = bos.toByteArray();
        }
        return getResponseEntity(byteArray);
    }

    private ResponseEntity<byte[]> getResponseEntity(byte[] bytes) {
        ResponseEntity<byte[]> attachmentData = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/octet-stream"));
            headers.setContentLength(bytes.length);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            headers.setPragma("public");
            attachmentData = new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error in method getResponseEntity", e);
        }
        return attachmentData;
    }

    private void prepareTravelDisclosure(Object[] tableHeadingRow, XSSFSheet sheet,
                                         XSSFCellStyle tableBodyStyle, List<CoiTravelDashboardDto> dashboardData, XSSFWorkbook workbook, String documentHeading) {
        int rowNumber = 0;
        prepareHeading(tableHeadingRow, workbook, sheet, documentHeading);
        rowNumber++;
        prepareExcelSheetHeader(sheet, tableHeadingRow, workbook, tableBodyStyle, rowNumber++);
        for (CoiTravelDashboardDto data : dashboardData) {
            Row row = sheet.createRow(rowNumber++);
            int cellNumber = 0;
            Cell reporternameCell = assignCell(cellNumber, tableBodyStyle, row);
            reporternameCell.setCellValue(data.getTravellerName());
            cellNumber++;

            Cell departmentCell = assignCell(cellNumber, tableBodyStyle, row);
            departmentCell.setCellValue(data.getUnitDetails().getDisplayName());
            cellNumber++;

            Cell submissionDateCell = assignCell(cellNumber, tableBodyStyle, row);
            submissionDateCell.setCellValue( data.getCertifiedAt() != null ?
                    commonDao.getDateFormat(data.getCertifiedAt(), CoreConstants.DEFAULT_DATE_FORMAT) : "");
            cellNumber++;

            Cell reviewStatusCell = assignCell(cellNumber, tableBodyStyle, row);
            reviewStatusCell.setCellValue(data.getReviewDescription());
            cellNumber++;

            Cell dispositionStatusCell = assignCell(cellNumber, tableBodyStyle, row);
            dispositionStatusCell.setCellValue(data.getDocumentStatusDescription());
            cellNumber++;

            Cell  tripTitleCell= assignCell(cellNumber, tableBodyStyle, row);
            tripTitleCell.setCellValue(data.getTripTitle());
            cellNumber++;

            Cell  tripPurposeCell= assignCell(cellNumber, tableBodyStyle, row);
            tripPurposeCell.setCellValue(data.getTravelPurpose() != null ? data.getTravelPurpose() : "");
            cellNumber++;

            Cell  travelDateCell= assignCell(cellNumber, tableBodyStyle, row);
            travelDateCell.setCellValue(data.getTravelStartDate() != null ?
                    commonDao.getDateFormat(data.getTravelStartDate(), CoreConstants.DEFAULT_DATE_FORMAT) + " - " +
                            commonDao.getDateFormat(data.getTravelEndDate(), CoreConstants.DEFAULT_DATE_FORMAT): "");
            cellNumber++;

            Cell  travelCountryCell= assignCell(cellNumber, tableBodyStyle, row);
            travelCountryCell.setCellValue(data.getTravelCountry() != null ? data.getTravelCountry() : "");
            cellNumber++;

            Cell  reimbursedCostCell= assignCell(cellNumber, tableBodyStyle, row);
            reimbursedCostCell.setCellValue(data.getTravelAmount() != null ? CoreConstants.DOLLAR_SYMBOL + data.getTravelAmount() : "");
            cellNumber++;

            Cell lastUpdatedByCell = assignCell(cellNumber, tableBodyStyle, row);
            lastUpdatedByCell.setCellValue(data.getUpdateUser());
            cellNumber++;

            Cell lastUpdatedOnCell = assignCell(cellNumber, tableBodyStyle, row);
            lastUpdatedOnCell.setCellValue(data.getUpdateTimestamp() != null ?
                    commonDao.getDateFormat(data.getUpdateTimestamp(), CoreConstants.DEFAULT_DATE_FORMAT + " " + CoreConstants.TIME_FORMAT) : "");

        }
        autoSizeColumns(workbook);
    }

    private void prepareOPADisclosure(Object[] tableHeadingRow, XSSFSheet sheet,
                                       XSSFCellStyle tableBodyStyle, List<OPADashboardDto> dashboardData, XSSFWorkbook workbook, String documentHeading) {
        int rowNumber = 0;
        prepareHeading(tableHeadingRow, workbook, sheet, documentHeading);
        rowNumber++;
        prepareExcelSheetHeader(sheet, tableHeadingRow, workbook, tableBodyStyle, rowNumber++);
        for (OPADashboardDto data : dashboardData) {
            Row row = sheet.createRow(rowNumber++);
            int cellNumber = 0;
            Cell reporternameCell = assignCell(cellNumber, tableBodyStyle, row);
            reporternameCell.setCellValue(data.getPersonName());
            cellNumber++;

            Cell unitCell = assignCell(cellNumber, tableBodyStyle, row);
            unitCell.setCellValue(data.getUnitDisplayName());
            cellNumber++;

            Cell fcoiTypeCell = assignCell(cellNumber, tableBodyStyle, row);
            fcoiTypeCell.setCellValue(data.getVersionNumber() ==1 ? "Initial" : "Revision");
            cellNumber++;

            Cell submissionDateCell = assignCell(cellNumber, tableBodyStyle, row);
            submissionDateCell.setCellValue( data.getSubmissionTimestamp() != null ?
                    commonDao.getDateFormat(data.getSubmissionTimestamp(), CoreConstants.DEFAULT_DATE_FORMAT) : "");
            cellNumber++;

            Cell expirationCell = assignCell(cellNumber, tableBodyStyle, row);
            expirationCell.setCellValue(data.getExpirationDate() != null ?
                    commonDao.getDateFormat(data.getExpirationDate(), CoreConstants.DEFAULT_DATE_FORMAT) : "");
            cellNumber++;

            Cell reviewStatusCell = assignCell(cellNumber, tableBodyStyle, row);
            reviewStatusCell.setCellValue(data.getReviewStatus());
            cellNumber++;

            Cell dispositionStatusCell = assignCell(cellNumber, tableBodyStyle, row);
            dispositionStatusCell.setCellValue(data.getDispositionStatus());
            cellNumber++;

            Cell administratorCell = assignCell(cellNumber, tableBodyStyle, row);
            administratorCell.setCellValue(data.getAdminPersonName() != null ? data.getAdminPersonName() : "");
            cellNumber++;

            Cell adminGroupCell = assignCell(cellNumber, tableBodyStyle, row);
            adminGroupCell.setCellValue(data.getAdminGroupName() != null ? data.getAdminGroupName() : "");
            cellNumber++;

            String combinedReviewersList = "";
            if (data.getReviewers() != null && !data.getReviewers().isEmpty()) {
                AtomicInteger index = new AtomicInteger(1);
                combinedReviewersList = data.getReviewers().stream()
                        .map(list -> index.getAndIncrement() + ") " +
                                list.get(0) + " | " +   // Department
                                list.get(1) + " | " +   // Name
                                list.get(2) + " ")             // Status
                        .reduce((a, b) -> a + "\n" + b)
                        .orElse("");
            }

            Cell reviewersCell = assignCell(cellNumber, tableBodyStyle, row);
            reviewersCell.setCellValue(combinedReviewersList);
            cellNumber++;

            Cell lastUpdatedByCell = assignCell(cellNumber, tableBodyStyle, row);
            lastUpdatedByCell.setCellValue(data.getUpdateUserFullName());
            cellNumber++;

            Cell lastUpdatedOnCell = assignCell(cellNumber, tableBodyStyle, row);
            lastUpdatedOnCell.setCellValue(data.getUpdateTimeStamp() != null ?
                    commonDao.getDateFormat(data.getUpdateTimeStamp(), CoreConstants.DEFAULT_DATE_FORMAT + " " + CoreConstants.TIME_FORMAT) : "");

        }
        autoSizeColumns(workbook);
    }


    private void prepareFCOIDisclosure(Object[] tableHeadingRow, XSSFSheet sheet,
                                                   XSSFCellStyle tableBodyStyle, List<FCOIDisclosureDto> dashboardData, XSSFWorkbook workbook, String documentHeading) {
        int rowNumber = 0;
        prepareHeading(tableHeadingRow, workbook, sheet, documentHeading);
        rowNumber++;
        prepareExcelSheetHeader(sheet, tableHeadingRow, workbook, tableBodyStyle, rowNumber++);
        for (FCOIDisclosureDto data : dashboardData) {
            Row row = sheet.createRow(rowNumber++);
            int cellNumber = 0;
            Cell reporternameCell = assignCell(cellNumber, tableBodyStyle, row);
            reporternameCell.setCellValue(data.getDisclosurePersonFullName());
            cellNumber++;

            Cell unitCell = assignCell(cellNumber, tableBodyStyle, row);
            unitCell.setCellValue(data.getUnit().getUnitDetail());
            cellNumber++;

            Cell fcoiTypeCell = assignCell(cellNumber, tableBodyStyle, row);
            fcoiTypeCell.setCellValue(data.getFcoiType());
            cellNumber++;

            Cell submissionDateCell = assignCell(cellNumber, tableBodyStyle, row);
            submissionDateCell.setCellValue( data.getCertifiedAt() != null ?
                    commonDao.getDateFormat(data.getCertifiedAt(), CoreConstants.DEFAULT_DATE_FORMAT) : "");
            cellNumber++;

            Cell expirationCell = assignCell(cellNumber, tableBodyStyle, row);
            expirationCell.setCellValue(data.getExpirationDate() != null ?
                    commonDao.getDateFormat(data.getExpirationDate(), CoreConstants.DEFAULT_DATE_FORMAT) : "");
            cellNumber++;

            Cell disclosureStatusCell = assignCell(cellNumber, tableBodyStyle, row);
            disclosureStatusCell.setCellValue(data.getConflictStatus());
            cellNumber++;

            Cell reviewStatusCell = assignCell(cellNumber, tableBodyStyle, row);
            reviewStatusCell.setCellValue(data.getReviewStatus());
            cellNumber++;

            Cell dispositionStatusCell = assignCell(cellNumber, tableBodyStyle, row);
            dispositionStatusCell.setCellValue(data.getDispositionStatus());
            cellNumber++;

            Cell administratorCell = assignCell(cellNumber, tableBodyStyle, row);
            administratorCell.setCellValue(data.getAdministrator() != null ? data.getAdministrator() : "");
            cellNumber++;

            Cell adminGroupCell = assignCell(cellNumber, tableBodyStyle, row);
            adminGroupCell.setCellValue(data.getAdminGroupName() != null ? data.getAdminGroupName() : "");
            cellNumber++;

            String combinedReviewersList = "";
            if (data.getReviewerList() != null && !data.getReviewerList().isEmpty()) {
                AtomicInteger index = new AtomicInteger(1);
                combinedReviewersList = data.getReviewerList().stream()
                        .map(list -> index.getAndIncrement() + ") " +
                                list.get(0) + " | " +   // Department
                                list.get(1) + " | " +   // Name
                                list.get(2) + " ")             // Status
                        .reduce((a, b) -> a + "\n" + b)
                        .orElse("");
            }

            Cell reviewersCell = assignCell(cellNumber, tableBodyStyle, row);
            reviewersCell.setCellValue(combinedReviewersList);
            cellNumber++;

            Cell lastUpdatedByCell = assignCell(cellNumber, tableBodyStyle, row);
            lastUpdatedByCell.setCellValue(data.getUpdateUser());
            cellNumber++;

            Cell lastUpdatedOnCell = assignCell(cellNumber, tableBodyStyle, row);
            lastUpdatedOnCell.setCellValue(data.getUpdateTimeStamp() != null ?
                    commonDao.getDateFormat(data.getUpdateTimeStamp(), CoreConstants.DEFAULT_DATE_FORMAT + " " + CoreConstants.TIME_FORMAT) : "");

        }
        autoSizeColumns(workbook);
    }

    private XSSFWorkbook prepareHeading(Object[] tableHeadingRow, XSSFWorkbook workbook, XSSFSheet sheet, String documentHeading) {
        Row headerRow = sheet.createRow(0);
        Cell headingCell = headerRow.createCell(0);
        headingCell.setCellValue(documentHeading);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, tableHeadingRow.length - 1));
        XSSFFont headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 15);
        XSSFCellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setFont(headerFont);
        headingCell.setCellStyle(headerStyle);
        return workbook;
    }

    private Cell assignCell(int cellNumber, XSSFCellStyle tableBodyStyle, Row row) {
        Cell cell = row.createCell(cellNumber);
        cell.setCellStyle(tableBodyStyle);
        return cell;
    }

    private void autoSizeColumns(XSSFWorkbook workbook) {
        int numberOfSheets = workbook.getNumberOfSheets();
        for (int i = 0; i < numberOfSheets; i++) {
            XSSFSheet sheet = workbook.getSheetAt(i);
            if (sheet.getPhysicalNumberOfRows() > 0) {
                Row row = sheet.getRow(1);
                if (row != null) {
                    Iterator<Cell> cellIterator = row.cellIterator();
                    while (cellIterator.hasNext()) {
                        Cell cell = cellIterator.next();
                        int columnIndex = cell.getColumnIndex();
                        sheet.autoSizeColumn(columnIndex);
                    }
                }
            }
        }
    }


    private XSSFWorkbook prepareExcelSheetHeader(XSSFSheet sheet, Object[] tableHeadingRow, XSSFWorkbook workbook, XSSFCellStyle tableBodyStyle, int rowNumber) {
        int headingCellNumber = 0;
        Row tableHeadRow = sheet.createRow(rowNumber);
        XSSFCellStyle tableHeadStyle = workbook.createCellStyle();
        tableHeadStyle.setBorderTop(BorderStyle.HAIR);
        tableHeadStyle.setBorderBottom(BorderStyle.HAIR);
        tableHeadStyle.setBorderLeft(BorderStyle.HAIR);
        tableHeadStyle.setBorderRight(BorderStyle.HAIR);
        XSSFFont tableHeadFont = workbook.createFont();
        tableHeadFont.setBold(true);
        tableHeadFont.setFontHeightInPoints((short) 12);
        tableHeadStyle.setFont(tableHeadFont);
        // Table body style and font creation code.
        tableBodyStyle.setBorderTop(BorderStyle.HAIR);
        tableBodyStyle.setBorderBottom(BorderStyle.HAIR);
        tableBodyStyle.setBorderLeft(BorderStyle.HAIR);
        tableBodyStyle.setBorderRight(BorderStyle.HAIR);
        XSSFFont tableBodyFont = workbook.createFont();
        tableBodyFont.setFontHeightInPoints((short) 12);
        tableBodyStyle.setFont(tableBodyFont);
        // Set table head data to each column.
        for (Object heading : tableHeadingRow) {
            Cell cell = tableHeadRow.createCell(headingCellNumber++);
            cell.setCellValue((String) heading);
            cell.setCellStyle(tableHeadStyle);
        }
        return workbook;
    }
}
