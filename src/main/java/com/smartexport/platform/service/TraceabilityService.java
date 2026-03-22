package com.smartexport.platform.service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.zip.GZIPOutputStream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartexport.platform.dto.TraceabilityDTO;
import com.smartexport.platform.entity.TraceabilityHistory;
import com.smartexport.platform.entity.TraceabilityRecord;
import com.smartexport.platform.repository.TraceabilityHistoryRepository;
import com.smartexport.platform.repository.TraceabilityRecordRepository;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TraceabilityService {

    private final TraceabilityRecordRepository recordRepository;
    private final TraceabilityHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public TraceabilityService(TraceabilityRecordRepository recordRepository,
                              TraceabilityHistoryRepository historyRepository,
                              ObjectMapper objectMapper) {
        this.recordRepository = recordRepository;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
    }

    private void saveHistory(TraceabilityRecord record, String modifiedBy, String description) {
        try {
            TraceabilityHistory history = new TraceabilityHistory();
            history.setRecordId(record.getId());
            history.setSnapshotJson(objectMapper.writeValueAsString(record));
            history.setModifiedBy(modifiedBy);
            history.setModifiedAt(LocalDateTime.now());
            history.setChangeDescription(description);
            history.setVersion(record.getVersion());
            historyRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to save history: {}", e.getMessage());
        }
    }

    public TraceabilityRecord createRecord(TraceabilityDTO dto, String userEmail) {
        TraceabilityRecord record = new TraceabilityRecord();
        
        // Section B - Identification du Produit
        record.setTraceabilityLotCode(dto.getTraceabilityLotCode());
        record.setDescriptionProduit(dto.getDescriptionProduit());
        record.setGtin(dto.getGtin());
        record.setLotCommercial(dto.getLotCommercial());
        record.setLotSanitaire(dto.getLotSanitaire());
        record.setQuantite(dto.getQuantite());
        record.setUniteMesure(dto.getUniteMesure());
        
        // Section C - Origine & Production
        record.setProducteur(dto.getProducteur());
        record.setParcelle(dto.getParcelle());
        record.setDateRecolte(dto.getDateRecolte());
        record.setTraitements(dto.getTraitements());
        record.setDestination(dto.getDestination());
        record.setLot(dto.getLot());
        record.setPaysOrigine(dto.getPaysOrigine());
        record.setSiteProductionNom(dto.getSiteProductionNom());
        record.setSiteProductionAdresse(dto.getSiteProductionAdresse());
        record.setNumeroAgrementSanitaire(dto.getNumeroAgrementSanitaire());
        record.setDateProduction(dto.getDateProduction());
        
        // Section D - Expédition
        record.setNomExpediteur(dto.getNomExpediteur());
        record.setAdresseExpediteur(dto.getAdresseExpediteur());
        record.setGlnExpediteur(dto.getGlnExpediteur());
        record.setDateExpedition(dto.getDateExpedition());
        record.setMoyenTransport(dto.getMoyenTransport());
        record.setTemperatureTransport(dto.getTemperatureTransport());
        
        // Section E - Réception
        record.setNomDestinataire(dto.getNomDestinataire());
        record.setAdresseDestinataire(dto.getAdresseDestinataire());
        record.setGlnDestinataire(dto.getGlnDestinataire());
        record.setDateReception(dto.getDateReception());
        
        // Section F - UE
        record.setOperateurUe(dto.getOperateurUe());
        record.setAdresseOperateurUe(dto.getAdresseOperateurUe());
        record.setNumeroEori(dto.getNumeroEori());
        
        // Section G - Documents
        record.setTypeDocument(dto.getTypeDocument());
        record.setNumeroDocument(dto.getNumeroDocument());
        record.setCertificatSanitaire(dto.getCertificatSanitaire());
        
        // Additional fields
        record.setGlnCreateurTlc(dto.getGlnCreateurTlc());
        record.setSystemeSource(dto.getSystemeSource());
        record.setValidationConfirmed(dto.getValidationConfirmed());
        record.setStatut(dto.getStatut() != null ? dto.getStatut() : "BROUILLON");
        record.setCreatedBy(userEmail);
        
        TraceabilityRecord saved = recordRepository.save(record);
        saveHistory(saved, userEmail, "Création initiale");
        return saved;
    }

    public TraceabilityRecord updateRecord(Long id, TraceabilityDTO dto, String userEmail) {
        TraceabilityRecord record = recordRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Record not found"));
        
        saveHistory(record, userEmail, "Modification v" + record.getVersion());
        
        // Section B - Identification du Produit
        record.setTraceabilityLotCode(dto.getTraceabilityLotCode());
        record.setDescriptionProduit(dto.getDescriptionProduit());
        record.setGtin(dto.getGtin());
        record.setLotCommercial(dto.getLotCommercial());
        record.setLotSanitaire(dto.getLotSanitaire());
        record.setQuantite(dto.getQuantite());
        record.setUniteMesure(dto.getUniteMesure());
        
        // Section C - Origine & Production
        record.setProducteur(dto.getProducteur());
        record.setParcelle(dto.getParcelle());
        record.setDateRecolte(dto.getDateRecolte());
        record.setTraitements(dto.getTraitements());
        record.setDestination(dto.getDestination());
        record.setLot(dto.getLot());
        record.setPaysOrigine(dto.getPaysOrigine());
        record.setSiteProductionNom(dto.getSiteProductionNom());
        record.setSiteProductionAdresse(dto.getSiteProductionAdresse());
        record.setNumeroAgrementSanitaire(dto.getNumeroAgrementSanitaire());
        record.setDateProduction(dto.getDateProduction());
        
        // Section D - Expédition
        record.setNomExpediteur(dto.getNomExpediteur());
        record.setAdresseExpediteur(dto.getAdresseExpediteur());
        record.setGlnExpediteur(dto.getGlnExpediteur());
        record.setDateExpedition(dto.getDateExpedition());
        record.setMoyenTransport(dto.getMoyenTransport());
        record.setTemperatureTransport(dto.getTemperatureTransport());
        
        // Section E - Réception
        record.setNomDestinataire(dto.getNomDestinataire());
        record.setAdresseDestinataire(dto.getAdresseDestinataire());
        record.setGlnDestinataire(dto.getGlnDestinataire());
        record.setDateReception(dto.getDateReception());
        
        // Section F - UE
        record.setOperateurUe(dto.getOperateurUe());
        record.setAdresseOperateurUe(dto.getAdresseOperateurUe());
        record.setNumeroEori(dto.getNumeroEori());
        
        // Section G - Documents
        record.setTypeDocument(dto.getTypeDocument());
        record.setNumeroDocument(dto.getNumeroDocument());
        record.setCertificatSanitaire(dto.getCertificatSanitaire());
        
        // Additional fields
        record.setGlnCreateurTlc(dto.getGlnCreateurTlc());
        record.setSystemeSource(dto.getSystemeSource());
        record.setValidationConfirmed(dto.getValidationConfirmed());
        record.setStatut(dto.getStatut());
        
        return recordRepository.save(record);
    }

    public void softDelete(Long id) {
        TraceabilityRecord record = recordRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Not found"));
        record.setStatut("ARCHIVÉ");
        recordRepository.save(record);
    }

    public Page<TraceabilityRecord> getAll(String producteur, String lot, 
        String dateDebut, String dateFin, int page, int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Specification<TraceabilityRecord> spec = (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();
            
            if (producteur != null && !producteur.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, 
                    criteriaBuilder.like(root.get("producteur"), "%" + producteur + "%"));
            }
            
            if (lot != null && !lot.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, 
                    criteriaBuilder.like(root.get("lot"), "%" + lot + "%"));
            }
            
            if (dateDebut != null && !dateDebut.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, 
                    criteriaBuilder.greaterThanOrEqualTo(root.get("dateRecolte"), dateDebut));
            }
            
            if (dateFin != null && !dateFin.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, 
                    criteriaBuilder.lessThanOrEqualTo(root.get("dateRecolte"), dateFin));
            }
            
            return predicate;
        };
        
        return recordRepository.findAll(spec, pageable);
    }

    public List<TraceabilityHistory> getHistory(Long recordId) {
        return historyRepository.findByRecordIdOrderByVersionDesc(recordId);
    }

    public byte[] exportToExcel(String producteur, String lot, 
        String dateDebut, String dateFin) throws Exception {
        
        Pageable pageable = PageRequest.of(0, 10000);
        Page<TraceabilityRecord> recordsPage = getAll(producteur, lot, dateDebut, dateFin, 0, 10000);
        List<TraceabilityRecord> records = recordsPage.getContent();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Traçabilité");
            
            // Header row
            Row header = sheet.createRow(0);
            String[] cols = {"ID","Identifiant","Producteur","Parcelle","Date Récolte",
                "Traitements","Destination","Statut","TLC","GTIN","Lot Commercial",
                "Lot Sanitaire","Quantité","Unité","Pays Origine","Expéditeur",
                "Transport","Destinataire","Date Création"};
            for (int i = 0; i < cols.length; i++) {
                header.createCell(i).setCellValue(cols[i]);
            }
            
            // Data rows
            int rowNum = 1;
            for (TraceabilityRecord r : records) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getId() != null ? r.getId() : 0);
                row.createCell(1).setCellValue(r.getIdentifiant() != null ? r.getIdentifiant() : "");
                row.createCell(2).setCellValue(r.getProducteur() != null ? r.getProducteur() : "");
                row.createCell(3).setCellValue(r.getParcelle() != null ? r.getParcelle() : "");
                row.createCell(4).setCellValue(r.getDateRecolte() != null ? r.getDateRecolte().toString() : "");
                row.createCell(5).setCellValue(r.getTraitements() != null ? r.getTraitements() : "");
                row.createCell(6).setCellValue(r.getDestination() != null ? r.getDestination() : "");
                row.createCell(7).setCellValue(r.getStatut() != null ? r.getStatut() : "");
                row.createCell(8).setCellValue(r.getTraceabilityLotCode() != null ? r.getTraceabilityLotCode() : "");
                row.createCell(9).setCellValue(r.getGtin() != null ? r.getGtin() : "");
                row.createCell(10).setCellValue(r.getLotCommercial() != null ? r.getLotCommercial() : "");
                row.createCell(11).setCellValue(r.getLotSanitaire() != null ? r.getLotSanitaire() : "");
                row.createCell(12).setCellValue(r.getQuantite() != null ? r.getQuantite().doubleValue() : 0);
                row.createCell(13).setCellValue(r.getUniteMesure() != null ? r.getUniteMesure() : "");
                row.createCell(14).setCellValue(r.getPaysOrigine() != null ? r.getPaysOrigine() : "");
                row.createCell(15).setCellValue(r.getNomExpediteur() != null ? r.getNomExpediteur() : "");
                row.createCell(16).setCellValue(r.getMoyenTransport() != null ? r.getMoyenTransport() : "");
                row.createCell(17).setCellValue(r.getNomDestinataire() != null ? r.getNomDestinataire() : "");
                row.createCell(18).setCellValue(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < cols.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            
            // COMPRESSION: if > 10,000 records → return as GZIP
            if (records.size() > 10000) {
                workbook.write(baos);
                byte[] excelBytes = baos.toByteArray();
                ByteArrayOutputStream gzipBaos = new ByteArrayOutputStream();
                try (GZIPOutputStream gzip = new GZIPOutputStream(gzipBaos)) {
                    gzip.write(excelBytes);
                }
                return gzipBaos.toByteArray();
            } else {
                workbook.write(baos);
                return baos.toByteArray();
            }
        }
    }

    public long countRecords(String producteur, String dateDebut, String dateFin) {
        return recordRepository.count();
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long total = recordRepository.count();
        long active = recordRepository.countByStatut("VALIDÉ");
        long archived = recordRepository.countByStatut("ARCHIVÉ");
        
        // This month
        LocalDate thisMonth = LocalDate.now().withDayOfMonth(1);
        long thisMonthCount = recordRepository.countByCreatedAtAfter(thisMonth.atStartOfDay());
        
        stats.put("total", total);
        stats.put("active", active);
        stats.put("archived", archived);
        stats.put("thisMonth", thisMonthCount);
        
        return stats;
    }

    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "image/jpeg",
        "image/png"
    );

    private static final List<String> ALLOWED_SIGNATURE_TYPES = Arrays.asList(
        "image/jpeg",
        "image/png"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public TraceabilityRecord uploadDocument(Long recordId, MultipartFile documentFile, 
                                           MultipartFile signatureFile, String userEmail) throws IOException {
        
        TraceabilityRecord record = recordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Enregistrement non trouvé"));

        // Créer le répertoire de stockage
        String uploadDir = "uploads/traceability/" + recordId;
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Valider et sauvegarder le document principal
        if (documentFile != null && !documentFile.isEmpty()) {
            validateFile(documentFile, ALLOWED_DOCUMENT_TYPES, "document");
            
            String documentFileName = documentFile.getOriginalFilename();
            String documentFileType = documentFile.getContentType();
            Path documentFilePath = uploadPath.resolve("document_" + documentFileName);
            
            Files.copy(documentFile.getInputStream(), documentFilePath, StandardCopyOption.REPLACE_EXISTING);
            
            record.setDocumentFileName(documentFileName);
            record.setDocumentFileType(documentFileType);
            record.setDocumentFilePath(documentFilePath.toString());
        }

        // Valider et sauvegarder la signature
        if (signatureFile != null && !signatureFile.isEmpty()) {
            validateFile(signatureFile, ALLOWED_SIGNATURE_TYPES, "signature");
            
            String signatureFileName = signatureFile.getOriginalFilename();
            // Encoder la signature en base64 pour stockage
            byte[] signatureBytes = signatureFile.getBytes();
            String signatureBase64 = Base64.getEncoder().encodeToString(signatureBytes);
            
            record.setSignatureFileName(signatureFileName);
            record.setSignatureFileData(signatureBase64);
        }

        // Mettre à jour les métadonnées
        record.setDocumentUploadedAt(LocalDateTime.now());
        record.setDocumentUploadedBy(userEmail);

        // Sauvegarder et historiser
        TraceabilityRecord saved = recordRepository.save(record);
        saveHistory(saved, userEmail, "Import de document et signature");

        return saved;
    }

    private void validateFile(MultipartFile file, List<String> allowedTypes, String fileType) {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier " + fileType + " est vide");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Le fichier " + fileType + " dépasse la taille maximale de 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new RuntimeException("Type de fichier non autorisé pour " + fileType + 
                ". Types acceptés : " + String.join(", ", allowedTypes));
        }
    }

    public byte[] getDocument(Long recordId) throws IOException {
        TraceabilityRecord record = recordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Enregistrement non trouvé"));

        if (record.getDocumentFilePath() == null) {
            throw new RuntimeException("Aucun document associé à cet enregistrement");
        }

        Path documentPath = Paths.get(record.getDocumentFilePath());
        if (!Files.exists(documentPath)) {
            throw new RuntimeException("Fichier document non trouvé sur le serveur");
        }

        return Files.readAllBytes(documentPath);
    }

    public byte[] getSignature(Long recordId) {
        TraceabilityRecord record = recordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Enregistrement non trouvé"));

        if (record.getSignatureFileData() == null) {
            throw new RuntimeException("Aucune signature associée à cet enregistrement");
        }

        return Base64.getDecoder().decode(record.getSignatureFileData());
    }
}