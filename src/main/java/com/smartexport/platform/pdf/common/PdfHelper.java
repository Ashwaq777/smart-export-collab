package com.smartexport.platform.pdf.common;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;

import java.io.InputStream;

public final class PdfHelper {
    private PdfHelper() {}

    // Maritime theme color palette
    public static final DeviceRgb DEEP_NAVY = new DeviceRgb(10, 22, 40);      // #0A1628
    public static final DeviceRgb MID_NAVY = new DeviceRgb(15, 32, 64);        // #0F2040
    public static final DeviceRgb SUBTITLE_NAVY = new DeviceRgb(30, 58, 95);   // #1E3A5F
    public static final DeviceRgb GOLD = new DeviceRgb(201, 168, 76);          // #C9A84C
    public static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);
    public static final DeviceRgb LIGHT_BLUE_ROW = new DeviceRgb(245, 247, 250); // #F5F7FA
    public static final DeviceRgb GRAY_TEXT = new DeviceRgb(107, 114, 128);    // #6B7280
    public static final DeviceRgb BORDER_GRAY = new DeviceRgb(224, 224, 224);  // #E0E0E0
    public static final DeviceRgb GREEN = new DeviceRgb(39, 174, 96);          // #27AE60
    public static final DeviceRgb RED = new DeviceRgb(231, 76, 60);            // #E74C3C
    public static final DeviceRgb LIGHT_GRAY = new DeviceRgb(240, 240, 240);  // #F0F0F0
    public static final DeviceRgb SUBTOTAL_BLUE = new DeviceRgb(232, 240, 254); // #E8F0FE
    public static final DeviceRgb LIGHT_GREEN = new DeviceRgb(240, 255, 244);  // #F0FFF4
    public static final DeviceRgb LIGHT_RED = new DeviceRgb(255, 245, 245);    // #FFF5F5
    public static final DeviceRgb WATERMARK_GRAY = new DeviceRgb(238, 238, 238); // #EEEEEE

    // Typography constants
    public static final float FONT_H1 = 38f;
    public static final float FONT_H2 = 20f;
    public static final float FONT_H3 = 14f;
    public static final float FONT_H4 = 12f;
    public static final float FONT_BODY = 10f;
    public static final float FONT_SMALL = 9f;
    public static final float FONT_TINY = 8f;

    // Layout constants
    public static final float MARGIN_TOP = 60f;
    public static final float MARGIN_BOTTOM = 50f;
    public static final float MARGIN_LEFT = 45f;
    public static final float MARGIN_RIGHT = 45f;
    public static final float LINE_HEIGHT = 1.5f;

    public static final class Fonts {
        public final PdfFont regular;
        public final PdfFont bold;

        public Fonts(PdfFont regular, PdfFont bold) {
            this.regular = regular;
            this.bold = bold;
        }
    }

    public static Fonts loadFonts() {
        try {
            InputStream regularStream = PdfHelper.class.getClassLoader()
                .getResourceAsStream("fonts/NotoSans-Regular.ttf");
            InputStream boldStream = PdfHelper.class.getClassLoader()
                .getResourceAsStream("fonts/NotoSans-Bold.ttf");

            if (regularStream != null && boldStream != null) {
                PdfFont regular = PdfFontFactory.createFont(
                    regularStream.readAllBytes(),
                    PdfEncodings.IDENTITY_H,
                    PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED
                );
                PdfFont bold = PdfFontFactory.createFont(
                    boldStream.readAllBytes(),
                    PdfEncodings.IDENTITY_H,
                    PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED
                );
                return new Fonts(regular, bold);
            }
        } catch (Exception ignored) {}

        // Fallback to standard fonts — always works, no files needed
        try {
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            return new Fonts(regular, bold);
        } catch (Exception e) {
            throw new RuntimeException("Unable to load PDF fonts", e);
        }
    }

    public static String safeGlyphs(String s) {
        if (s == null) return "";
        // Replace problematic glyphs with safe ASCII equivalents.
        return s
            .replace('→', '>')
            .replace('➜', '>')
            .replace('►', '>')
            .replace('–', '-')
            .replace('—', '-')
            .replace("⚓", "")
            .replace("⚠", "")
            .replace("️", "");
    }

    public static Table sectionTitle(String icon, String title, Fonts fonts) {
        Table bar = new Table(new float[]{28f, 510f});
        bar.setWidth(UnitValue.createPercentValue(100))
            .setMarginTop(18)
            .setMarginBottom(8);

        bar.addCell(new Cell()
            .add(new Paragraph(safeGlyphs(icon)).setFont(fonts.bold).setFontSize(12)
                .setFontColor(PdfTheme.WHITE)
                .setTextAlignment(TextAlignment.CENTER))
            .setBackgroundColor(PdfTheme.OCEAN_BLUE)
            .setPadding(7)
            .setBorder(Border.NO_BORDER));

        bar.addCell(new Cell()
            .add(new Paragraph(safeGlyphs(title)).setFont(fonts.bold).setFontSize(12)
                .setFontColor(PdfTheme.NAVY_DEEP))
            .setBackgroundColor(PdfTheme.SEAFOAM)
            .setPaddingLeft(14)
            .setPaddingTop(7)
            .setPaddingBottom(7)
            .setBorderLeft(new SolidBorder(PdfTheme.OCEAN_BLUE, 3))
            .setBorderTop(Border.NO_BORDER)
            .setBorderRight(Border.NO_BORDER)
            .setBorderBottom(Border.NO_BORDER));

        return bar;
    }

    public static Cell headerCell(String text, Fonts fonts) {
        return new Cell()
            .add(new Paragraph(safeGlyphs(text)).setFont(fonts.bold).setFontSize(9).setFontColor(PdfTheme.WHITE))
            .setBackgroundColor(PdfTheme.OCEAN_BLUE)
            .setPadding(8)
            .setBorder(new SolidBorder(PdfTheme.NAVY_DEEP, 0.5f));
    }

    public static Cell dataCell(String text, boolean alternate, Fonts fonts) {
        return new Cell()
            .add(new Paragraph(safeGlyphs(text)).setFont(fonts.regular).setFontSize(9).setFontColor(PdfTheme.TEXT_DARK))
            .setBackgroundColor(alternate ? PdfTheme.LIGHT_ROW : PdfTheme.WHITE)
            .setPadding(8)
            .setBorder(new SolidBorder(PdfTheme.BORDER, 0.3f));
    }

    public static void drawCoverBackground(PdfDocument pdfDoc) {
        PdfPage page = pdfDoc.getPage(Math.max(1, pdfDoc.getNumberOfPages()));
        Rectangle size = page.getPageSize();
        PdfCanvas canvas = new PdfCanvas(page);
        canvas.saveState();
        canvas.setFillColor(PdfTheme.NAVY_DEEP);
        canvas.rectangle(size.getLeft(), size.getBottom(), size.getWidth(), size.getHeight());
        canvas.fill();
        canvas.restoreState();
        canvas.release();
    }

    public static void addRouteBox(PdfDocument pdfDoc, String text, Fonts fonts, float x, float y, float w, float h) {
        PdfPage page = pdfDoc.getPage(Math.max(1, pdfDoc.getNumberOfPages()));
        PdfCanvas canvas = new PdfCanvas(page);
        canvas.saveState();
        canvas.setFillColor(PdfTheme.OCEAN_BLUE);
        canvas.roundRectangle(x, y, w, h, 10);
        canvas.fill();
        canvas.restoreState();
        canvas.release();

        String routeText = safeGlyphs(text);
        float fontSize = 18f;
        float maxWidth = w - 20f;
        while (fontSize > 10f) {
            float textWidth = fonts.bold.getWidth(routeText, fontSize);
            if (textWidth <= maxWidth) break;
            fontSize -= 0.5f;
        }

        new Canvas(page, new Rectangle(x, y, w, h))
            .add(new Paragraph(routeText)
                .setFont(fonts.bold)
                .setFontSize(fontSize)
                .setFontColor(PdfTheme.WHITE)
                .setTextAlignment(TextAlignment.CENTER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setMargin(0)
                .setPadding(0))
            .close();
    }

    public static class HeaderFooterHandler implements IEventHandler {
        private final String reportType;
        private final String ref;
        private final Fonts fonts;

        public HeaderFooterHandler(String reportType, String ref, Fonts fonts) {
            this.reportType = safeGlyphs(reportType);
            this.ref = safeGlyphs(ref);
            this.fonts = fonts;
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            PdfDocument pdfDoc = docEvent.getDocument();
            PdfPage page = docEvent.getPage();
            int pageNum = pdfDoc.getPageNumber(page);
            Rectangle pageSize = page.getPageSize();

            // Header (skip cover)
            if (pageNum > 1) {
                PdfCanvas canvas = new PdfCanvas(page);
                canvas.saveState();
                canvas.setFillColor(PdfTheme.NAVY_DEEP);
                canvas.rectangle(pageSize.getLeft(), pageSize.getTop() - 52, pageSize.getWidth(), 52);
                canvas.fill();

                canvas.setFillColor(PdfTheme.GOLD);
                canvas.rectangle(pageSize.getLeft(), pageSize.getTop() - 54, pageSize.getWidth(), 2);
                canvas.fill();
                canvas.restoreState();
                canvas.release();

                new Canvas(page, new Rectangle(pageSize.getLeft(), pageSize.getTop() - 52, pageSize.getWidth(), 52))
                    .add(new Paragraph("SMART EXPORT  |  " + reportType)
                        .setFont(fonts.regular)
                        .setFontSize(10)
                        .setFontColor(PdfTheme.WHITE)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginTop(18)
                        .setMarginBottom(0))
                    .close();
            }

            // Footer (all pages)
            PdfCanvas footerCanvas = new PdfCanvas(page);
            footerCanvas.saveState();
            footerCanvas.setStrokeColor(PdfTheme.WAVE_BLUE);
            footerCanvas.setLineWidth(0.8f);
            footerCanvas.moveTo(pageSize.getLeft() + 50, pageSize.getBottom() + 40);
            footerCanvas.lineTo(pageSize.getRight() - 50, pageSize.getBottom() + 40);
            footerCanvas.stroke();
            footerCanvas.restoreState();
            footerCanvas.release();

            new Canvas(page, new Rectangle(pageSize.getLeft() + 50, pageSize.getBottom() + 12, pageSize.getWidth() - 100, 22))
                .add(new Paragraph("Smart Export © 2026  |  " + reportType + "  |  Page " + pageNum + "/" + pdfDoc.getNumberOfPages() + "  |  Ref: " + ref)
                    .setFont(fonts.regular)
                    .setFontSize(8)
                    .setFontColor(PdfTheme.TEXT_MUTED)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMargin(0))
                .close();
        }
    }

    public static void addWatermark(PdfDocument pdfDoc, Fonts fonts) {
        // Light watermark on inner pages only
        for (int i = 2; i <= pdfDoc.getNumberOfPages(); i++) {
            PdfPage page = pdfDoc.getPage(i);
            Rectangle size = page.getPageSize();
            PdfCanvas canvas = new PdfCanvas(page);
            PdfExtGState gs = new PdfExtGState();
            gs.setFillOpacity(0.06f);
            canvas.saveState();
            canvas.setExtGState(gs);
            canvas.beginText();
            canvas.setFontAndSize(fonts.bold, 60);
            canvas.setFillColor(GRAY_TEXT);
            canvas.setTextMatrix((float) Math.cos(Math.toRadians(45)), (float) Math.sin(Math.toRadians(45)),
                (float) -Math.sin(Math.toRadians(45)), (float) Math.cos(Math.toRadians(45)),
                size.getWidth() / 2 - 220, size.getHeight() / 2);
            canvas.showText("SMART EXPORT");
            canvas.endText();
            canvas.restoreState();
            canvas.release();
        }
    }
}
