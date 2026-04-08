package com.smartexport.platform.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartexport.platform.dto.LandedCostResultDto;
import com.smartexport.platform.dto.ImportLandedCostResultDto;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class PdfGenerationService {
    
    private static final org.slf4j.Logger log = 
        org.slf4j.LoggerFactory.getLogger(PdfGenerationService.class);
    
    private String t(String lang, String fr, String en, String es) {
        return "en".equals(lang) ? en : "es".equals(lang) ? es : fr;
    }
    
    public byte[] generateLandedCostPdf(LandedCostResultDto result) {
        return generateLandedCostPdf(result, "fr");
    }
    
    public byte[] generateLandedCostPdf(LandedCostResultDto result, String lang) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            
            // Créer le document PDF avec iText 7
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Définir les marges à 50pt
            document.setMargins(50, 50, 50, 50);
            
            // Charger la police Helvetica
            PdfFont helveticaFont = PdfFontFactory.createFont("Helvetica");
            PdfFont helveticaBoldFont = PdfFontFactory.createFont("Helvetica-Bold");
            
            // Couleurs
            DeviceRgb blackColor = new DeviceRgb(0, 0, 0);
            DeviceRgb grayColor = new DeviceRgb(102, 102, 102);
            DeviceRgb totalBgColor = new DeviceRgb(51, 51, 51);
            DeviceRgb whiteColor = new DeviceRgb(255, 255, 255);
            
            // Générer la référence unique
            String reference = "REF-" + 
                java.util.UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase();
            
            // Date de génération
            String generationDate = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            
            // EN-TÊTE
            Paragraph title = new Paragraph("Smart Export Global")
                .setFont(helveticaBoldFont)
                .setFontSize(18)
                .setFontColor(blackColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
            
            Paragraph subtitle = new Paragraph(t(lang, "Calcul des Coûts d'Importation (Landed Cost)", "Import Cost Calculation (Landed Cost)", "Cálculo de Costos de Importación (Landed Cost)"))
                .setFont(helveticaBoldFont)
                .setFontSize(12)
                .setFontColor(blackColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
            
            Paragraph refLine = new Paragraph(t(lang, "Référence: ", "Reference: ", "Referencia: ") + reference)
                .setFont(helveticaFont)
                .setFontSize(10)
                .setFontColor(grayColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15);
            
            document.add(title);
            document.add(subtitle);
            document.add(refLine);
            
            // Ligne séparatrice
            document.add(new Paragraph("─".repeat(50))
                .setFont(helveticaFont)
                .setFontSize(8)
                .setFontColor(grayColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15));
            
            // SECTION 1 - INFORMATIONS PRODUIT
            Paragraph section1Title = new Paragraph(t(lang, "Informations Produit", "Product Information", "Información del Producto"))
                .setFont(helveticaBoldFont)
                .setFontSize(11)
                .setFontColor(blackColor)
                .setMarginBottom(10);
            document.add(section1Title);
            
            // Tableau 2 colonnes pour informations produit
            Table productTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(new SolidBorder(blackColor, 0.5f));
            
            // Logique pour déterminer le nom du port
            String port = "";
            if (result.getNomPort() != null && !result.getNomPort().isEmpty()) {
                port = result.getNomPort();
            }
            
            addProductRow(productTable, t(lang, "Code HS", "HS Code", "Código HS"), result.getCodeHs() != null ? result.getCodeHs() : "", helveticaFont, helveticaBoldFont);
            addProductRow(productTable, t(lang, "Produit", "Product", "Producto"), result.getNomProduit() != null ? result.getNomProduit() : "", helveticaFont, helveticaBoldFont);
            addProductRow(productTable, t(lang, "Pays de destination", "Destination country", "País de destino"), result.getPaysDestination() != null ? result.getPaysDestination() : "", helveticaFont, helveticaBoldFont);
            addProductRow(productTable, t(lang, "Port", "Port", "Puerto"), port, helveticaFont, helveticaBoldFont);
            addProductRow(productTable, t(lang, "Devise", "Currency", "Divisa"), result.getCurrency() != null ? result.getCurrency() : "", helveticaFont, helveticaBoldFont);
            
            document.add(productTable);
            
            // Espacement entre sections
            document.add(new Paragraph("").setFontSize(15));
            
            // SECTION 2 - DÉTAIL DES COÛTS
            Paragraph section2Title = new Paragraph(t(lang, "Détail des Coûts", "Cost Breakdown", "Desglose de Costos"))
                .setFont(helveticaBoldFont)
                .setFontSize(11)
                .setFontColor(blackColor)
                .setMarginBottom(10);
            document.add(section2Title);
            
            // Tableau 2 colonnes pour coûts
            Table costTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(new SolidBorder(blackColor, 0.5f));
            
            // En-tête tableau coûts
            Cell descHeader = new Cell()
                .add(new Paragraph(t(lang, "Description", "Description", "Descripción"))
                    .setFont(helveticaBoldFont)
                    .setFontSize(10)
                    .setFontColor(blackColor))
                .setBorder(new SolidBorder(blackColor, 0.5f))
                .setPadding(5);
            
            Cell amountHeader = new Cell()
                .add(new Paragraph(t(lang, "Montant", "Amount", "Monto"))
                    .setFont(helveticaBoldFont)
                    .setFontSize(10)
                    .setFontColor(blackColor))
                .setBorder(new SolidBorder(blackColor, 0.5f))
                .setPadding(5);
            
            costTable.addCell(descHeader);
            costTable.addCell(amountHeader);
            
            // Lignes de coûts
            addCostRow(costTable, t(lang, "Valeur FOB", "FOB Value", "Valor FOB"), result.getValeurFob(), result.getCurrency(), helveticaFont);
            addCostRow(costTable, t(lang, "Coût Transport", "Transport Cost", "Costo de Transporte"), result.getCoutTransport(), result.getCurrency(), helveticaFont);
            addCostRow(costTable, t(lang, "Assurance", "Insurance", "Seguro"), result.getAssurance(), result.getCurrency(), helveticaFont);
            addCostRow(costTable, t(lang, "Valeur CAF (CIF)", "CIF Value", "Valor CIF"), result.getValeurCaf(), result.getCurrency(), helveticaFont);
            
            // Calculer les taux pour l'affichage
            String douaneRate = "";
            if (result.getTauxDouane() != null && result.getValeurCaf() != null && result.getValeurCaf().compareTo(BigDecimal.ZERO) > 0) {
                douaneRate = String.format("%.2f", result.getTauxDouane());
            }
            String tvaRate = "";
            if (result.getTauxTva() != null && result.getValeurCaf() != null && result.getValeurCaf().compareTo(BigDecimal.ZERO) > 0) {
                tvaRate = String.format("%.2f", result.getTauxTva());
            }
            
            addCostRow(costTable, t(lang, "Droits de Douane", "Customs Duties", "Derechos de Aduana") + " (" + douaneRate + "%)", result.getMontantDouane(), result.getCurrency(), helveticaFont);
            addCostRow(costTable, t(lang, "TVA", "VAT", "IVA") + " (" + tvaRate + "%)", result.getMontantTva(), result.getCurrency(), helveticaFont);
            addCostRow(costTable, t(lang, "Frais Portuaires", "Port Fees", "Gastos Portuarios"), result.getFraisPortuaires(), result.getCurrency(), helveticaFont);
            
            // Ligne TOTAL avec fond #333333
            Cell totalDesc = new Cell()
                .add(new Paragraph(t(lang, "COÛT TOTAL (Landed Cost)", "TOTAL LANDED COST", "COSTO TOTAL (Landed Cost)"))
                    .setFont(helveticaBoldFont)
                    .setFontSize(10)
                    .setFontColor(whiteColor))
                .setBackgroundColor(totalBgColor)
                .setBorder(new SolidBorder(blackColor, 0.5f))
                .setPadding(5);
            
            Cell totalAmount = new Cell()
                .add(new Paragraph(formatMontant(result.getCoutTotal(), result.getCurrency()))
                    .setFont(helveticaBoldFont)
                    .setFontSize(10)
                    .setFontColor(whiteColor)
                    .setTextAlignment(TextAlignment.RIGHT))
                .setBackgroundColor(totalBgColor)
                .setBorder(new SolidBorder(blackColor, 0.5f))
                .setPadding(5);
            
            costTable.addCell(totalDesc);
            costTable.addCell(totalAmount);
            
            document.add(costTable);
            
            // Espacement entre sections
            document.add(new Paragraph("").setFontSize(15));
            
            // SECTION 3 - CONVERSIONS DE DEVISES
            Paragraph section3Title = new Paragraph(t(lang, "Conversions de Devises", "Currency Conversions", "Conversiones de Divisas"))
                .setFont(helveticaBoldFont)
                .setFontSize(11)
                .setFontColor(blackColor)
                .setMarginBottom(10);
            document.add(section3Title);
            
            Paragraph eurLine = new Paragraph(t(lang, "Coût Total (EUR) : ", "Total Cost (EUR): ", "Costo Total (EUR): ") + formatMontant(result.getCoutTotalEur(), "EUR"))
                .setFont(helveticaFont)
                .setFontSize(10)
                .setFontColor(blackColor)
                .setMarginBottom(5);
            
            Paragraph usdLine = new Paragraph(t(lang, "Coût Total (USD) : ", "Total Cost (USD): ", "Costo Total (USD): ") + formatMontant(result.getCoutTotalUsd(), "USD"))
                .setFont(helveticaFont)
                .setFontSize(10)
                .setFontColor(blackColor)
                .setMarginBottom(15);
            
            document.add(eurLine);
            document.add(usdLine);
            
            // SECTION 4 - QR CODE
            try {
                // Contenu du QR code
                String qrContent = reference + " | HS:" + 
                    (result.getCodeHs() != null ? result.getCodeHs() : "") + 
                    " | Total:" + formatMontant(result.getCoutTotal(), result.getCurrency());
                
                // Générer le QR code
                QRCodeWriter qrWriter = new QRCodeWriter();
                BitMatrix bitMatrix = qrWriter.encode(
                    qrContent, 
                    BarcodeFormat.QR_CODE, 
                    80, 80
                );
                
                BufferedImage bufferedImage = 
                    MatrixToImageWriter.toBufferedImage(bitMatrix);
                
                ByteArrayOutputStream qrBaos = new ByteArrayOutputStream();
                ImageIO.write(bufferedImage, "PNG", qrBaos);
                
                com.itextpdf.io.image.ImageData imageData = 
                    ImageDataFactory.create(qrBaos.toByteArray());
                Image qrImage = new Image(imageData);
                qrImage.setWidth(80);
                qrImage.setHeight(80);
                
                // Aligner le QR code à droite
                Paragraph qrParagraph = new Paragraph()
                    .add(qrImage)
                    .setTextAlignment(TextAlignment.RIGHT);
                
                document.add(qrParagraph);
                
            } catch (Exception e) {
                log.warn("Erreur lors de la génération du QR code: {}", e.getMessage());
            }
            
            // Espacement entre sections
            document.add(new Paragraph("").setFontSize(15));
            
            // SECTION 5 - DISCLAIMER
            Paragraph section5Title = new Paragraph(t(lang, "Disclaimer", "Disclaimer", "Descargo de responsabilidad"))
                .setFont(helveticaBoldFont)
                .setFontSize(11)
                .setFontColor(blackColor)
                .setMarginBottom(10);
            document.add(section5Title);
            
            Paragraph disclaimer = new Paragraph(
                t(lang, "Estimation non contractuelle basée sur les flux réels et les tarifs officiels à la date du ", "Non-contractual estimate based on actual flows and official tariffs as of ", "Estimación no contractual basada en flujos reales y tarifas oficiales a la fecha del ") + 
                generationDate + ".\n" +
                t(lang, "Les droits de douane sont calculés selon le tarif douanier en vigueur.", "Customs duties are calculated according to the applicable customs tariff.", "Los derechos de aduana se calculan según el arancel aduanero vigente.") + "\n" +
                t(lang, "Ce document ne constitue pas un engagement contractuel.", "This document does not constitute a contractual commitment.", "Este documento no constituye un compromiso contractual.") + "\n" +
                t(lang, "Date de génération: ", "Generation date: ", "Fecha de generación: ") + generationDate + "\n" +
                t(lang, "Source des taux de change: ", "Exchange rate source: ", "Fuente de los tipos de cambio: ") + 
                (result.getExchangeRateSource() != null ? result.getExchangeRateSource() : "ExchangeRate-API")
            )
                .setFont(helveticaFont)
                .setFontSize(10)
                .setFontColor(grayColor)
                .setMarginBottom(10);
            
            document.add(disclaimer);
            
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }
    
    private void addProductRow(Table table, String label, String value, PdfFont font, PdfFont boldFont) {
        Cell labelCell = new Cell()
            .add(new Paragraph(label)
                .setFont(font)
                .setFontSize(10)
                .setFontColor(new DeviceRgb(0, 0, 0)))
            .setBorder(new SolidBorder(new DeviceRgb(0, 0, 0), 0.5f))
            .setPadding(5);
        
        Cell valueCell = new Cell()
            .add(new Paragraph(value)
                .setFont(boldFont)
                .setFontSize(10)
                .setFontColor(new DeviceRgb(0, 0, 0)))
            .setBorder(new SolidBorder(new DeviceRgb(0, 0, 0), 0.5f))
            .setPadding(5);
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }
    
    private void addCostRow(Table table, String description, BigDecimal amount, String currency, PdfFont font) {
        Cell descCell = new Cell()
            .add(new Paragraph(description)
                .setFont(font)
                .setFontSize(10)
                .setFontColor(new DeviceRgb(0, 0, 0)))
            .setBorder(new SolidBorder(new DeviceRgb(0, 0, 0), 0.5f))
            .setPadding(5);
        
        Cell amountCell = new Cell()
            .add(new Paragraph(formatMontant(amount, currency))
                .setFont(font)
                .setFontSize(10)
                .setFontColor(new DeviceRgb(0, 0, 0))
                .setTextAlignment(TextAlignment.RIGHT))
            .setBorder(new SolidBorder(new DeviceRgb(0, 0, 0), 0.5f))
            .setPadding(5);
        
        table.addCell(descCell);
        table.addCell(amountCell);
    }
    
    private String formatMontant(BigDecimal valeur, String devise) {
        if (valeur == null) return "0,00 " + (devise != null ? devise : "");
        return String.format("%,.2f %s", valeur, devise != null ? devise : "")
            .replace(",", " ").replace(".", ",");
    }
    
    public byte[] generateImportLandedCostPdf(ImportLandedCostResultDto result) {
        // TODO: implémentation complète après compilation
        return new byte[0];
    }
}