package com.smartexport.platform.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartexport.platform.dto.LandedCostResultDto;
import com.smartexport.platform.dto.MaritimeTransportCostDto;
import com.smartexport.platform.pdf.common.PdfHelper;
import com.smartexport.platform.pdf.common.PdfTheme;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {
    
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(11, 31, 58);
    private static final DeviceRgb ACCENT_COLOR = new DeviceRgb(28, 167, 199);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(240, 240, 240);
    private static final DeviceRgb MUTED_TEXT = new DeviceRgb(120, 120, 120);
    private static final DeviceRgb SOFT_BLUE = new DeviceRgb(244, 247, 250);
    
    public byte[] generateLandedCostPdf(LandedCostResultDto result) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            PdfHelper.Fonts fonts = PdfHelper.loadFonts();
            document.setFont(fonts.regular);
            String ref = result.getSimulationId() != null ? "REF-LC-" + PdfHelper.safeGlyphs(result.getSimulationId()) : "REF-LC";
            pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, new PdfHelper.HeaderFooterHandler("Landed Cost Report", ref, fonts));
            
            addCover(document, result, pdfDoc, fonts, ref);

            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            addExecutiveSummary(document, result);
            addLegalIdentifiers(document, result);
            addProductInfo(document, result);
            addLogisticsDetails(document, result);
            addCostBreakdown(document, result);

            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            addProfitabilityAnalysis(document, result);
            addSivAlert(document, result);
            addCurrencySensitivity(document, result);
            addCurrencyConversions(document, result);
            addMaritimeTransportSection(document, result);
            addQrCode(document, result);
            
            PdfHelper.addWatermark(pdfDoc, fonts);
            document.close();
            
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }

    private void addCover(Document document, LandedCostResultDto result, PdfDocument pdfDoc, PdfHelper.Fonts fonts, String ref) {
        PdfHelper.drawCoverBackground(pdfDoc);

        Paragraph title = new Paragraph("SMART EXPORT")
            .setFont(fonts.bold)
            .setFontSize(32)
            .setFontColor(PdfTheme.WHITE)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(110)
            .setMarginBottom(6);

        Paragraph subtitle = new Paragraph("Global Maritime Trade")
            .setFont(fonts.regular)
            .setFontSize(14)
            .setFontColor(PdfTheme.SEAFOAM)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(16);

        Paragraph reportTitle = new Paragraph("RAPPORT CALCUL LANDED COST")
            .setFont(fonts.bold)
            .setFontSize(24)
            .setFontColor(PdfTheme.WHITE)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(18);

        document.add(title);
        document.add(subtitle);

        PdfCanvas wave = new PdfCanvas(pdfDoc.getFirstPage());
        Rectangle size = pdfDoc.getFirstPage().getPageSize();
        wave.saveState();
        wave.setStrokeColor(PdfTheme.WAVE_BLUE);
        wave.setLineWidth(2);
        wave.moveTo(80, size.getTop() - 180);
        wave.lineTo(size.getRight() - 80, size.getTop() - 180);
        wave.stroke();
        wave.restoreState();
        wave.release();

        document.add(reportTitle);

        String origin = result.getNomProduit() != null ? result.getNomProduit() : "Produit";
        String dest = result.getPaysDestination() != null ? result.getPaysDestination() : "Destination";
        String routeText = PdfHelper.safeGlyphs(dest);
        PdfHelper.addRouteBox(pdfDoc, routeText, fonts, 67f, 520f, 461f, 55f);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = result.getCalculationDate() != null ? result.getCalculationDate().format(formatter) : "";

        Paragraph meta = new Paragraph()
            .setFont(fonts.regular)
            .setFontSize(11)
            .setFontColor(PdfTheme.SEAFOAM)
            .setTextAlignment(TextAlignment.LEFT)
            .setMarginTop(160)
            .setMarginLeft(70)
            .add("Produit : " + PdfHelper.safeGlyphs(origin) + "\n")
            .add("Code HS : " + PdfHelper.safeGlyphs(result.getCodeHs()) + "\n")
            .add("Incoterm : " + PdfHelper.safeGlyphs(result.getIncoterm()) + "\n")
            .add("Valeur marchandise : " + PdfHelper.safeGlyphs(safeMoney(result.getValeurFob(), result.getCurrency())) + "\n");

        Paragraph refLine = new Paragraph("Ref : " + PdfHelper.safeGlyphs(ref))
            .setFont(fonts.regular)
            .setFontSize(10)
            .setFontColor(PdfTheme.SEAFOAM)
            .setMarginLeft(70)
            .setMarginTop(10);

        Paragraph dateLine = new Paragraph("Genere le : " + PdfHelper.safeGlyphs(formattedDate))
            .setFont(fonts.regular)
            .setFontSize(10)
            .setFontColor(PdfTheme.SEAFOAM)
            .setMarginLeft(70)
            .setMarginTop(2);

        document.add(meta);
        document.add(dateLine);
        document.add(refLine);

        PdfCanvas gold = new PdfCanvas(pdfDoc.getFirstPage());
        gold.saveState();
        gold.setFillColor(PdfTheme.GOLD);
        gold.rectangle(size.getLeft(), size.getBottom(), size.getWidth(), 6);
        gold.fill();
        gold.restoreState();
        gold.release();
    }

    private Cell createHighlightCell(String label, String value) {
        Paragraph pLabel = new Paragraph(label)
            .setFontSize(9)
            .setFontColor(MUTED_TEXT)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(6);

        Paragraph pValue = new Paragraph(value)
            .setFontSize(18)
            .setBold()
            .setFontColor(HEADER_COLOR)
            .setTextAlignment(TextAlignment.CENTER);

        return new Cell()
            .setBackgroundColor(SOFT_BLUE)
            .setPadding(14)
            .add(pLabel)
            .add(pValue);
    }

    private void addExecutiveSummary(Document document, LandedCostResultDto result) {
        Paragraph sectionTitle = new Paragraph("Synthèse")
            .setFontSize(16)
            .setBold()
            .setFontColor(HEADER_COLOR)
            .setMarginBottom(10);
        document.add(sectionTitle);

        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(16);

        addInfoRow(table, "Produit", safe(result.getNomProduit()));
        addInfoRow(table, "Code HS", safe(result.getCodeHs()));
        addInfoRow(table, "Destination", safe(result.getPaysDestination()));
        addInfoRow(table, "Devise", result.getCurrency() != null ? result.getCurrency() : "MAD");
        addInfoRow(table, "Source données", safe(result.getDataSource()));

        if (result.getWarningMessage() != null) {
            addInfoRow(table, "Note", result.getWarningMessage());
        }

        document.add(table);
    }
    
    private void addProductInfo(Document document, LandedCostResultDto result) {
        Paragraph sectionTitle = new Paragraph("Informations Produit")
            .setFontSize(14)
            .setBold()
            .setFontColor(HEADER_COLOR)
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
            .setFontColor(HEADER_COLOR)
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        table.addHeaderCell(createHeaderCell("Description"));
        table.addHeaderCell(createHeaderCell("Montant"));
        
        String currency = result.getCurrency() != null ? result.getCurrency() : "EUR";
        
        addCostRow(table, "Valeur FOB", result.getValeurFob(), currency);
        addCostRow(table, "Transport", result.getCoutTransport(), currency);
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
                .setFontColor(HEADER_COLOR)
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
        Paragraph disclaimer = new Paragraph(result.getDisclaimer() != null ? result.getDisclaimer() : "")
            .setFontSize(9)
            .setItalic()
            .setFontColor(MUTED_TEXT)
            .setMarginTop(12)
            .setMarginBottom(0);
        document.add(disclaimer);
    }

    private String safe(String value) {
        return value != null ? value : "N/A";
    }

    private String safeMoney(BigDecimal amount, String currency) {
        if (amount == null) {
            return "N/A";
        }
        String curr = currency != null ? currency : "MAD";
        return String.format("%.2f %s", amount, curr);
    }

    private static class HeaderFooterAndWatermarkHandler implements IEventHandler {
        private final LandedCostResultDto result;
        private final PdfFont font;

        private HeaderFooterAndWatermarkHandler(LandedCostResultDto result) {
            this.result = result;
            try {
                this.font = PdfFontFactory.createFont();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            PdfDocument pdfDoc = docEvent.getDocument();
            Rectangle pageSize = docEvent.getPage().getPageSize();
            PdfCanvas canvas = new PdfCanvas(docEvent.getPage());

            addWatermark(canvas, pageSize);
            addHeader(canvas, pageSize);
            addFooter(canvas, pageSize, pdfDoc.getPageNumber(docEvent.getPage()), pdfDoc.getNumberOfPages());
        }

        private void addWatermark(PdfCanvas canvas, Rectangle pageSize) {
            PdfExtGState gs = new PdfExtGState();
            gs.setFillOpacity(0.06f);
            canvas.saveState();
            canvas.setExtGState(gs);
            canvas.beginText();
            canvas.setFontAndSize(font, 60);
            canvas.setColor(new DeviceRgb(11, 31, 58), true);
            canvas.moveText(pageSize.getWidth() / 2 - 220, pageSize.getHeight() / 2);
            canvas.setTextMatrix((float) Math.cos(Math.toRadians(35)), (float) Math.sin(Math.toRadians(35)),
                (float) -Math.sin(Math.toRadians(35)), (float) Math.cos(Math.toRadians(35)),
                pageSize.getWidth() / 2 - 220, pageSize.getHeight() / 2);
            canvas.showText("SMART EXPORT");
            canvas.endText();
            canvas.restoreState();
        }

        private void addHeader(PdfCanvas canvas, Rectangle pageSize) {
            canvas.saveState();
            canvas.setColor(new DeviceRgb(11, 31, 58), true);
            canvas.rectangle(pageSize.getLeft(), pageSize.getTop() - 46, pageSize.getWidth(), 46);
            canvas.fill();

            canvas.beginText();
            canvas.setFontAndSize(font, 10);
            canvas.setColor(ColorConstants.WHITE, true);
            canvas.moveText(pageSize.getLeft() + 36, pageSize.getTop() - 28);
            canvas.showText("Smart Export – Landed Cost Report");
            canvas.endText();

            canvas.beginText();
            canvas.setFontAndSize(font, 9);
            canvas.setColor(new DeviceRgb(28, 167, 199), true);
            canvas.moveText(pageSize.getRight() - 220, pageSize.getTop() - 28);
            String sim = result != null && result.getSimulationId() != null ? result.getSimulationId() : "";
            canvas.showText("Simulation: " + sim);
            canvas.endText();
            canvas.restoreState();
        }

        private void addFooter(PdfCanvas canvas, Rectangle pageSize, int pageNumber, int totalPages) {
            canvas.saveState();
            canvas.setColor(new DeviceRgb(240, 240, 240), true);
            canvas.rectangle(pageSize.getLeft(), pageSize.getBottom(), pageSize.getWidth(), 34);
            canvas.fill();

            canvas.beginText();
            canvas.setFontAndSize(font, 8);
            canvas.setColor(new DeviceRgb(120, 120, 120), true);
            canvas.moveText(pageSize.getLeft() + 36, pageSize.getBottom() + 12);
            String source = result != null && result.getExchangeRateSource() != null ? result.getExchangeRateSource() : "";
            canvas.showText("Source taux de change: " + source);
            canvas.endText();

            canvas.beginText();
            canvas.setFontAndSize(font, 8);
            canvas.setColor(new DeviceRgb(120, 120, 120), true);
            canvas.moveText(pageSize.getRight() - 90, pageSize.getBottom() + 12);
            canvas.showText("Page " + pageNumber + "/" + totalPages);
            canvas.endText();
            canvas.restoreState();
        }
    }
    
    private void addLegalIdentifiers(Document document, LandedCostResultDto result) {
        if (result.getNomEntreprise() == null && result.getRegistreCommerce() == null && result.getIce() == null) {
            return;
        }
        
        Paragraph sectionTitle = new Paragraph("Informations Légales")
            .setFontSize(14)
            .setBold()
            .setFontColor(HEADER_COLOR)
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
            .setFontColor(HEADER_COLOR)
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
            .setFontColor(HEADER_COLOR)
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
        
        Paragraph sectionTitle = new Paragraph("Alerte Sécurité Douanière (SIV)")
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
            .setFontColor(HEADER_COLOR)
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
        table.addCell(new Cell().add(new Paragraph(PdfHelper.safeGlyphs(label)).setBold())
            .setBackgroundColor(LIGHT_GRAY));
        table.addCell(new Cell().add(new Paragraph(PdfHelper.safeGlyphs(value != null ? value : "N/A"))));
    }
    
    private void addCostRow(Table table, String description, BigDecimal amount, 
                           String currency) {
        addCostRow(table, description, amount, currency, false);
    }
    
    private void addCostRow(Table table, String description, BigDecimal amount, 
                           String currency, boolean bold) {
        Paragraph descPara = new Paragraph(PdfHelper.safeGlyphs(description));
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
            .add(new Paragraph(PdfHelper.safeGlyphs(text)).setBold().setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(HEADER_COLOR)
            .setTextAlignment(TextAlignment.CENTER);
    }
    
    private void addMaritimeTransportSection(Document document, LandedCostResultDto result) {
        if (result.getMaritimeTransport() == null) {
            return; // Skip if no maritime transport selected
        }
        
        MaritimeTransportCostDto mt = result.getMaritimeTransport();
        
        Paragraph sectionTitle = new Paragraph("Transport Maritime")
            .setFontSize(14)
            .setBold()
            .setMarginTop(15)
            .setMarginBottom(10);
        document.add(sectionTitle);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        // Ship information
        addInfoRow(table, "Navire", mt.getVesselName());
        addInfoRow(table, "MMSI", mt.getVesselMmsi());
        addInfoRow(table, "Poids", mt.getWeightTonnes() + " tonnes");
        addInfoRow(table, "Distance", String.format("%.0f NM (%.0f km)", 
            mt.getDistanceNm(), mt.getDistanceKm()));
        addInfoRow(table, "Délai estimé", mt.getEstimatedDays() + " jours");
        addInfoRow(table, "Source données", mt.getDataSource());
        addInfoRow(table, "Type conteneur", mt.getContainerType() != null ? mt.getContainerType() : "20FT");
        addInfoRow(table, "Incoterm", mt.getIncoterm() != null ? mt.getIncoterm() : "FOB");
        
        document.add(table);
        
        // Cost breakdown
        Paragraph costTitle = new Paragraph("Détail des coûts de transport")
            .setFontSize(12)
            .setBold()
            .setMarginBottom(10);
        document.add(costTitle);
        
        Table costTable = new Table(UnitValue.createPercentArray(new float[]{2, 1}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
        
        addCostRow(costTable, "Fret maritime", mt.getFreightCost(), mt.getCurrency(), false);
        addCostRow(costTable, "Frais port départ", mt.getOriginPortFees(), mt.getCurrency(), false);
        addCostRow(costTable, "Frais port arrivée", mt.getDestPortFees(), mt.getCurrency(), false);
        
        if (mt.getBunkerSurcharge() != null && mt.getBunkerSurcharge().compareTo(BigDecimal.ZERO) > 0) {
            addCostRow(costTable, "Surcharge carburant (BAF)", mt.getBunkerSurcharge(), mt.getCurrency(), false);
        }
        
        if (mt.getCanalFees() != null && mt.getCanalFees().compareTo(BigDecimal.ZERO) > 0) {
            addCostRow(costTable, "Frais canaux", mt.getCanalFees(), mt.getCurrency(), false);
        }
        
        if (mt.getSecuritySurcharge() != null && mt.getSecuritySurcharge().compareTo(BigDecimal.ZERO) > 0) {
            addCostRow(costTable, "Surcharge sécurité", mt.getSecuritySurcharge(), mt.getCurrency(), false);
        }
        
        addCostRow(costTable, "Assurance transport", mt.getInsuranceCost(), mt.getCurrency(), false);
        
        // Add separator
        costTable.addCell(new Cell(1, 2)
            .add(new Paragraph(""))
            .setBorder(null)
            .setHeight(5));
        
        // Total
        addCostRow(costTable, "TOTAL TRANSPORT MARITIME", mt.getTotalCost(), mt.getCurrency(), true);
        
        document.add(costTable);
        
        // Data source note
        if ("CALCULATED".equals(mt.getDataSource()) || "WTO_MFN_ESTIMATED".equals(mt.getDataSource())) {
            Paragraph note = new Paragraph("Note: Coûts estimés basés sur les tarifs moyens du marché. " +
                "Vérifiez avec la compagnie maritime pour les tarifs exacts.")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setItalic()
                .setMarginBottom(15);
            document.add(note);
        }
    }
}
