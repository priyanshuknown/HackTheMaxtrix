"""Impact Agent — generates PDF impact reports using ReportLab.

On successful transaction completion, creates a professional PDF containing:
- VidyaFund AI branding
- Funder organization name
- Amount disbursed
- Student need category (anonymized — no student name/identity)
- Date funded
- Outcome summary
"""

import uuid
import logging
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)

from app.config import settings

logger = logging.getLogger(__name__)

# Brand colors
INDIGO_PRIMARY = colors.HexColor("#3730A3")
INDIGO_LIGHT = colors.HexColor("#818CF8")
INDIGO_BG = colors.HexColor("#EEF2FF")
SLATE_TEXT = colors.HexColor("#1E293B")
SLATE_MUTED = colors.HexColor("#64748B")

CATEGORY_LABELS = {
    "exam_fee": "Examination Fee",
    "certification_fee": "Professional Certification",
    "device_repair": "Academic Device Repair",
    "interview_travel": "Interview Travel Expenses",
}


def generate_impact_report(
    funder_name: str,
    amount: int,
    category: str,
    transaction_date: datetime | None = None,
    outcome: str | None = None,
) -> str:
    """Generate a PDF impact report and return the file path.

    Args:
        funder_name: Name of the institutional funder
        amount: Amount disbursed in INR
        category: Request category
        transaction_date: When the transaction was completed
        outcome: Optional outcome description

    Returns:
        Relative path to the generated PDF file
    """
    report_id = uuid.uuid4().hex[:12]
    filename = f"impact_report_{report_id}.pdf"
    filepath = Path(settings.REPORTS_DIR) / filename

    # Ensure directory exists
    filepath.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=A4,
        rightMargin=25 * mm,
        leftMargin=25 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=24,
        textColor=INDIGO_PRIMARY,
        spaceAfter=6,
        fontName="Helvetica-Bold",
    )
    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=SLATE_MUTED,
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=INDIGO_PRIMARY,
        spaceBefore=16,
        spaceAfter=8,
        fontName="Helvetica-Bold",
    )
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontSize=11,
        textColor=SLATE_TEXT,
        spaceAfter=6,
        leading=16,
    )
    footer_style = ParagraphStyle(
        "CustomFooter",
        parent=styles["Normal"],
        fontSize=9,
        textColor=SLATE_MUTED,
        alignment=1,  # Center
    )

    if transaction_date is None:
        transaction_date = datetime.utcnow()

    category_label = CATEGORY_LABELS.get(category, category)
    if outcome is None:
        outcome = (
            f"Institutional funding of Rs. {amount:,} was successfully routed to "
            f"support a verified student's {category_label.lower()} needs. "
            "The student's identity remains anonymized to protect privacy."
        )

    # Build document content
    elements = []

    # Header
    elements.append(Paragraph("VidyaFund AI", title_style))
    elements.append(Paragraph("Impact Report — Institutional Student Funding", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=INDIGO_PRIMARY))
    elements.append(Spacer(1, 12))

    # Report metadata
    elements.append(Paragraph("Funding Summary", heading_style))

    table_data = [
        ["Report ID", report_id.upper()],
        ["Funding Institution", funder_name],
        ["Amount Disbursed", f"Rs. {amount:,}"],
        ["Need Category", category_label],
        ["Date Funded", transaction_date.strftime("%B %d, %Y")],
        ["Status", "Successfully Disbursed"],
    ]

    table = Table(table_data, colWidths=[150, 320])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), INDIGO_BG),
                ("TEXTCOLOR", (0, 0), (0, -1), INDIGO_PRIMARY),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("PADDING", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 20))

    # Outcome section
    elements.append(Paragraph("Outcome", heading_style))
    elements.append(Paragraph(outcome, body_style))
    elements.append(Spacer(1, 16))

    # Privacy notice
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    elements.append(Spacer(1, 8))
    elements.append(
        Paragraph(
            "Privacy Notice: Student identity is anonymized in this report. "
            "VidyaFund AI routes institutional funds to verified academic needs "
            "without exposing individual student information to funders.",
            ParagraphStyle(
                "Privacy",
                parent=body_style,
                fontSize=9,
                textColor=SLATE_MUTED,
                borderColor=INDIGO_LIGHT,
                borderWidth=1,
                borderPadding=8,
            ),
        )
    )
    elements.append(Spacer(1, 20))

    # Footer
    elements.append(
        Paragraph(
            f"Generated by VidyaFund AI on {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            footer_style,
        )
    )
    elements.append(
        Paragraph(
            "Institutional Student-Funding Routing Platform",
            footer_style,
        )
    )

    doc.build(elements)
    logger.info(f"Impact report generated: {filepath}")

    return f"/reports/{filename}"
