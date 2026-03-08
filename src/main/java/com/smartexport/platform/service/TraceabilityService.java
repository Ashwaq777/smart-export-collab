package com.smartexport.platform.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartexport.platform.dto.TraceabilityDTO;
import com.smartexport.platform.entity.TraceabilityHistory;
import com.smartexport.platform.entity.TraceabilityRecord;
import com.smartexport.platform.repository.TraceabilityHistoryRepository;
import com.smartexport.platform.repository.TraceabilityRecordRepository;

import jakarta.persistence.criteria.Predicate;

@Service
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
            System.err.println("Failed to save history: " + e.getMessage());
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
        String dateDebut, String dateFin) throws IOException {
        
        Pageable pageable = PageRequest.of(0, 10000);
        Page<TraceabilityRecord> recordsPage = getAll(producteur, lot, dateDebut, dateFin, 0, 10000);
        List<TraceabilityRecord> records = recordsPage.getContent();
        
        org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
        org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Traçabilité");
        
        // Header row
        org.apache.poi.ss.usermodel.Row header = sheet.createRow(0);
        String[] cols = {"Identifiant","Producteur","Parcelle","Date Récolte","Destination",
            "Lot","TLC","Description","Pays Origine","Expéditeur","Transport","Destinataire","Statut"};
        for (int i = 0; i < cols.length; i++) {
            header.createCell(i).setCellValue(cols[i]);
        }
        
        // Data rows
        int rowNum = 1;
        for (TraceabilityRecord r : records) {
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(r.getIdentifiant() != null ? r.getIdentifiant() : "");
            row.createCell(1).setCellValue(r.getProducteur() != null ? r.getProducteur() : "");
            row.createCell(2).setCellValue(r.getParcelle() != null ? r.getParcelle() : "");
            row.createCell(3).setCellValue(r.getDateRecolte() != null ? r.getDateRecolte() : "");
            row.createCell(4).setCellValue(r.getDestination() != null ? r.getDestination() : "");
            row.createCell(5).setCellValue(r.getLot() != null ? r.getLot() : "");
            row.createCell(6).setCellValue(r.getTraceabilityLotCode() != null ? r.getTraceabilityLotCode() : "");
            row.createCell(7).setCellValue(r.getDescriptionProduit() != null ? r.getDescriptionProduit() : "");
            row.createCell(8).setCellValue(r.getPaysOrigine() != null ? r.getPaysOrigine() : "");
            row.createCell(9).setCellValue(r.getNomExpediteur() != null ? r.getNomExpediteur() : "");
            row.createCell(10).setCellValue(r.getMoyenTransport() != null ? r.getMoyenTransport() : "");
            row.createCell(11).setCellValue(r.getNomDestinataire() != null ? r.getNomDestinataire() : "");
            row.createCell(12).setCellValue(r.getStatut() != null ? r.getStatut() : "");
        }
        
        // Auto-size columns
        for (int i = 0; i < cols.length; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
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
}