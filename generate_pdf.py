#!/usr/bin/env python3
"""Generate NARU's POS Quotation PDF"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
import os

# Colors
BRAND = HexColor("#ea580c")
BRAND_LIGHT = HexColor("#fff7ed")
DARK = HexColor("#1a1a2e")
DARK2 = HexColor("#0f3460")
GRAY50 = HexColor("#fafafa")
GRAY100 = HexColor("#f5f5f5")
GRAY200 = HexColor("#e5e5e5")
GRAY300 = HexColor("#d4d4d4")
GRAY400 = HexColor("#a3a3a3")
GRAY500 = HexColor("#737373")
GRAY600 = HexColor("#525252")
GRAY800 = HexColor("#262626")
GREEN_BG = HexColor("#dcfce7")
GREEN_TEXT = HexColor("#16a34a")
ORANGE_HIGHLIGHT = HexColor("#fb923c")

OUTPUT = "/Users/avinashsingh/Documents/narus-pos/NARU_POS_Quotation.pdf"

W, H = A4  # 595.27 x 841.89 points
MARGIN = 48

styles = getSampleStyleSheet()

# Custom styles
s_title = ParagraphStyle('DocTitle', fontName='Helvetica-Bold', fontSize=18, textColor=BRAND, alignment=TA_RIGHT, leading=20, spaceAfter=8)
s_company = ParagraphStyle('Company', fontName='Helvetica-Bold', fontSize=18, textColor=DARK, spaceAfter=1)
s_subtitle = ParagraphStyle('SubTitle', fontName='Helvetica', fontSize=9, textColor=GRAY500)
s_meta = ParagraphStyle('Meta', fontName='Helvetica', fontSize=9, textColor=GRAY500, alignment=TA_RIGHT, leading=14)
s_section = ParagraphStyle('Section', fontName='Helvetica-Bold', fontSize=10, textColor=BRAND, spaceAfter=10, spaceBefore=20, leading=14)
s_label = ParagraphStyle('Label', fontName='Helvetica-Bold', fontSize=8, textColor=GRAY400, spaceAfter=4)
s_value = ParagraphStyle('Value', fontName='Helvetica-Bold', fontSize=12, textColor=GRAY800, spaceAfter=2)
s_detail = ParagraphStyle('Detail', fontName='Helvetica', fontSize=9, textColor=GRAY500, leading=13)
s_body = ParagraphStyle('Body', fontName='Helvetica', fontSize=10, textColor=GRAY600, leading=15)
s_bold_body = ParagraphStyle('BoldBody', fontName='Helvetica-Bold', fontSize=10, textColor=GRAY800, leading=15)
s_scope_title = ParagraphStyle('ScopeTitle', fontName='Helvetica-Bold', fontSize=10, textColor=GRAY800, spaceAfter=2)
s_scope_desc = ParagraphStyle('ScopeDesc', fontName='Helvetica', fontSize=8.5, textColor=GRAY500, leading=12)
s_small = ParagraphStyle('Small', fontName='Helvetica', fontSize=7.5, textColor=GRAY400, leading=11)
s_term_label = ParagraphStyle('TermLabel', fontName='Helvetica-Bold', fontSize=7.5, textColor=GRAY400, spaceAfter=4)
s_term_value = ParagraphStyle('TermValue', fontName='Helvetica-Bold', fontSize=12, textColor=GRAY800, spaceAfter=4)
s_term_note = ParagraphStyle('TermNote', fontName='Helvetica', fontSize=8.5, textColor=GRAY500, leading=13)
s_footer = ParagraphStyle('Footer', fontName='Helvetica', fontSize=8, textColor=GRAY400, leading=12)
s_footer_bold = ParagraphStyle('FooterBold', fontName='Helvetica-Bold', fontSize=8, textColor=GRAY600)
s_sig = ParagraphStyle('Sig', fontName='Helvetica', fontSize=7.5, textColor=GRAY400, alignment=TA_RIGHT)
s_pricing_label = ParagraphStyle('PricingLabel', fontName='Helvetica-Bold', fontSize=9, textColor=HexColor("#ffffff99"))
s_pricing_amount = ParagraphStyle('PricingAmount', fontName='Helvetica-Bold', fontSize=32, textColor=white, leading=36)
s_pricing_sub = ParagraphStyle('PricingSub', fontName='Helvetica', fontSize=16, textColor=HexColor("#ffffffaa"))
s_pricing_note = ParagraphStyle('PricingNote', fontName='Helvetica', fontSize=9, textColor=HexColor("#ffffff77"))
s_pricing_detail = ParagraphStyle('PricingDetail', fontName='Helvetica', fontSize=10, textColor=HexColor("#ffffffcc"), alignment=TA_RIGHT, leading=16)
s_pricing_highlight = ParagraphStyle('PricingHighlight', fontName='Helvetica-Bold', fontSize=9, textColor=ORANGE_HIGHLIGHT, alignment=TA_RIGHT)
s_tech = ParagraphStyle('Tech', fontName='Helvetica-Bold', fontSize=9, textColor=GRAY600, alignment=TA_CENTER)
s_check = ParagraphStyle('Check', fontName='Helvetica-Bold', fontSize=10, textColor=GREEN_TEXT)


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=36
    )
    story = []
    usable_w = W - 2 * MARGIN

    # ===== HEADER =====
    logo_para = Paragraph("N", ParagraphStyle('Logo', fontName='Helvetica-Bold', fontSize=18, textColor=white, alignment=TA_CENTER))
    company_para = Paragraph("NARU's POS", s_company)
    sub_para = Paragraph("Restaurant Management System", s_subtitle)
    title_para = Paragraph("QUOTATION", s_title)
    meta_para = Paragraph("Date: April 14, 2026<br/>Ref: NARU-POS-2026-001<br/>Valid until: May 14, 2026", s_meta)

    left_content = Table(
        [[logo_para, Table([[company_para], [sub_para]], colWidths=[200])]],
        colWidths=[42, 200]
    )
    left_content.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), BRAND),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, 0), 0),
        ('RIGHTPADDING', (0, 0), (0, 0), 10),
        ('TOPPADDING', (0, 0), (0, 0), 10),
        ('BOTTOMPADDING', (0, 0), (0, 0), 10),
        ('LEFTPADDING', (1, 0), (1, 0), 10),
        ('TOPPADDING', (1, 0), (1, 0), 0),
        ('BOTTOMPADDING', (1, 0), (1, 0), 0),
    ]))

    right_content = Table([[title_para], [Spacer(1, 6)], [meta_para]], colWidths=[usable_w * 0.45])
    right_content.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    header = Table([[left_content, right_content]], colWidths=[usable_w * 0.55, usable_w * 0.45])
    header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(header)

    # Orange line
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=3, color=BRAND, spaceAfter=6))

    # ===== PROJECT DETAILS =====
    story.append(section_title("PROJECT DETAILS"))
    col_w = (usable_w - 16) / 2

    left_box = info_box("PREPARED FOR", "NARU's Biryani & Kababs", "Restaurant POS & Management System", col_w)
    right_box = info_box("PROJECT SUMMARY", "Complete POS + Admin System", "Web App + iOS App + Android App with cloud database, real-time multi-device sync, and owner analytics dashboard", col_w)

    info_table = Table([[left_box, right_box]], colWidths=[col_w + 8, col_w + 8])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)

    # ===== INVESTMENT =====
    story.append(section_title("INVESTMENT"))

    pricing_left = Table([
        [Paragraph("TOTAL PROJECT COST", s_pricing_label)],
        [Paragraph("<b>Rs 55,000</b> <font size=16 color='#ffffffaa'>- Rs 60,000</font>", s_pricing_amount)],
        [Paragraph("One-time development cost", s_pricing_note)],
    ], colWidths=[usable_w * 0.52])
    pricing_left.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))

    pricing_right = Table([
        [Paragraph("Estimated Delivery: <b>2 Weeks</b>", s_pricing_detail)],
        [Paragraph("Platforms: <b>Web + iOS + Android</b>", s_pricing_detail)],
        [Paragraph("Hosting: <b>GitHub Pages (Free)</b>", s_pricing_detail)],
        [Spacer(1, 4)],
        [Paragraph("Zero Monthly Costs", s_pricing_highlight)],
    ], colWidths=[usable_w * 0.40])
    pricing_right.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))

    pricing_table = Table([[pricing_left, pricing_right]], colWidths=[usable_w * 0.55, usable_w * 0.45])
    pricing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK),
        ('ROUNDEDCORNERS', [12, 12, 12, 12]),
        ('TOPPADDING', (0, 0), (-1, -1), 20),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
        ('LEFTPADDING', (0, 0), (0, 0), 28),
        ('RIGHTPADDING', (-1, 0), (-1, 0), 28),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(pricing_table)

    # ===== SCOPE OF WORK =====
    story.append(section_title("SCOPE OF WORK"))

    scopes = [
        ("1", "POS Billing System", "Touch-optimized menu grid, category filters, Half/Full portions, order management, Cash/Card/UPI payments, KOT printing"),
        ("2", "Order Management", "Track all orders, filter by status, hold & resume orders, real-time sync across 3-5 billing counters"),
        ("3", "Menu & Operations (Owner)", "Add/edit/delete menu items, manage categories, create discount coupons, toggle item availability"),
        ("4", "Admin Dashboard (Owner)", "Revenue analytics, top-selling items, payment breakdown, daily/weekly/monthly/quarterly comparisons"),
        ("5", "Discounts & Coupons", "Percentage & fixed discounts, coupon code system, auto-applied offers with min order & expiry rules"),
        ("6", "Mobile Apps (iOS + Android)", "Native mobile apps for tablets (billing counter) and phones (owner monitoring), published to App Store & Play Store"),
    ]

    scope_rows = []
    for i in range(0, len(scopes), 2):
        left = scope_cell(scopes[i], col_w)
        right = scope_cell(scopes[i+1], col_w) if i+1 < len(scopes) else ""
        scope_rows.append([left, right])

    scope_table = Table(scope_rows, colWidths=[col_w + 8, col_w + 8])
    scope_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(scope_table)

    # ===== WHAT'S INCLUDED =====
    story.append(section_title("WHAT'S INCLUDED"))

    inclusions = [
        ("<b>3 platforms</b> -- Web app + iOS app + Android app",),
        ("<b>Cloud database setup</b> (Supabase) with real-time sync across all devices",),
        ("<b>Role-based access</b> -- Staff PIN login for billing, Owner email/password for admin",),
        ("<b>47 menu items pre-loaded</b> with your actual restaurant menu (12 categories)",),
        ("<b>Production deployment</b> to GitHub Pages (web) + App Store + Play Store submission",),
        ("<b>15 days post-launch support</b> for bug fixes and minor adjustments",),
        ("<b>New feature requests</b> are chargeable based on the scope and complexity of the feature",),
    ]

    inc_rows = []
    for item in inclusions:
        check = Paragraph("<font color='#16a34a'><b>&#10003;</b></font>", ParagraphStyle('C', fontSize=10, alignment=TA_CENTER))
        text = Paragraph(item[0], s_body)
        inc_rows.append([check, text])

    inc_table = Table(inc_rows, colWidths=[24, usable_w - 24])
    inc_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, GRAY100),
    ]))
    story.append(inc_table)

    # ===== TECHNOLOGY STACK =====
    story.append(section_title("TECHNOLOGY STACK"))
    techs = ["React 18", "TypeScript", "Tailwind CSS", "Supabase (PostgreSQL)", "Capacitor (Mobile)", "GitHub Pages (Hosting)", "Recharts (Analytics)"]
    tech_cells = [Paragraph(t, s_tech) for t in techs]

    # 4 columns first row, 3 columns second row
    row1 = tech_cells[:4]
    row2 = tech_cells[4:] + [""]

    tech_col_w = (usable_w - 30) / 4
    tech_table = Table([row1, row2], colWidths=[tech_col_w + 10] * 4)
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY50),
        ('BOX', (0, 0), (0, 0), 0.5, GRAY200),
        ('BOX', (1, 0), (1, 0), 0.5, GRAY200),
        ('BOX', (2, 0), (2, 0), 0.5, GRAY200),
        ('BOX', (3, 0), (3, 0), 0.5, GRAY200),
        ('BOX', (0, 1), (0, 1), 0.5, GRAY200),
        ('BOX', (1, 1), (1, 1), 0.5, GRAY200),
        ('BOX', (2, 1), (2, 1), 0.5, GRAY200),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(tech_table)

    # ===== TERMS =====
    story.append(section_title("TERMS"))

    term_col_w = (usable_w - 20) / 3
    t1 = term_box("PAYMENT", "Milestone Based", "30% advance to start\n40% on mid-delivery\n30% on final handover", term_col_w)
    t2 = term_box("DELIVERY", "2 Weeks", "First demo in Week 1\nFull delivery by Week 2\nMobile apps by Week 3*", term_col_w)
    t3 = term_box("MONTHLY COSTS", "Rs 0", "Supabase Free Tier: Rs 0\nGitHub Pages Hosting: Rs 0\nDomain (optional): ~Rs 800/yr", term_col_w)

    terms_table = Table([[t1, t2, t3]], colWidths=[term_col_w + 6] * 3)
    terms_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(terms_table)

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "* App Store annual fee (Rs 8,300) and Play Store one-time fee (Rs 2,100) are paid directly by the client to Apple/Google. This quotation is valid for 30 days from the date of issue.",
        s_small
    ))

    # ===== FOOTER =====
    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY200, spaceAfter=12))

    footer_left = Paragraph("<b>NARU's POS</b> -- Restaurant Management System<br/>Quotation Ref: NARU-POS-2026-001 | April 14, 2026", s_footer)
    sig_line = Table(
        [[Spacer(1, 30)], [Paragraph("AUTHORIZED SIGNATURE", s_sig)]],
        colWidths=[160]
    )
    sig_line.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (0, 0), 0.5, GRAY300),
        ('TOPPADDING', (0, 1), (0, 1), 4),
    ]))

    footer_table = Table([[footer_left, sig_line]], colWidths=[usable_w * 0.55, usable_w * 0.45])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
    ]))
    story.append(footer_table)

    # Build
    doc.build(story)
    print(f"PDF generated: {OUTPUT}")


# ===== HELPER FUNCTIONS =====

def section_title(text):
    return KeepTogether([
        Spacer(1, 16),
        Paragraph(text, s_section),
        HRFlowable(width="100%", thickness=0.5, color=GRAY200, spaceAfter=10),
    ])


def info_box(label, value, detail, width):
    t = Table([
        [Paragraph(label, s_label)],
        [Paragraph(value, s_value)],
        [Paragraph(detail, s_detail)],
    ], colWidths=[width - 24])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY50),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY200),
        ('TOPPADDING', (0, 0), (0, 0), 14),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (-1, -1), (-1, -1), 14),
        ('TOPPADDING', (0, 1), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (0, 1), 2),
    ]))
    return t


def scope_cell(scope_data, width):
    num, name, desc = scope_data
    num_para = Paragraph(f"<b>{num}</b>", ParagraphStyle('Num', fontName='Helvetica-Bold', fontSize=10, textColor=BRAND, alignment=TA_CENTER))
    content = Table([
        [Paragraph(name, s_scope_title)],
        [Paragraph(desc, s_scope_desc)],
    ], colWidths=[width - 46])
    content.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))

    t = Table([[num_para, content]], colWidths=[28, width - 40])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY50),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY200),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (0, 0), 10),
        ('RIGHTPADDING', (-1, 0), (-1, 0), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return t


def term_box(label, value, note, width):
    note_formatted = note.replace("\n", "<br/>")
    t = Table([
        [Paragraph(label, s_term_label)],
        [Paragraph(value, s_term_value)],
        [Paragraph(note_formatted, s_term_note)],
    ], colWidths=[width - 24])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY50),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY200),
        ('TOPPADDING', (0, 0), (0, 0), 14),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (-1, -1), (-1, -1), 14),
        ('TOPPADDING', (0, 1), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (0, 1), 2),
    ]))
    return t


if __name__ == "__main__":
    build_pdf()
