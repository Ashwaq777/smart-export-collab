package com.smartexport.platform.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TraceabilityDTO {

    private Long id;
    private String identifiant;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private Integer version;
    private String statut;

    private String traceabilityLotCode;
    private String descriptionProduit;
    private String gtin;
    private String lotCommercial;
    private String lotSanitaire;
    private Double quantite;
    private String uniteMesure;

    private String producteur;
    private String parcelle;
    private String dateRecolte;
    private String traitements;
    private String destination;
    private String lot;
    private String paysOrigine;
    private String siteProductionNom;
    private String siteProductionAdresse;
    private String numeroAgrementSanitaire;
    private String dateProduction;

    private String nomExpediteur;
    private String adresseExpediteur;
    private String glnExpediteur;
    private LocalDateTime dateExpedition;
    private String moyenTransport;
    private Double temperatureTransport;

    private String nomDestinataire;
    private String adresseDestinataire;
    private String glnDestinataire;
    private LocalDateTime dateReception;

    private String operateurUe;
    private String adresseOperateurUe;
    private String numeroEori;

    private String typeDocument;
    private String numeroDocument;
    private String certificatSanitaire;

    private String glnCreateurTlc;
    private String systemeSource;
    private Boolean validationConfirmed;
    private String signatureElectronique;
    private LocalDateTime dateValidation;
}
