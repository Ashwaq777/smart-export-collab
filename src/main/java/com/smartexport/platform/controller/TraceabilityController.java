package com.smartexport.platform.controller;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartexport.platform.DTO.TraceabilityDTO;
import com.smartexport.platform.entity.ProductIdentification;
import com.smartexport.platform.entity.ProductionInfo;
import com.smartexport.platform.entity.ShippingEvent;
import com.smartexport.platform.entity.TraceabilityRecord;
import com.smartexport.platform.repository.ProductIdentificationRepository;
import com.smartexport.platform.repository.ProductionInfoRepository;
import com.smartexport.platform.repository.ShippingEventRepository;
import com.smartexport.platform.repository.TraceabilityRecordRepository;
import com.smartexport.platform.service.TraceabilityService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/traceability")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TraceabilityController {

    private final TraceabilityService service;
    
private final TraceabilityRecordRepository recordRepo;
private final ProductIdentificationRepository productRepo;
private final ProductionInfoRepository productionRepo;
private final ShippingEventRepository shippingRepo;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TraceabilityDTO dto) {
        return ResponseEntity.ok(service.createRecord(dto));
    }

    @GetMapping
    public ResponseEntity<List<?>> getAllRecords() {
        try {
            return ResponseEntity.ok(service.getAllRecords());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecord(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getRecord(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/export/excel")
public ResponseEntity<byte[]> exportExcel() throws Exception {

    List<TraceabilityRecord> records = recordRepo.findAll();

    Workbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Traceability Records");

    String[] headers = {
            "TLC",
            "Status",
            "Created At",
            "GTIN",
            "Description",
            "Quantity",
            "Unit",
            "Country",
            "Production Site",
            "Harvest Date",
            "Shipper",
            "Shipping Date"
    };

    // Header
    Row headerRow = sheet.createRow(0);
    for (int i = 0; i < headers.length; i++) {
        headerRow.createCell(i).setCellValue(headers[i]);
    }

    int rowNum = 1;

    for (TraceabilityRecord record : records) {

        ProductIdentification product = productRepo.findByRecord(record);
        ProductionInfo production = productionRepo.findByRecord(record);
        ShippingEvent shipping = shippingRepo.findFirstByRecord(record);

        Row row = sheet.createRow(rowNum++);

        row.createCell(0).setCellValue(record.getTraceabilityLotCode());
        row.createCell(1).setCellValue(record.getStatus());
        row.createCell(2).setCellValue(record.getCreatedAt() != null ?
                record.getCreatedAt().toString() : "");

        row.createCell(3).setCellValue(product != null ? product.getGtin() : "");
        row.createCell(4).setCellValue(product != null ? product.getDescription() : "");
        row.createCell(5).setCellValue(product != null && product.getQuantity()!=null ?
                product.getQuantity() : 0);
        row.createCell(6).setCellValue(product != null ? product.getUnit() : "");

        row.createCell(7).setCellValue(production != null ?
                production.getCountryOfOrigin() : "");
        row.createCell(8).setCellValue(production != null ?
                production.getProductionSiteName() : "");
        row.createCell(9).setCellValue(production != null && production.getHarvestDate()!=null ?
                production.getHarvestDate().toString() : "");

        row.createCell(10).setCellValue(shipping != null ?
                shipping.getShipperName() : "");
        row.createCell(11).setCellValue(shipping != null && shipping.getShippingDateTime()!=null ?
                shipping.getShippingDateTime().toString() : "");
    }

    // Auto size columns
    for (int i = 0; i < headers.length; i++) {
        sheet.autoSizeColumn(i);
    }

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    workbook.write(outputStream);
    workbook.close();

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=traceability.xlsx")
            .contentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(outputStream.toByteArray());
}
}
