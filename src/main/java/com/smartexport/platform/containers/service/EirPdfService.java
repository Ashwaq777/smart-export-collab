package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class EirPdfService {

    public String generateEirPdf(
            ContainerTransaction transaction) 
            throws IOException, com.itextpdf.text.DocumentException {
        
        String uploadDir = "uploads/eir/";
        java.nio.file.Path uploadPath = 
            java.nio.file.Paths.get(uploadDir);
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }

        String filename = "EIR_" 
            + transaction.getId() + "_"
            + java.util.UUID.randomUUID()
                .toString().substring(0, 8) 
            + ".pdf";
        String filepath = uploadDir + filename;

        com.itextpdf.text.Document document = 
            new com.itextpdf.text.Document();
        
        try {
            com.itextpdf.text.pdf.PdfWriter.getInstance(
                document,
                new java.io.FileOutputStream(filepath));
            document.open();

            com.itextpdf.text.Font titleFont = 
                new com.itextpdf.text.Font(
                    com.itextpdf.text.Font.FontFamily.HELVETICA,
                    18, com.itextpdf.text.Font.BOLD,
                    new com.itextpdf.text.BaseColor(26, 115, 232));

            com.itextpdf.text.Font headerFont =
                new com.itextpdf.text.Font(
                    com.itextpdf.text.Font.FontFamily.HELVETICA,
                    12, com.itextpdf.text.Font.BOLD);

            com.itextpdf.text.Font normalFont =
                new com.itextpdf.text.Font(
                    com.itextpdf.text.Font.FontFamily.HELVETICA,
                    10);

            com.itextpdf.text.Paragraph title = 
                new com.itextpdf.text.Paragraph(
                    "EQUIPMENT INTERCHANGE RECEIPT (EIR)\n"
                    + "Smart Export Global", titleFont);
            title.setAlignment(
                com.itextpdf.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            com.itextpdf.text.pdf.draw.LineSeparator line =
                new com.itextpdf.text.pdf.draw.LineSeparator();
            document.add(new com.itextpdf.text.Chunk(line));
            document.add(com.itextpdf.text.Chunk.NEWLINE);

            ContainerMatch match = transaction.getMatch();
            ContainerOffer offer = match.getOffer();
            ContainerRequest request = match.getRequest();

            com.itextpdf.text.pdf.PdfPTable table =
                new com.itextpdf.text.pdf.PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(10);

            addTableRow(table, "Transaction ID",
                String.valueOf(transaction.getId()),
                headerFont, normalFont);
            addTableRow(table, "Date de génération",
                java.time.LocalDate.now().toString(),
                headerFont, normalFont);
            addTableRow(table, "Type de conteneur",
                offer.getContainerType().toString(),
                headerFont, normalFont);
            addTableRow(table, "Type de cargaison",
                offer.getCargoType() != null ?
                    offer.getCargoType().toString() : "N/A",
                headerFont, normalFont);
            addTableRow(table, "Provider (Importateur)",
                offer.getProvider().getFirstName() + " "
                + offer.getProvider().getLastName(),
                headerFont, normalFont);
            addTableRow(table, "Localisation offre",
                offer.getLocation(),
                headerFont, normalFont);
            addTableRow(table, "Date disponibilité",
                offer.getAvailableDate().toString(),
                headerFont, normalFont);
            addTableRow(table, "Seeker (Exportateur)",
                request.getSeeker().getFirstName() + " "
                + request.getSeeker().getLastName(),
                headerFont, normalFont);
            addTableRow(table, "Lieu de chargement",
                request.getLoadingLocation(),
                headerFont, normalFont);
            addTableRow(table, "Date requise",
                request.getRequiredDate().toString(),
                headerFont, normalFont);
            addTableRow(table, "Distance",
                String.format("%.0f km",
                    match.getDistanceKm()),
                headerFont, normalFont);
            addTableRow(table, "Score compatibilité",
                String.format("%.0f/100",
                    match.getCompatibilityScore()),
                headerFont, normalFont);
            addTableRow(table, "Statut workflow",
                transaction.getWorkflowStatus().toString(),
                headerFont, normalFont);

            document.add(table);

            com.itextpdf.text.Paragraph footer =
                new com.itextpdf.text.Paragraph(
                    "\nDocument généré automatiquement par "
                    + "Smart Export Global\n"
                    + "© 2026 Smart Export Global — "
                    + "Tous droits réservés",
                    normalFont);
            footer.setAlignment(
                com.itextpdf.text.Element.ALIGN_CENTER);
            document.add(footer);

        } finally {
            document.close();
        }

        log.info("EIR PDF generated: {}", filepath);
        return filepath;
    }

    private void addTableRow(
            com.itextpdf.text.pdf.PdfPTable table,
            String label, String value,
            com.itextpdf.text.Font labelFont,
            com.itextpdf.text.Font valueFont) {

        com.itextpdf.text.pdf.PdfPCell labelCell =
            new com.itextpdf.text.pdf.PdfPCell(
                new com.itextpdf.text.Phrase(
                    label, labelFont));
        labelCell.setBackgroundColor(
            new com.itextpdf.text.BaseColor(240, 244, 255));
        labelCell.setPadding(8);
        table.addCell(labelCell);

        com.itextpdf.text.pdf.PdfPCell valueCell =
            new com.itextpdf.text.pdf.PdfPCell(
                new com.itextpdf.text.Phrase(
                    value, valueFont));
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }
}
