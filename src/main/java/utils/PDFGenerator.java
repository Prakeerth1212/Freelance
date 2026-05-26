package utils;

import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import dao.ClientDAO;
import dao.InvoiceDAO;
import dao.ProjectDAO;
import dao.TimeLogDAO;
import models.Client;
import models.Invoice;
import models.Project;
import models.TimeLog;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class PDFGenerator {

    private static final Color ACCENT = new DeviceRgb(74, 144, 217);
    private static final Color DARK = new DeviceRgb(45, 45, 45);
    private static final Color LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final Color WHITE = ColorConstants.WHITE;

    private final InvoiceDAO invoiceDAO = new InvoiceDAO();
    private final ProjectDAO projectDAO = new ProjectDAO();
    private final ClientDAO clientDAO = new ClientDAO();
    private final TimeLogDAO timeLogDAO = new TimeLogDAO();

    public String generateInvoice(int invoiceId) throws IOException, SQLException {
        Invoice invoice = invoiceDAO.getById(invoiceId);
        if (invoice == null) {
            throw new IllegalArgumentException("Invoice not found: " + invoiceId);
        }

        Project project = projectDAO.getById(invoice.getProjectId());
        if (project == null) {
            throw new IllegalArgumentException("Project not found for invoice: " + invoiceId);
        }

        Client client = clientDAO.getById(project.getClientId());
        List<TimeLog> timeLogs = timeLogDAO.getByProjectId(project.getId());

        File dir = new File("invoices");
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String filePath = "invoices/invoice_" + invoiceId + ".pdf";

        PdfWriter writer = new PdfWriter(filePath);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        addHeader(document, invoice);
        addClientProjectSection(document, client, project, invoice);
        addTimeLogTable(document, timeLogs, project);
        addTotal(document, invoice);
        addFooter(document);

        document.close();

        return new File(filePath).getAbsolutePath();
    }

    private void addHeader(Document document, Invoice invoice) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        headerTable.setWidth(UnitValue.createPercentValue(100));

        Paragraph brand = new Paragraph("FreelanceHub")
                .setFontSize(28).setBold().setFontColor(ACCENT);
        Cell brandCell = new Cell().add(brand).setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
        headerTable.addCell(brandCell);

        Paragraph invoiceTitle = new Paragraph("INVOICE")
                .setFontSize(26).setBold().setFontColor(DARK)
                .setTextAlignment(TextAlignment.RIGHT);
        Paragraph invoiceNum = new Paragraph("#" + invoice.getInvoiceNumber())
                .setFontSize(11).setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.RIGHT);
        Cell titleCell = new Cell().add(invoiceTitle).add(invoiceNum)
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
        headerTable.addCell(titleCell);

        document.add(headerTable);
        document.add(new Paragraph(" "));
    }

    private void addClientProjectSection(Document document, Client client, Project project, Invoice invoice) {
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}));
        infoTable.setWidth(UnitValue.createPercentValue(100));

        infoTable.addCell(createInfoCell("CLIENT",
                client != null ? client.getName() : "N/A",
                client != null ? client.getEmail() : "",
                client != null ? client.getPhone() : "",
                client != null ? client.getCompany() : ""));

        infoTable.addCell(createInfoCell("PROJECT",
                project.getName(),
                "Rate: $" + project.getHourlyRate().setScale(2, RoundingMode.HALF_UP) + "/hr",
                "Status: " + project.getStatus(),
                ""));

        String statusText = invoice.getStatus();
        boolean isPaid = "Paid".equalsIgnoreCase(statusText);
        Color statusColor = isPaid ? new DeviceRgb(39, 174, 96) : new DeviceRgb(231, 76, 60);
        Paragraph statusPara = new Paragraph("  " + statusText.toUpperCase() + "  ")
                .setFontSize(14).setBold().setFontColor(WHITE)
                .setBackgroundColor(statusColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(5);

        Cell statusCell = new Cell()
                .add(new Paragraph("STATUS").setFontSize(9).setBold().setFontColor(ColorConstants.GRAY))
                .add(statusPara)
                .add(new Paragraph(" "))
                .add(new Paragraph("Issued: " + invoice.getIssuedDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .setFontSize(10).setFontColor(DARK))
                .add(new Paragraph("Due: " + invoice.getDueDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .setFontSize(10).setFontColor(DARK))
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.TOP)
                .setTextAlignment(TextAlignment.CENTER);
        infoTable.addCell(statusCell);

        document.add(infoTable);
        document.add(new Paragraph(" "));
    }

    private Cell createInfoCell(String title, String line1, String line2, String line3, String line4) {
        Cell cell = new Cell().setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.TOP);

        cell.add(new Paragraph(title).setFontSize(9).setBold().setFontColor(ColorConstants.GRAY));
        cell.add(new Paragraph(line1).setFontSize(13).setBold().setFontColor(DARK));
        if (!line2.isEmpty()) {
            cell.add(new Paragraph(line2).setFontSize(10).setFontColor(DARK));
        }
        if (!line3.isEmpty()) {
            cell.add(new Paragraph(line3).setFontSize(10).setFontColor(DARK));
        }
        if (!line4.isEmpty()) {
            cell.add(new Paragraph(line4).setFontSize(10).setFontColor(DARK));
        }

        return cell;
    }

    private void addTimeLogTable(Document document, List<TimeLog> timeLogs, Project project) {
        Paragraph sectionTitle = new Paragraph("TIME LOGS")
                .setFontSize(12).setBold().setFontColor(DARK);
        document.add(sectionTitle);
        document.add(new Paragraph(" "));

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 1, 4, 1.5f}));
        table.setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"Date", "Hours", "Description", "Amount"};
        for (String h : headers) {
            Cell headerCell = new Cell().add(new Paragraph(h).setBold().setFontSize(10).setFontColor(WHITE))
                    .setBackgroundColor(ACCENT)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(6);
            table.addHeaderCell(headerCell);
        }

        BigDecimal totalHours = BigDecimal.ZERO;
        for (TimeLog log : timeLogs) {
            BigDecimal logAmount = log.getHours().multiply(project.getHourlyRate());

            table.addCell(createTableCell(log.getDate().toString()));
            table.addCell(createTableCell(log.getHours().setScale(2, RoundingMode.HALF_UP).toString()));
            table.addCell(createTableCell(log.getDescription() != null ? log.getDescription() : ""));
            table.addCell(createTableCell("$" + logAmount.setScale(2, RoundingMode.HALF_UP)));

            totalHours = totalHours.add(log.getHours());
        }

        Cell emptyLabel = new Cell(1, 2).add(new Paragraph("")).setBorder(Border.NO_BORDER);
        table.addCell(emptyLabel);

        Cell totalHoursLabel = new Cell().add(new Paragraph("Total Hours").setBold().setFontSize(11))
                .setTextAlignment(TextAlignment.RIGHT).setPadding(6).setBorder(Border.NO_BORDER);
        table.addCell(totalHoursLabel);

        Cell totalHoursVal = new Cell().add(new Paragraph(totalHours.setScale(2, RoundingMode.HALF_UP).toString())
                        .setBold().setFontSize(11))
                .setTextAlignment(TextAlignment.CENTER).setPadding(6).setBorder(Border.NO_BORDER);
        table.addCell(totalHoursVal);

        document.add(table);
        document.add(new Paragraph(" "));
    }

    private Cell createTableCell(String text) {
        return new Cell().add(new Paragraph(text).setFontSize(10))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(5);
    }

    private void addTotal(Document document, Invoice invoice) {
        Table totalTable = new Table(UnitValue.createPercentArray(new float[]{1}));
        totalTable.setWidth(UnitValue.createPercentValue(40));
        totalTable.setHorizontalAlignment(HorizontalAlignment.RIGHT);

        boolean isPaid = "Paid".equalsIgnoreCase(invoice.getStatus());

        Paragraph totalLabel = new Paragraph("TOTAL AMOUNT")
                .setFontSize(10).setBold().setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.RIGHT);

        Paragraph totalValue = new Paragraph("$" + invoice.getAmount().setScale(2, RoundingMode.HALF_UP))
                .setFontSize(22).setBold().setFontColor(isPaid ? new DeviceRgb(39, 174, 96) : DARK)
                .setTextAlignment(TextAlignment.RIGHT);

        Cell totalCell = new Cell().add(totalLabel).add(totalValue)
                .setBorder(new SolidBorder(ACCENT, 2))
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(LIGHT_GRAY);

        totalTable.addCell(totalCell);
        document.add(totalTable);
    }

    private void addFooter(Document document) {
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));

        Paragraph dueNotice = new Paragraph("Payment is due within 30 days of the invoice date.")
                .setFontSize(10).setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(dueNotice);

        Paragraph thankYou = new Paragraph("Thank you for your business!")
                .setFontSize(11).setFontColor(DARK)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(thankYou);
    }
}
