package com.smartexport.platform.pdf.common;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
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
import com.itextpdf.layout.border.Border;
import com.itextpdf.layout.border.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;

public final class PdfHelper {
    private PdfHelper() {}

    public static final class Fonts {
        public final PdfFont regular;
        public final PdfFont bold;

        public Fonts(PdfFont regular, PdfFont bold) {
            this.regular = regular;
            this.bold = bold;
        }
    }

    public static Fonts loadFonts() {
        // Best-effort Unicode: if you add NotoSans TTFs under src/main/resources/fonts/, they will be embedded.
        try {
            PdfFont regular = PdfFontFactory.createFont(
                "fonts/NotoSans-Regular.ttf",
                PdfEncodings.IDENTITY_H,
                PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED
            );
            PdfFont bold = PdfFontFactory.createFont(
                "fonts/NotoSans-Bold.ttf",
                PdfEncodings.IDENTITY_H,
                PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED
            );
            return new Fonts(regular, bold);
        } catch (Exception ignored) {
            // Fallback: standard fonts (avoid special glyphs in text when using this fallback)
            try {
                PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
                return new Fonts(regular, bold);
            } catch (Exception e) {
                throw new RuntimeException("Unable to load PDF fonts", e);
            }
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
        PdfPage page = pdfDoc.getFirstPage();
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
        PdfPage page = pdfDoc.getFirstPage();
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
            canvas.setFillColor(PdfTheme.NAVY_DEEP);
            canvas.setTextMatrix((float) Math.cos(Math.toRadians(35)), (float) Math.sin(Math.toRadians(35)),
                (float) -Math.sin(Math.toRadians(35)), (float) Math.cos(Math.toRadians(35)),
                size.getWidth() / 2 - 220, size.getHeight() / 2);
            canvas.showText("SMART EXPORT");
            canvas.endText();
            canvas.restoreState();
            canvas.release();
        }
    }
}
