package com.smartexport.platform.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartexport.platform.dto.LandedCostResultDto;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {
    
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(41, 128, 185);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(240, 240, 240);
    
    public byte[] generateLandedCostPdf(LandedCostResultDto result) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            addHeader(document, result);
            addLegalIdentifiers(document, result);
            addProductInfo(document, result);
            addLogisticsDetails(document, result);
            addCostBreakdown(document, result);
            addProfitabilityAnalysis(document, result);
            addSivAlert(document, result);
            addCurrencySensitivity(document, result);
            addCurrencyConversions(document, result);
            addQrCode(document, result);
            addFooter(document, result);
            
            document.close();
            
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }
    
    private void addHeader(Document document, LandedCostResultDto result) {
        Paragraph title = new Paragraph("Smart Export Global")
            .setFontSize(24)
            .setBold()
            .setFontColor(HEADER_COLOR)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(5);
        
        Paragraph subtitle = new Paragraph("Calcul des Coûts d'Importation (Landed Cost)")
            .setFontSize(14)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(5);
        
        Paragraph simId = new Paragraph("ID Transaction: " + result.getSimulationId())
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20)
            .setFontColor(ColorConstants.GRAY);
        
        document.add(title);
        document.add(subtitle);
        document.add(simId);
    }
    
    private void addProductInfo(Document document, LandedCostResultDto result) {
        Paragraph sectionTitle = new Paragraph("Informations Produit")
            .setFontSize(14)
            .setBold()
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        addInfoRow(table, "Code HS", result.getCodeHs());
        addInfoRow(table, "Produit", result.getNomProduit());
        addInfoRow(table, "Pays de destination", result.getPaysDestination());
        if (result.getNomPort() != null) {
            addInfoRow(table, "Port", result.getNomPort());
        }
        addInfoRow(table, "Devise", result.getCurrency() != null ? result.getCurrency() : "EUR");
        
        document.add(table);
    }
    
    private void addCostBreakdown(Document document, LandedCostResultDto result) {
        Paragraph sectionTitle = new Paragraph("Détail des Coûts")
            .setFontSize(14)
            .setBold()
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        table.addHeaderCell(createHeaderCell("Description"));
        table.addHeaderCell(createHeaderCell("Montant"));
        
        String currency = result.getCurrency() != null ? result.getCurrency() : "EUR";
        
        addCostRow(table, "Valeur FOB", result.getValeurFob(), currency);
        addCostRow(table, "Coût Transport", result.getCoutTransport(), currency);
        addCostRow(table, "Assurance", result.getAssurance(), currency);
        addCostRow(table, "Valeur CAF (CIF)", result.getValeurCaf(), currency, true);
        
        addCostRow(table, "Droits de Douane (" + result.getTauxDouane() + "%)", 
                   result.getMontantDouane(), currency);
        addCostRow(table, "TVA (" + result.getTauxTva() + "%)", 
                   result.getMontantTva(), currency);
        
        if (result.getTaxeParafiscale() != null && 
            result.getTaxeParafiscale().compareTo(BigDecimal.ZERO) > 0) {
            addCostRow(table, "Taxe Parafiscale (" + result.getTaxeParafiscale() + "%)", 
                       result.getMontantTaxeParafiscale(), currency);
        }
        
        if (result.getFraisPortuaires() != null && 
            result.getFraisPortuaires().compareTo(BigDecimal.ZERO) > 0) {
            addCostRow(table, "Frais Portuaires", result.getFraisPortuaires(), currency);
        }
        
        addCostRow(table, "COÛT TOTAL (Landed Cost)", result.getCoutTotal(), currency, true);
        
        document.add(table);
    }
    
    private void addCurrencyConversions(Document document, LandedCostResultDto result) {
        if (result.getCoutTotalEur() != null || result.getCoutTotalUsd() != null) {
            Paragraph sectionTitle = new Paragraph("Conversions de Devises")
                .setFontSize(14)
                .setBold()
                .setMarginBottom(10);
            document.add(sectionTitle);
            
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);
            
            if (result.getCoutTotalEur() != null) {
                addInfoRow(table, "Coût Total (EUR)", 
                          String.format("%.2f EUR", result.getCoutTotalEur()));
            }
            
            if (result.getCoutTotalUsd() != null) {
                addInfoRow(table, "Coût Total (USD)", 
                          String.format("%.2f USD", result.getCoutTotalUsd()));
            }
            
            document.add(table);
        }
    }
    
    private void addFooter(Document document, LandedCostResultDto result) {
        Paragraph disclaimer = new Paragraph("Disclaimer")
            .setFontSize(12)
            .setBold()
            .setMarginTop(10)
            .setMarginBottom(5);
        document.add(disclaimer);
        
        Paragraph disclaimerText = new Paragraph(result.getDisclaimer())
            .setFontSize(9)
            .setItalic()
            .setMarginBottom(10);
        document.add(disclaimerText);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = result.getCalculationDate().format(formatter);
        
        Paragraph footer = new Paragraph(
            "Date de génération: " + formattedDate + "\n" +
            "Source des taux de change: " + result.getExchangeRateSource()
        )
            .setFontSize(8)
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(ColorConstants.GRAY);
        
        document.add(footer);
    }
    
    private void addLegalIdentifiers(Document document, LandedCostResultDto result) {
        if (result.getNomEntreprise() == null && result.getRegistreCommerce() == null && result.getIce() == null) {
            return;
        }
        
        Paragraph sectionTitle = new Paragraph("Informations Légales")
            .setFontSize(14)
            .setBold()
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        if (result.getNomEntreprise() != null) {
            addInfoRow(table, "Nom Entreprise", result.getNomEntreprise());
        }
        if (result.getRegistreCommerce() != null) {
            addInfoRow(table, "Registre Commerce (RC)", result.getRegistreCommerce());
        }
        if (result.getIce() != null) {
            addInfoRow(table, "ICE", result.getIce());
        }
        
        document.add(table);
    }
    
    private void addLogisticsDetails(Document document, LandedCostResultDto result) {
        if (result.getPoidsNet() == null && result.getPoidsBrut() == null && 
            result.getTypeUnite() == null && result.getIncoterm() == null) {
            return;
        }
        
        Paragraph sectionTitle = new Paragraph("Détails Logistiques")
            .setFontSize(14)
            .setBold()
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        if (result.getPoidsNet() != null) {
            addInfoRow(table, "Poids Net", String.format("%.2f kg", result.getPoidsNet()));
        }
        if (result.getPoidsBrut() != null) {
            addInfoRow(table, "Poids Brut", String.format("%.2f kg", result.getPoidsBrut()));
        }
        if (result.getTypeUnite() != null) {
            addInfoRow(table, "Type Unité", result.getTypeUnite());
        }
        if (result.getIncoterm() != null) {
            addInfoRow(table, "Incoterm", result.getIncoterm());
        }
        if (result.getFraisPortuaires() != null && result.getFraisPortuaires().compareTo(BigDecimal.ZERO) > 0) {
            addInfoRow(table, "Justification Frais Portuaires", 
                String.format("%.2f %s (Frais standard port %s)", 
                    result.getFraisPortuaires(), 
                    result.getCurrency() != null ? result.getCurrency() : "EUR",
                    result.getNomPort() != null ? result.getNomPort() : "N/A"));
        }
        
        document.add(table);
    }
    
    private void addProfitabilityAnalysis(Document document, LandedCostResultDto result) {
        if (result.getMargeNette() == null) {
            return;
        }
        
        Paragraph sectionTitle = new Paragraph("Analyse de Rentabilité")
            .setFontSize(14)
            .setBold()
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        String currency = result.getCurrency() != null ? result.getCurrency() : "EUR";
        
        if (result.getPrixVentePrevisionnel() != null) {
            addCostRow(table, "Prix de Vente Prévisionnel", result.getPrixVentePrevisionnel(), currency);
        }
        addCostRow(table, "Coût Total (Landed Cost)", result.getCoutTotal(), currency);
        
        DeviceRgb margeColor = result.getMargeNette().compareTo(BigDecimal.ZERO) > 0 
            ? new DeviceRgb(0, 128, 0) : new DeviceRgb(255, 0, 0);
        
        Cell margeCell = new Cell().add(new Paragraph("Marge Nette").setBold());
        Cell margeValueCell = new Cell().add(
            new Paragraph(String.format("%.2f %s", result.getMargeNette(), currency))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBold()
                .setFontColor(margeColor)
        );
        table.addCell(margeCell);
        table.addCell(margeValueCell);
        
        if (result.getMargePourcentage() != null) {
            Cell margePctCell = new Cell().add(new Paragraph("Marge %").setBold());
            Cell margePctValueCell = new Cell().add(
                new Paragraph(String.format("%.2f%%", result.getMargePourcentage()))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBold()
                    .setFontColor(margeColor)
            );
            table.addCell(margePctCell);
            table.addCell(margePctValueCell);
        }
        
        if (result.getIndicateurRentabilite() != null) {
            addInfoRow(table, "Indicateur", result.getIndicateurRentabilite());
        }
        
        document.add(table);
    }
    
    private void addSivAlert(Document document, LandedCostResultDto result) {
        if (result.getAlerteSiv() == null || !result.getAlerteSiv()) {
            return;
        }
        
        Paragraph sectionTitle = new Paragraph("⚠️ Alerte Sécurité Douanière (SIV)")
            .setFontSize(14)
            .setBold()
            .setFontColor(new DeviceRgb(255, 140, 0))
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Paragraph alertText = new Paragraph(result.getMessageSiv())
            .setFontSize(11)
            .setMarginBottom(10)
            .setBackgroundColor(new DeviceRgb(255, 250, 205))
            .setPadding(10);
        document.add(alertText);
        
        if (result.getPrixEntreeSivMin() != null) {
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);
            
            String currency = result.getCurrency() != null ? result.getCurrency() : "EUR";
            addInfoRow(table, "Valeur CAF actuelle", 
                String.format("%.2f %s", result.getValeurCaf(), currency));
            addInfoRow(table, "Prix d'entrée SIV minimum", 
                String.format("%.2f %s", result.getPrixEntreeSivMin(), currency));
            
            document.add(table);
        }
    }
    
    private void addCurrencySensitivity(Document document, LandedCostResultDto result) {
        if (result.getImpactDevise2PourcentPlus() == null && result.getImpactDevise2PourcentMoins() == null) {
            return;
        }
        
        Paragraph sectionTitle = new Paragraph("Analyse de Sensibilité Devises")
            .setFontSize(14)
            .setBold()
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Paragraph description = new Paragraph("Impact d'une variation de ±2% du taux de change sur le coût total:")
            .setFontSize(10)
            .setItalic()
            .setMarginBottom(5);
        document.add(description);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 1}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        String currency = result.getCurrency() != null ? result.getCurrency() : "EUR";
        
        if (result.getImpactDevise2PourcentPlus() != null) {
            BigDecimal newTotal = result.getCoutTotal().add(result.getImpactDevise2PourcentPlus());
            addInfoRow(table, "Variation +2%", 
                String.format("+%.2f %s (Total: %.2f %s)", 
                    result.getImpactDevise2PourcentPlus(), currency, newTotal, currency));
        }
        
        if (result.getImpactDevise2PourcentMoins() != null) {
            BigDecimal newTotal = result.getCoutTotal().add(result.getImpactDevise2PourcentMoins());
            addInfoRow(table, "Variation -2%", 
                String.format("%.2f %s (Total: %.2f %s)", 
                    result.getImpactDevise2PourcentMoins(), currency, newTotal, currency));
        }
        
        document.add(table);
    }
    
    private void addQrCode(Document document, LandedCostResultDto result) {
        try {
            String qrContent = "SIM:" + result.getSimulationId() + 
                "|URL:https://smartexport.com/verify/" + result.getSimulationId();
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 150, 150);
            
            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream qrBaos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", qrBaos);
            
            Image qrCodeImage = new Image(ImageDataFactory.create(qrBaos.toByteArray()))
                .setWidth(100)
                .setHeight(100)
                .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER)
                .setMarginTop(10)
                .setMarginBottom(5);
            
            Paragraph qrLabel = new Paragraph("QR Code de Vérification")
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
            
            document.add(qrCodeImage);
            document.add(qrLabel);
            
        } catch (Exception e) {
            // Silently fail if QR code generation fails
            Paragraph qrError = new Paragraph("[QR Code non disponible]")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY)
                .setMarginBottom(10);
            document.add(qrError);
        }
    }
    
    private void addInfoRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold())
            .setBackgroundColor(LIGHT_GRAY));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "N/A")));
    }
    
    private void addCostRow(Table table, String description, BigDecimal amount, 
                           String currency) {
        addCostRow(table, description, amount, currency, false);
    }
    
    private void addCostRow(Table table, String description, BigDecimal amount, 
                           String currency, boolean bold) {
        Paragraph descPara = new Paragraph(description);
        Paragraph amountPara = new Paragraph(
            String.format("%.2f %s", amount, currency)
        ).setTextAlignment(TextAlignment.RIGHT);
        
        if (bold) {
            descPara.setBold();
            amountPara.setBold();
        }
        
        table.addCell(new Cell().add(descPara));
        table.addCell(new Cell().add(amountPara));
    }
    
    private Cell createHeaderCell(String text) {
        return new Cell()
            .add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(HEADER_COLOR)
            .setTextAlignment(TextAlignment.CENTER);
    }
}
