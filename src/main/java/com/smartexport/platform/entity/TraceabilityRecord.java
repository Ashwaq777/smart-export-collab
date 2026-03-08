package com.smartexport.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "traceability_records", indexes = {
    @Index(name = "idx_trace_producteur_date", columnList = "producteur,date_recolte"),
    @Index(name = "idx_trace_lot", columnList = "lot"),
    @Index(name = "idx_trace_tlc", columnList = "traceability_lot_code"),
    @Index(name = "idx_trace_statut", columnList = "statut")
})
public class TraceabilityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identifiant", unique = true, length = 50)
    private String identifiant;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "version")
    private Integer version = 1;

    @Column(name = "statut", length = 20)
    private String statut = "BROUILLON";

    // Section B - Identification du Produit
    @Column(name = "traceability_lot_code", length = 100)
    private String traceabilityLotCode;

    @Column(name = "description_produit", length = 500)
    private String descriptionProduit;

    @Column(name = "gtin", length = 14)
    private String gtin;

    @Column(name = "lot_commercial", length = 100)
    private String lotCommercial;

    @Column(name = "lot_sanitaire", length = 100)
    private String lotSanitaire;

    @Column(name = "quantite")
    private Double quantite;

    @Column(name = "unite_mesure", length = 20)
    private String uniteMesure = "kg";

    // Section C - Origine & Production
    @Column(name = "producteur", length = 255)
    private String producteur;

    @Column(name = "parcelle", length = 255)
    private String parcelle;

    @Column(name = "date_recolte")
    private String dateRecolte;

    @Column(name = "traitements", columnDefinition = "TEXT")
    private String traitements;

    @Column(name = "destination", length = 255)
    private String destination;

    @Column(name = "lot", length = 100)
    private String lot;

    @Column(name = "pays_origine", length = 100)
    private String paysOrigine;

    @Column(name = "site_production_nom", length = 255)
    private String siteProductionNom;

    @Column(name = "site_production_adresse", columnDefinition = "TEXT")
    private String siteProductionAdresse;

    @Column(name = "numero_agrement_sanitaire", length = 100)
    private String numeroAgrementSanitaire;

    @Column(name = "date_production")
    private String dateProduction;

    // Section D - Expédition
    @Column(name = "nom_expediteur", length = 255)
    private String nomExpediteur;

    @Column(name = "adresse_expediteur", columnDefinition = "TEXT")
    private String adresseExpediteur;

    @Column(name = "gln_expediteur", length = 13)
    private String glnExpediteur;

    @Column(name = "date_expedition")
    private LocalDateTime dateExpedition;

    @Column(name = "moyen_transport", length = 20)
    private String moyenTransport = "Mer";

    @Column(name = "temperature_transport")
    private Double temperatureTransport;

    // Section E - Réception
    @Column(name = "nom_destinataire", length = 255)
    private String nomDestinataire;

    @Column(name = "adresse_destinataire", columnDefinition = "TEXT")
    private String adresseDestinataire;

    @Column(name = "gln_destinataire", length = 13)
    private String glnDestinataire;

    @Column(name = "date_reception")
    private LocalDateTime dateReception;

    // Section F - UE
    @Column(name = "operateur_ue", length = 255)
    private String operateurUe;

    @Column(name = "adresse_operateur_ue", columnDefinition = "TEXT")
    private String adresseOperateurUe;

    @Column(name = "numero_eori", length = 20)
    private String numeroEori;

    // Section G - Documents
    @Column(name = "type_document", length = 20)
    private String typeDocument;

    @Column(name = "numero_document", length = 100)
    private String numeroDocument;

    @Column(name = "certificat_sanitaire", length = 100)
    private String certificatSanitaire;

    // Additional fields
    @Column(name = "gln_createur_tlc", length = 13)
    private String glnCreateurTlc;

    @Column(name = "systeme_source", length = 100)
    private String systemeSource;

    @Column(name = "validation_confirmed")
    private Boolean validationConfirmed = false;

    @Column(name = "signature_electronique", length = 255)
    private String signatureElectronique;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        
        if (identifiant == null || identifiant.isEmpty()) {
            String dateStr = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            identifiant = "TRACE-" + dateStr + "-" + String.format("%04d", (int)(Math.random() * 10000));
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (version != null) {
            version++;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdentifiant() { return identifiant; }
    public void setIdentifiant(String identifiant) { this.identifiant = identifiant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getTraceabilityLotCode() { return traceabilityLotCode; }
    public void setTraceabilityLotCode(String traceabilityLotCode) { this.traceabilityLotCode = traceabilityLotCode; }

    public String getDescriptionProduit() { return descriptionProduit; }
    public void setDescriptionProduit(String descriptionProduit) { this.descriptionProduit = descriptionProduit; }

    public String getGtin() { return gtin; }
    public void setGtin(String gtin) { this.gtin = gtin; }

    public String getLotCommercial() { return lotCommercial; }
    public void setLotCommercial(String lotCommercial) { this.lotCommercial = lotCommercial; }

    public String getLotSanitaire() { return lotSanitaire; }
    public void setLotSanitaire(String lotSanitaire) { this.lotSanitaire = lotSanitaire; }

    public Double getQuantite() { return quantite; }
    public void setQuantite(Double quantite) { this.quantite = quantite; }

    public String getUniteMesure() { return uniteMesure; }
    public void setUniteMesure(String uniteMesure) { this.uniteMesure = uniteMesure; }

    public String getProducteur() { return producteur; }
    public void setProducteur(String producteur) { this.producteur = producteur; }

    public String getParcelle() { return parcelle; }
    public void setParcelle(String parcelle) { this.parcelle = parcelle; }

    public String getDateRecolte() { return dateRecolte; }
    public void setDateRecolte(String dateRecolte) { this.dateRecolte = dateRecolte; }

    public String getTraitements() { return traitements; }
    public void setTraitements(String traitements) { this.traitements = traitements; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getLot() { return lot; }
    public void setLot(String lot) { this.lot = lot; }

    public String getPaysOrigine() { return paysOrigine; }
    public void setPaysOrigine(String paysOrigine) { this.paysOrigine = paysOrigine; }

    public String getSiteProductionNom() { return siteProductionNom; }
    public void setSiteProductionNom(String siteProductionNom) { this.siteProductionNom = siteProductionNom; }

    public String getSiteProductionAdresse() { return siteProductionAdresse; }
    public void setSiteProductionAdresse(String siteProductionAdresse) { this.siteProductionAdresse = siteProductionAdresse; }

    public String getNumeroAgrementSanitaire() { return numeroAgrementSanitaire; }
    public void setNumeroAgrementSanitaire(String numeroAgrementSanitaire) { this.numeroAgrementSanitaire = numeroAgrementSanitaire; }

    public String getDateProduction() { return dateProduction; }
    public void setDateProduction(String dateProduction) { this.dateProduction = dateProduction; }

    public String getNomExpediteur() { return nomExpediteur; }
    public void setNomExpediteur(String nomExpediteur) { this.nomExpediteur = nomExpediteur; }

    public String getAdresseExpediteur() { return adresseExpediteur; }
    public void setAdresseExpediteur(String adresseExpediteur) { this.adresseExpediteur = adresseExpediteur; }

    public String getGlnExpediteur() { return glnExpediteur; }
    public void setGlnExpediteur(String glnExpediteur) { this.glnExpediteur = glnExpediteur; }

    public LocalDateTime getDateExpedition() { return dateExpedition; }
    public void setDateExpedition(LocalDateTime dateExpedition) { this.dateExpedition = dateExpedition; }

    public String getMoyenTransport() { return moyenTransport; }
    public void setMoyenTransport(String moyenTransport) { this.moyenTransport = moyenTransport; }

    public Double getTemperatureTransport() { return temperatureTransport; }
    public void setTemperatureTransport(Double temperatureTransport) { this.temperatureTransport = temperatureTransport; }

    public String getNomDestinataire() { return nomDestinataire; }
    public void setNomDestinataire(String nomDestinataire) { this.nomDestinataire = nomDestinataire; }

    public String getAdresseDestinataire() { return adresseDestinataire; }
    public void setAdresseDestinataire(String adresseDestinataire) { this.adresseDestinataire = adresseDestinataire; }

    public String getGlnDestinataire() { return glnDestinataire; }
    public void setGlnDestinataire(String glnDestinataire) { this.glnDestinataire = glnDestinataire; }

    public LocalDateTime getDateReception() { return dateReception; }
    public void setDateReception(LocalDateTime dateReception) { this.dateReception = dateReception; }

    public String getOperateurUe() { return operateurUe; }
    public void setOperateurUe(String operateurUe) { this.operateurUe = operateurUe; }

    public String getAdresseOperateurUe() { return adresseOperateurUe; }
    public void setAdresseOperateurUe(String adresseOperateurUe) { this.adresseOperateurUe = adresseOperateurUe; }

    public String getNumeroEori() { return numeroEori; }
    public void setNumeroEori(String numeroEori) { this.numeroEori = numeroEori; }

    public String getTypeDocument() { return typeDocument; }
    public void setTypeDocument(String typeDocument) { this.typeDocument = typeDocument; }

    public String getNumeroDocument() { return numeroDocument; }
    public void setNumeroDocument(String numeroDocument) { this.numeroDocument = numeroDocument; }

    public String getCertificatSanitaire() { return certificatSanitaire; }
    public void setCertificatSanitaire(String certificatSanitaire) { this.certificatSanitaire = certificatSanitaire; }

    public String getGlnCreateurTlc() { return glnCreateurTlc; }
    public void setGlnCreateurTlc(String glnCreateurTlc) { this.glnCreateurTlc = glnCreateurTlc; }

    public String getSystemeSource() { return systemeSource; }
    public void setSystemeSource(String systemeSource) { this.systemeSource = systemeSource; }

    public Boolean getValidationConfirmed() { return validationConfirmed; }
    public void setValidationConfirmed(Boolean validationConfirmed) { this.validationConfirmed = validationConfirmed; }

    public String getSignatureElectronique() { return signatureElectronique; }
    public void setSignatureElectronique(String signatureElectronique) { this.signatureElectronique = signatureElectronique; }

    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime dateValidation) { this.dateValidation = dateValidation; }
}