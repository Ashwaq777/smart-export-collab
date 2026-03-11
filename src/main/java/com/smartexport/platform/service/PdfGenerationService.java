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
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
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
            
            // Set margins
            document.setMargins(PdfHelper.MARGIN_TOP, PdfHelper.MARGIN_RIGHT, PdfHelper.MARGIN_BOTTOM, PdfHelper.MARGIN_LEFT);

            // Ensure document has at least one page
            if (pdfDoc.getNumberOfPages() == 0) {
                pdfDoc.addNewPage();
            }

            PdfHelper.Fonts fonts = PdfHelper.loadFonts();
            document.setFont(fonts.regular);
            String ref = result.getSimulationId() != null ? "REF-LC-" + PdfHelper.safeGlyphs(result.getSimulationId()) : "REF-LC";
            
            // PAGE 1: Cover
            addCoverPage(document, result, pdfDoc, fonts, ref);
            
            // PAGE 2: Cost Breakdown
            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            addCostBreakdownPage(document, result, fonts);
            
            // PAGE 3: Analysis + QR
            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            addAnalysisPage(document, result, fonts);
            
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }

    private void addCoverPage(Document document, LandedCostResultDto result, PdfDocument pdfDoc, PdfHelper.Fonts fonts, String ref) {
        Rectangle pageSize = pdfDoc.getPage(1).getPageSize();
        
        // Full page navy background
        PdfCanvas background = new PdfCanvas(pdfDoc.getPage(1));
        background.saveState();
        background.setFillColor(PdfHelper.DEEP_NAVY);
        background.rectangle(pageSize.getLeft(), pageSize.getBottom(), pageSize.getWidth(), pageSize.getHeight());
        background.fill();
        background.restoreState();
        background.release();

        // Top decorative gold lines (double line effect at y=750 and y=745)
        PdfCanvas goldLines = new PdfCanvas(pdfDoc.getPage(1));
        goldLines.saveState();
        goldLines.setStrokeColor(PdfHelper.GOLD);
        goldLines.setLineWidth(3);
        goldLines.moveTo(pageSize.getLeft() + 100, 750);
        goldLines.lineTo(pageSize.getRight() - 100, 750);
        goldLines.stroke();
        goldLines.setLineWidth(3);
        goldLines.moveTo(pageSize.getLeft() + 100, 745);
        goldLines.lineTo(pageSize.getRight() - 100, 745);
        goldLines.stroke();
        goldLines.restoreState();
        goldLines.release();

        // Logo area (centered at y=680)
        Paragraph logo = new Paragraph("⚓ SMART EXPORT")
            .setFont(fonts.bold)
            .setFontSize(PdfHelper.FONT_H1)
            .setFontColor(PdfHelper.WHITE)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(680 - 750); // Position relative to top

        Paragraph subtitle = new Paragraph("Global Maritime Trade")
            .setFont(fonts.regular)
            .setFontSize(13)
            .setFontColor(PdfHelper.GOLD)
            .setItalic()
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20);

        document.add(logo);
        document.add(subtitle);

        // Decorative wave line at y=640
        PdfCanvas waveLine = new PdfCanvas(pdfDoc.getPage(1));
        waveLine.saveState();
        waveLine.setStrokeColor(PdfHelper.SUBTITLE_NAVY);
        waveLine.setLineWidth(2);
        waveLine.moveTo(pageSize.getLeft() + 50, 640);
        waveLine.lineTo(pageSize.getRight() - 50, 640);
        waveLine.stroke();
        waveLine.restoreState();
        waveLine.release();

        // Report title box (centered rectangle, y=560 to y=620)
        Table titleTable = new Table(UnitValue.createPercentArray(new float[]{1}))
            .setWidth(UnitValue.createPercentValue(60))
            .setHorizontalAlignment(HorizontalAlignment.CENTER)
            .setMarginTop(560 - 640); // Position relative to wave line

        Cell titleCell = new Cell()
            .add(new Paragraph("RAPPORT LANDED COST")
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_H2)
                .setFontColor(PdfHelper.WHITE)
                .setTextAlignment(TextAlignment.CENTER))
            .add(new Paragraph("Analyse des Coûts à l'Importation")
                .setFont(fonts.regular)
                .setFontSize(10)
                .setFontColor(PdfHelper.GOLD)
                .setTextAlignment(TextAlignment.CENTER))
            .setBorder(new SolidBorder(PdfHelper.GOLD, 1.5f))
            .setPadding(15)
            .setBackgroundColor(PdfHelper.DEEP_NAVY);

        titleTable.addCell(titleCell);
        document.add(titleTable);

        // Info grid (3 boxes side by side, y=460 to y=530)
        document.add(new Paragraph("").setFontSize(20)); // Spacing
        
        Table infoTable = new Table(new float[]{1, 1, 1});
        infoTable.setWidth(UnitValue.createPercentValue(80))
            .setHorizontalAlignment(HorizontalAlignment.CENTER);

        // Box 1: Destination
        String destination = result.getPaysDestination() != null ? result.getPaysDestination() : "N/A";
        Cell destBox = createCoverInfoBox("DESTINATION", destination, fonts);
        infoTable.addCell(destBox);

        // Box 2: Code HS
        String codeHs = result.getCodeHs() != null ? result.getCodeHs() : "N/A";
        Cell hsBox = createCoverInfoBox("CODE HS", codeHs, fonts);
        infoTable.addCell(hsBox);

        // Box 3: Devise
        String currency = result.getCurrency() != null ? result.getCurrency() : "USD";
        Cell currencyBox = createCoverInfoBox("DEVISE", currency, fonts);
        infoTable.addCell(currencyBox);

        document.add(infoTable);

        // Metadata (y=400, centered)
        document.add(new Paragraph("").setFontSize(20)); // Spacing
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedDate = result.getCalculationDate() != null ? result.getCalculationDate().format(formatter) : "";

        Paragraph refLine = new Paragraph("Référence: " + ref)
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_SMALL)
            .setFontColor(PdfHelper.GOLD)
            .setTextAlignment(TextAlignment.CENTER);

        Paragraph dateLine = new Paragraph("Généré le: " + formattedDate)
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_SMALL)
            .setFontColor(new DeviceRgb(136, 153, 170)) // #8899AA
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(30);

        document.add(refLine);
        document.add(dateLine);

        // Bottom decorative bar (full width, y=0 to y=50)
        PdfCanvas bottomBar = new PdfCanvas(pdfDoc.getPage(1));
        bottomBar.saveState();
        bottomBar.setFillColor(PdfHelper.GOLD);
        bottomBar.rectangle(pageSize.getLeft(), pageSize.getBottom(), pageSize.getWidth(), 50);
        bottomBar.fill();
        bottomBar.restoreState();
        bottomBar.release();

        // Bottom bar text
        Paragraph bottomText = new Paragraph("CONFIDENTIEL — USAGE PROFESSIONNEL")
            .setFont(fonts.bold)
            .setFontSize(PdfHelper.FONT_TINY)
            .setFontColor(PdfHelper.WHITE)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(15);

        document.add(bottomText);

        // Footer text
        Paragraph footerText = new Paragraph("Smart Export © 2026 | Page 1/3")
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_TINY)
            .setFontColor(PdfHelper.WHITE)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(5);

        document.add(footerText);
    }

    private Cell createCoverInfoBox(String label, String value, PdfHelper.Fonts fonts) {
        Cell box = new Cell()
            .setPadding(10)
            .setBorder(new SolidBorder(PdfHelper.GOLD, 1))
            .setBackgroundColor(PdfHelper.MID_NAVY)
            .setTextAlignment(TextAlignment.CENTER);

        Paragraph labelPara = new Paragraph(label)
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_TINY)
            .setFontColor(PdfHelper.WHITE);

        Paragraph valuePara = new Paragraph(value)
            .setFont(fonts.bold)
            .setFontSize(13)
            .setFontColor(PdfHelper.WHITE);

        box.add(labelPara);
        box.add(valuePara);
        return box;
    }

    private void addCostBreakdownPage(Document document, LandedCostResultDto result, PdfHelper.Fonts fonts) {
        // Page background is white by default
        
        // TOP HEADER BAR (full width, height 50pt, background #0A1628)
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);

        Cell leftHeader = new Cell()
            .add(new Paragraph("⚓ SMART EXPORT")
                .setFont(fonts.bold)
                .setFontSize(11)
                .setFontColor(PdfHelper.WHITE))
            .setBackgroundColor(PdfHelper.DEEP_NAVY)
            .setBorder(Border.NO_BORDER)
            .setPadding(12);

        Cell rightHeader = new Cell()
            .add(new Paragraph("DÉTAIL DES COÛTS")
                .setFont(fonts.regular)
                .setFontSize(10)
                .setFontColor(PdfHelper.WHITE)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBackgroundColor(PdfHelper.DEEP_NAVY)
            .setBorder(Border.NO_BORDER)
            .setPadding(12);

        headerTable.addCell(leftHeader);
        headerTable.addCell(rightHeader);
        document.add(headerTable);

        // Gold underline bar 2pt below header
        Rectangle pageSize = document.getPdfDocument().getPage(2).getPageSize();
        PdfCanvas goldUnderline = new PdfCanvas(document.getPdfDocument().getPage(2));
        goldUnderline.saveState();
        goldUnderline.setStrokeColor(PdfHelper.GOLD);
        goldUnderline.setLineWidth(2);
        goldUnderline.moveTo(pageSize.getLeft() + PdfHelper.MARGIN_LEFT, pageSize.getTop() - PdfHelper.MARGIN_TOP - 30);
        goldUnderline.lineTo(pageSize.getRight() - PdfHelper.MARGIN_RIGHT, pageSize.getTop() - PdfHelper.MARGIN_TOP - 30);
        goldUnderline.stroke();
        goldUnderline.restoreState();
        goldUnderline.release();

        // SECTION: "Informations Produit"
        document.add(new Paragraph("")
            .setFontSize(15)); // Spacing

        Paragraph productTitle = new Paragraph("Informations Produit")
            .setFont(fonts.bold)
            .setFontSize(PdfHelper.FONT_H4)
            .setFontColor(PdfHelper.DEEP_NAVY)
            .setMarginBottom(10);

        // Gold left border 3pt for section title
        Table titleBorderTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 99.5f}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(10);

        Cell borderCell = new Cell()
            .setBackgroundColor(PdfHelper.GOLD)
            .setWidth(3)
            .setBorder(Border.NO_BORDER);

        Cell titleCell = new Cell()
            .add(productTitle)
            .setBorder(Border.NO_BORDER);

        titleBorderTable.addCell(borderCell);
        titleBorderTable.addCell(titleCell);
        document.add(titleBorderTable);

        // 2-column table for product info
        Table productTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
            .setWidth(UnitValue.createPercentValue(100))
            .setBorder(Border.NO_BORDER);

        addProductInfoRow(productTable, "Produit", result.getNomProduit(), fonts);
        addProductInfoRow(productTable, "Code HS", result.getCodeHs(), fonts);
        addProductInfoRow(productTable, "Destination", result.getPaysDestination(), fonts);
        addProductInfoRow(productTable, "Incoterm", result.getIncoterm(), fonts);

        document.add(productTable);

        // Gold divider line full width
        document.add(new Paragraph("")
            .setFontSize(10)); // Spacing

        PdfCanvas goldDivider = new PdfCanvas(document.getPdfDocument().getPage(2));
        goldDivider.saveState();
        goldDivider.setStrokeColor(PdfHelper.GOLD);
        goldDivider.setLineWidth(1);
        goldDivider.moveTo(pageSize.getLeft() + PdfHelper.MARGIN_LEFT, pageSize.getTop() - PdfHelper.MARGIN_TOP - 150);
        goldDivider.lineTo(pageSize.getRight() - PdfHelper.MARGIN_RIGHT, pageSize.getTop() - PdfHelper.MARGIN_TOP - 150);
        goldDivider.stroke();
        goldDivider.restoreState();
        goldDivider.release();

        // SECTION: "Détail des Coûts"
        document.add(new Paragraph("")
            .setFontSize(10)); // Spacing

        Paragraph costTitle = new Paragraph("Détail des Coûts")
            .setFont(fonts.bold)
            .setFontSize(PdfHelper.FONT_H4)
            .setFontColor(PdfHelper.DEEP_NAVY)
            .setMarginBottom(10);

        // Gold left border 3pt for section title
        Table costTitleBorderTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 99.5f}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(10);

        Cell costBorderCell = new Cell()
            .setBackgroundColor(PdfHelper.GOLD)
            .setWidth(3)
            .setBorder(Border.NO_BORDER);

        Cell costTitleCell = new Cell()
            .add(costTitle)
            .setBorder(Border.NO_BORDER);

        costTitleBorderTable.addCell(costBorderCell);
        costTitleBorderTable.addCell(costTitleCell);
        document.add(costTitleBorderTable);

        // Cost breakdown table
        Table costTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
            .setWidth(UnitValue.createPercentValue(100));

        // Header row: #0A1628 background, white bold 10pt
        costTable.addCell(createCostHeader("Description", fonts));
        costTable.addCell(createCostHeader("Montant", fonts));

        // Alternating rows: white / #F5F7FA
        boolean alternate = false;
        addCostDetailRow(costTable, "Valeur FOB", safeMoney(result.getValeurFob(), result.getCurrency()), fonts, alternate);
        alternate = !alternate;
        addCostDetailRow(costTable, "Coût Transport", safeMoney(result.getCoutTransport(), result.getCurrency()), fonts, alternate);
        alternate = !alternate;
        addCostDetailRow(costTable, "Assurance", safeMoney(result.getAssurance(), result.getCurrency()), fonts, alternate);
        alternate = !alternate;
        addCostDetailRow(costTable, "Droits de Douane", safeMoney(result.getMontantDouane(), result.getCurrency()), fonts, alternate);
        alternate = !alternate;
        addCostDetailRow(costTable, "TVA", safeMoney(result.getMontantTva(), result.getCurrency()), fonts, alternate);
        alternate = !alternate;
        addCostDetailRow(costTable, "Frais Portuaire", safeMoney(result.getFraisPortuaires(), result.getCurrency()), fonts, alternate);

        // SUBTOTAL ROW (Valeur CIF): background #E8F0FE, navy bold
        Cell subtotalDesc = new Cell()
            .add(new Paragraph("Valeur CIF")
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY))
            .setBackgroundColor(PdfHelper.SUBTOTAL_BLUE)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        Cell subtotalValue = new Cell()
            .add(new Paragraph(safeMoney(result.getValeurCaf(), result.getCurrency()))
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBackgroundColor(PdfHelper.SUBTOTAL_BLUE)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        costTable.addCell(subtotalDesc);
        costTable.addCell(subtotalValue);

        // TOTAL ROW: background #C9A84C, white bold 13pt, height 28pt
        Cell totalDesc = new Cell()
            .add(new Paragraph("TOTAL")
                .setFont(fonts.bold)
                .setFontSize(13)
                .setFontColor(PdfHelper.WHITE))
            .setBackgroundColor(PdfHelper.GOLD)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(14);

        Cell totalValue = new Cell()
            .add(new Paragraph(safeMoney(result.getCoutTotal(), result.getCurrency()))
                .setFont(fonts.bold)
                .setFontSize(13)
                .setFontColor(PdfHelper.WHITE)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBackgroundColor(PdfHelper.GOLD)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(14);

        costTable.addCell(totalDesc);
        costTable.addCell(totalValue);

        document.add(costTable);

        // Footer: white background with gold line
        document.add(new Paragraph("")
            .setFontSize(20)); // Spacing

        PdfCanvas footerGoldLine = new PdfCanvas(document.getPdfDocument().getPage(2));
        footerGoldLine.saveState();
        footerGoldLine.setStrokeColor(PdfHelper.GOLD);
        footerGoldLine.setLineWidth(1);
        footerGoldLine.moveTo(pageSize.getLeft() + PdfHelper.MARGIN_LEFT, 80);
        footerGoldLine.lineTo(pageSize.getRight() - PdfHelper.MARGIN_RIGHT, 80);
        footerGoldLine.stroke();
        footerGoldLine.restoreState();
        footerGoldLine.release();

        Paragraph footerText = new Paragraph("Smart Export © 2026 | Page 2/3")
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_TINY)
            .setFontColor(PdfHelper.GRAY_TEXT)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(10);

        document.add(footerText);
    }

    private void addProductInfoRow(Table table, String label, String value, PdfHelper.Fonts fonts) {
        Cell labelCell = new Cell()
            .add(new Paragraph(label)
                .setFont(fonts.regular)
                .setFontSize(PdfHelper.FONT_SMALL)
                .setFontColor(PdfHelper.GRAY_TEXT))
            .setBorder(Border.NO_BORDER)
            .setPaddingBottom(5);

        Cell valueCell = new Cell()
            .add(new Paragraph(value != null ? value : "N/A")
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBorder(Border.NO_BORDER)
            .setPaddingBottom(5);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private Cell createCostHeader(String text, PdfHelper.Fonts fonts) {
        return new Cell()
            .add(new Paragraph(text)
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.WHITE))
            .setBackgroundColor(PdfHelper.DEEP_NAVY)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(10);
    }

    private void addCostDetailRow(Table table, String description, String amount, PdfHelper.Fonts fonts, boolean alternate) {
        Cell descCell = new Cell()
            .add(new Paragraph(description)
                .setFont(fonts.regular)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY))
            .setBackgroundColor(alternate ? PdfHelper.LIGHT_BLUE_ROW : PdfHelper.WHITE)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        Cell amountCell = new Cell()
            .add(new Paragraph(amount != null ? amount : "0.00")
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBackgroundColor(alternate ? PdfHelper.LIGHT_BLUE_ROW : PdfHelper.WHITE)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        table.addCell(descCell);
        table.addCell(amountCell);
    }

    private void addAnalysisPage(Document document, LandedCostResultDto result, PdfHelper.Fonts fonts) {
        // Same header bar as page 2
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);

        Cell leftHeader = new Cell()
            .add(new Paragraph("⚓ SMART EXPORT")
                .setFont(fonts.bold)
                .setFontSize(11)
                .setFontColor(PdfHelper.WHITE))
            .setBackgroundColor(PdfHelper.DEEP_NAVY)
            .setBorder(Border.NO_BORDER)
            .setPadding(12);

        Cell rightHeader = new Cell()
            .add(new Paragraph("ANALYSE DE SENSIBILITÉ")
                .setFont(fonts.regular)
                .setFontSize(10)
                .setFontColor(PdfHelper.WHITE)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBackgroundColor(PdfHelper.DEEP_NAVY)
            .setBorder(Border.NO_BORDER)
            .setPadding(12);

        headerTable.addCell(leftHeader);
        headerTable.addCell(rightHeader);
        document.add(headerTable);

        // Gold underline bar 2pt below header
        Rectangle pageSize = document.getPdfDocument().getPage(3).getPageSize();
        PdfCanvas goldUnderline = new PdfCanvas(document.getPdfDocument().getPage(3));
        goldUnderline.saveState();
        goldUnderline.setStrokeColor(PdfHelper.GOLD);
        goldUnderline.setLineWidth(2);
        goldUnderline.moveTo(pageSize.getLeft() + PdfHelper.MARGIN_LEFT, pageSize.getTop() - PdfHelper.MARGIN_TOP - 30);
        goldUnderline.lineTo(pageSize.getRight() - PdfHelper.MARGIN_RIGHT, pageSize.getTop() - PdfHelper.MARGIN_TOP - 30);
        goldUnderline.stroke();
        goldUnderline.restoreState();
        goldUnderline.release();

        // SECTION: "Analyse de Sensibilité Monétaire"
        document.add(new Paragraph("")
            .setFontSize(15)); // Spacing

        Paragraph analysisTitle = new Paragraph("Analyse de Sensibilité Monétaire")
            .setFont(fonts.bold)
            .setFontSize(PdfHelper.FONT_H4)
            .setFontColor(PdfHelper.DEEP_NAVY)
            .setMarginBottom(10);

        // Gold left border 3pt for section title
        Table titleBorderTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 99.5f}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(10);

        Cell borderCell = new Cell()
            .setBackgroundColor(PdfHelper.GOLD)
            .setWidth(3)
            .setBorder(Border.NO_BORDER);

        Cell titleCell = new Cell()
            .add(analysisTitle)
            .setBorder(Border.NO_BORDER);

        titleBorderTable.addCell(borderCell);
        titleBorderTable.addCell(titleCell);
        document.add(titleBorderTable);

        // Subtitle: italic gray 9pt
        Paragraph subtitle = new Paragraph("Impact d'une variation de ±2% du taux de change")
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_SMALL)
            .setFontColor(PdfHelper.GRAY_TEXT)
            .setItalic()
            .setMarginBottom(15);

        document.add(subtitle);

        // Table 3 columns: Scénario | Variation | Coût Total
        Table sensitivityTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
            .setWidth(UnitValue.createPercentValue(100));

        // Header: #0A1628 white bold
        sensitivityTable.addCell(createCostHeader("Scénario", fonts));
        sensitivityTable.addCell(createCostHeader("Variation", fonts));
        sensitivityTable.addCell(createCostHeader("Coût Total", fonts));

        // Row Optimiste: background #F0FFF4, variation in green #27AE60 bold
        Cell optimisticScenario = new Cell()
            .add(new Paragraph("Scénario Optimiste")
                .setFont(fonts.regular)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY))
            .setBackgroundColor(PdfHelper.LIGHT_GREEN)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        Cell optimisticVariation = new Cell()
            .add(new Paragraph("+2%")
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.GREEN)
                .setTextAlignment(TextAlignment.CENTER))
            .setBackgroundColor(PdfHelper.LIGHT_GREEN)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        Cell optimisticCost = new Cell()
            .add(new Paragraph(safeMoney(result.getCoutTotal() != null ? result.getCoutTotal().multiply(new java.math.BigDecimal("1.02")) : null, result.getCurrency()))
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBackgroundColor(PdfHelper.LIGHT_GREEN)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        sensitivityTable.addCell(optimisticScenario);
        sensitivityTable.addCell(optimisticVariation);
        sensitivityTable.addCell(optimisticCost);

        // Row Pessimiste: background #FFF5F5, variation in red #E74C3C bold
        Cell pessimisticScenario = new Cell()
            .add(new Paragraph("Scénario Pessimiste")
                .setFont(fonts.regular)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY))
            .setBackgroundColor(PdfHelper.LIGHT_RED)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        Cell pessimisticVariation = new Cell()
            .add(new Paragraph("-2%")
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.RED)
                .setTextAlignment(TextAlignment.CENTER))
            .setBackgroundColor(PdfHelper.LIGHT_RED)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        Cell pessimisticCost = new Cell()
            .add(new Paragraph(safeMoney(result.getCoutTotal() != null ? result.getCoutTotal().multiply(new java.math.BigDecimal("0.98")) : null, result.getCurrency()))
                .setFont(fonts.bold)
                .setFontSize(PdfHelper.FONT_BODY)
                .setFontColor(PdfHelper.DEEP_NAVY)
                .setTextAlignment(TextAlignment.RIGHT))
            .setBackgroundColor(PdfHelper.LIGHT_RED)
            .setBorder(new SolidBorder(PdfHelper.BORDER_GRAY, 0.5f))
            .setPadding(11);

        sensitivityTable.addCell(pessimisticScenario);
        sensitivityTable.addCell(pessimisticVariation);
        sensitivityTable.addCell(pessimisticCost);

        document.add(sensitivityTable);

        // QR CODE SECTION (centered)
        document.add(new Paragraph("")
            .setFontSize(20)); // Spacing

        Table qrTable = new Table(UnitValue.createPercentArray(new float[]{1}))
            .setWidth(UnitValue.createPercentValue(40))
            .setHorizontalAlignment(HorizontalAlignment.CENTER);

        Cell qrCell = new Cell()
            .setPadding(15)
            .setBorder(new SolidBorder(PdfHelper.GOLD, 1))
            .setTextAlignment(TextAlignment.CENTER);

        qrCell.add(new Paragraph("QR Code de Vérification")
            .setFont(fonts.bold)
            .setFontSize(PdfHelper.FONT_BODY)
            .setFontColor(PdfHelper.DEEP_NAVY)
            .setMarginBottom(10));

        // Add QR code placeholder
        qrCell.add(new Paragraph("[QR Code]")
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_SMALL)
            .setFontColor(PdfHelper.GRAY_TEXT));

        qrCell.add(new Paragraph("Référence: " + (result.getSimulationId() != null ? result.getSimulationId() : "REF-LC"))
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_SMALL)
            .setFontColor(PdfHelper.GRAY_TEXT)
            .setMarginTop(5));

        qrTable.addCell(qrCell);
        document.add(qrTable);

        // WATERMARK diagonal "SMART EXPORT": very light gray #EEEEEE, 60pt, rotated 45°, centered
        PdfCanvas watermark = new PdfCanvas(document.getPdfDocument().getPage(3));
        watermark.saveState();
        watermark.setFillColor(PdfHelper.WATERMARK_GRAY);
        watermark.beginText();
        watermark.setFontAndSize(fonts.bold, 60);
        watermark.showText("SMART EXPORT");
        watermark.endText();
        watermark.restoreState();
        watermark.release();

        // Footer: same as page 2
        document.add(new Paragraph("")
            .setFontSize(20)); // Spacing

        PdfCanvas footerGoldLine = new PdfCanvas(document.getPdfDocument().getPage(3));
        footerGoldLine.saveState();
        footerGoldLine.setStrokeColor(PdfHelper.GOLD);
        footerGoldLine.setLineWidth(1);
        footerGoldLine.moveTo(pageSize.getLeft() + PdfHelper.MARGIN_LEFT, 80);
        footerGoldLine.lineTo(pageSize.getRight() - PdfHelper.MARGIN_RIGHT, 80);
        footerGoldLine.stroke();
        footerGoldLine.restoreState();
        footerGoldLine.release();

        Paragraph footerText = new Paragraph("Smart Export © 2026 | Page 3/3")
            .setFont(fonts.regular)
            .setFontSize(PdfHelper.FONT_TINY)
            .setFontColor(PdfHelper.GRAY_TEXT)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(10);

        document.add(footerText);
    }

    // Utility methods
    private String safeMoney(java.math.BigDecimal amount, String currency) {
        if (amount == null) return "0.00 " + (currency != null ? currency : "USD");
        return String.format("%.2f %s", amount.doubleValue(), currency != null ? currency : "USD");
    }

    public byte[] generateImportLandedCostPdf(com.smartexport.platform.dto.ImportLandedCostResultDto result) 
            throws java.io.IOException {
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        try {
            // Police
            PdfFont font = PdfFontFactory.createFont("Helvetica");
            
            // Page 1 - Cover + Détail importateur
            addImportCoverPage(document, result, font);
            
            // Page 2 - Tableau des coûts détaillés
            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            addImportCostBreakdownPage(document, result, font);
            
            // Page 3 - Analyse de sensibilité
            document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
            addImportAnalysisPage(document, result, font);
            
        } finally {
            document.close();
        }
        
        return baos.toByteArray();
    }
    
    private void addImportCoverPage(Document document, com.smartexport.platform.dto.ImportLandedCostResultDto result, PdfFont font) {
        // Titre principal
        Paragraph title = new Paragraph("IMPORT COST REPORT")
            .setFont(font)
            .setFontSize(28)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(100);
        document.add(title);
        
        Paragraph subtitle = new Paragraph("Landed Cost Analysis")
            .setFont(font)
            .setFontSize(16)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(10)
            .setFontColor(new DeviceRgb(100, 100, 100));
        document.add(subtitle);
        
        // Bloc méta
        Table metaTable = new Table(3)
            .setWidth(UnitValue.createPercentValue(80))
            .setHorizontalAlignment(HorizontalAlignment.CENTER)
            .setMarginTop(80);
        
        metaTable.addCell(createMetaCell("ORIGINE", result.getReference() != null ? result.getReference().split("-")[0] : "N/A", font));
        metaTable.addCell(createMetaCell("DESTINATION", result.getDevise(), font));
        metaTable.addCell(createMetaCell("CODE HS", "IMPORT", font));
        
        document.add(metaTable);
        
        // Référence
        Paragraph ref = new Paragraph("Référence: " + (result.getReference() != null ? result.getReference() : "N/A"))
            .setFont(font)
            .setFontSize(12)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(50);
        document.add(ref);
    }
    
    private void addImportCostBreakdownPage(Document document, com.smartexport.platform.dto.ImportLandedCostResultDto result, PdfFont font) {
        Paragraph title = new Paragraph("DÉTAIL DES COÛTS D'IMPORTATION")
            .setFont(font)
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(50);
        document.add(title);
        
        // Tableau des coûts
        Table costTable = new Table(3)
            .setWidth(UnitValue.createPercentValue(90))
            .setHorizontalAlignment(HorizontalAlignment.CENTER)
            .setMarginTop(30);
        
        // En-tête
        costTable.addCell(createHeaderCell("LIBELLÉ", font));
        costTable.addCell(createHeaderCell("MONTANT", font));
        costTable.addCell(createHeaderCell("%", font));
        
        // Lignes de coûts
        addCostRow(costTable, "Valeur FOB", result.getValeurFob(), result.getValeurFob(), font, result.getDevise());
        addCostRow(costTable, "Fret maritime", result.getFretMaritime(), result.getValeurFob(), font, result.getDevise());
        addCostRow(costTable, "Assurance", result.getAssurance(), result.getValeurFob(), font, result.getDevise());
        
        // Sous-total CIF
        addSubtotalRow(costTable, "Valeur CIF", result.getValeurCif(), font, result.getDevise());
        
        addCostRow(costTable, "Droits de douane", result.getDroitsDouaneImport(), result.getValeurCif(), font, result.getDevise());
        addCostRow(costTable, "TVA import", result.getTvaImport(), result.getValeurCif(), font, result.getDevise());
        addCostRow(costTable, "Frais portuaires", result.getFraisPortuairesDestination(), result.getValeurCif(), font, result.getDevise());
        addCostRow(costTable, "Autres frais", result.getAutresFrais(), result.getValeurCif(), font, result.getDevise());
        
        // Total
        addTotalRow(costTable, "TOTAL LANDED COST", result.getTotalLandedCost(), font, result.getDevise());
        
        document.add(costTable);
    }
    
    private void addImportAnalysisPage(Document document, com.smartexport.platform.dto.ImportLandedCostResultDto result, PdfFont font) {
        Paragraph title = new Paragraph("ANALYSE DE SENSIBILITÉ")
            .setFont(font)
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(50);
        document.add(title);
        
        // Analyse simplifiée
        Table analysisTable = new Table(2)
            .setWidth(UnitValue.createPercentValue(80))
            .setHorizontalAlignment(HorizontalAlignment.CENTER)
            .setMarginTop(30);
        
        analysisTable.addCell(createHeaderCell("SCÉNARIO", font));
        analysisTable.addCell(createHeaderCell("TOTAL LANDED COST", font));
        
        // Scénario base
        Cell baseScenario = new Cell()
            .add(new Paragraph("Scénario base").setFont(font).setFontSize(12))
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(8);
        analysisTable.addCell(baseScenario);
        
        Cell baseCost = new Cell()
            .add(new Paragraph(safeMoney(result.getTotalLandedCost(), result.getDevise())).setFont(font).setFontSize(12))
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(8);
        analysisTable.addCell(baseCost);
        
        document.add(analysisTable);
    }
    
    private Cell createMetaCell(String label, String value, PdfFont font) {
        Cell cell = new Cell()
            .add(new Paragraph(label).setFont(font).setFontSize(10).setBold())
            .add(new Paragraph(value).setFont(font).setFontSize(12))
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(10)
            .setTextAlignment(TextAlignment.CENTER);
        return cell;
    }
    
    private Cell createHeaderCell(String text, PdfFont font) {
        Cell cell = new Cell()
            .add(new Paragraph(text).setFont(font).setFontSize(12).setBold())
            .setBackgroundColor(new DeviceRgb(50, 50, 50))
            .setFontColor(ColorConstants.WHITE)
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(8)
            .setTextAlignment(TextAlignment.CENTER);
        return cell;
    }
    
    private void addCostRow(Table table, String label, java.math.BigDecimal amount, java.math.BigDecimal base, PdfFont font, String currency) {
        table.addCell(new Cell()
            .add(new Paragraph(label).setFont(font).setFontSize(11))
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(6));
        
        table.addCell(new Cell()
            .add(new Paragraph(safeMoney(amount, currency)).setFont(font).setFontSize(11))
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(6));
        
        java.math.BigDecimal percentage = base != null && base.compareTo(java.math.BigDecimal.ZERO) > 0 
            ? amount.divide(base, 4, java.math.RoundingMode.HALF_UP).multiply(java.math.BigDecimal.valueOf(100))
            : java.math.BigDecimal.ZERO;
        
        table.addCell(new Cell()
            .add(new Paragraph(String.format("%.2f%%", percentage.doubleValue())).setFont(font).setFontSize(11))
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(6));
    }
    
    private void addSubtotalRow(Table table, String label, java.math.BigDecimal amount, PdfFont font, String currency) {
        table.addCell(new Cell()
            .add(new Paragraph(label).setFont(font).setFontSize(11).setBold())
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(6));
        
        table.addCell(new Cell()
            .add(new Paragraph(safeMoney(amount, currency)).setFont(font).setFontSize(11).setBold())
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(6));
        
        table.addCell(new Cell()
            .add(new Paragraph("").setFont(font).setFontSize(11))
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(6));
    }
    
    private void addTotalRow(Table table, String label, java.math.BigDecimal amount, PdfFont font, String currency) {
        table.addCell(new Cell()
            .add(new Paragraph(label).setFont(font).setFontSize(12).setBold())
            .setBackgroundColor(new DeviceRgb(0, 0, 0))
            .setFontColor(ColorConstants.WHITE)
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(8));
        
        table.addCell(new Cell()
            .add(new Paragraph(safeMoney(amount, currency)).setFont(font).setFontSize(12).setBold())
            .setBackgroundColor(new DeviceRgb(0, 0, 0))
            .setFontColor(ColorConstants.WHITE)
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(8));
        
        table.addCell(new Cell()
            .add(new Paragraph("").setFont(font).setFontSize(12))
            .setBackgroundColor(new DeviceRgb(0, 0, 0))
            .setFontColor(ColorConstants.WHITE)
            .setBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .setPadding(8));
    }
}
