from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT_PATH = Path(__file__).resolve().parents[1] / "BudgetFlow-30-Day-GitHub-Plan.pdf"

WEEKLY_MILESTONES = [
    "Week 1 Foundation",
    "Week 2 Product Polish",
    "Week 3 Quality + Deployment",
    "Week 4 Portfolio Finish",
]

DAILY_TASKS = [
    "Initialize Git, prepare repo structure, clean .gitignore, and push the foundation commit.",
    "Remove or ignore packaging leftovers and tighten repo identity in the README.",
    "Verify backend setup and improve backend quick-start docs.",
    "Verify frontend setup and improve the full-stack run guide.",
    "Add license, contributing guide, and roadmap visibility.",
    "Create GitHub milestones, labels, and issue structure.",
    "Capture first README screenshots for core views.",
    "Improve auth UX copy and validation clarity.",
    "Improve dashboard messaging and empty/loading states.",
    "Improve category helper text and delete messaging.",
    "Improve transaction flow clarity and descriptions.",
    "Improve mobile responsiveness for auth and dashboard.",
    "Improve mobile responsiveness for categories and transactions.",
    "Publish architecture decision notes.",
    "Expand backend test coverage for registration and one transaction flow.",
    "Add backend tests for insufficient-balance and transfer validation.",
    "Add frontend smoke coverage or complete the manual QA pass.",
    "Improve frontend API error messaging.",
    "Add reviewer walkthrough and sample test flow to the README.",
    "Improve repo visuals with screenshots or a banner image.",
    "Publish v0.1.0 release notes.",
    "Add backend deployment prep docs.",
    "Add frontend deployment prep docs.",
    "Document production environment setup.",
    "Do a security and cleanup pass.",
    "Add social-proof sections and lessons learned.",
    "Fix the roughest UX or DX issue found during testing.",
    "Run final QA and fix the most obvious breakages.",
    "Publish v0.2.0 or v1.0.0-beta release notes.",
    "Final portfolio polish and close the sprint.",
]


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Body",
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=8,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="PageTitle",
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Small",
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569"),
        )
    )
    return styles


def checkbox_item(text, styles):
    return ListItem(Paragraph(f"&#9633; {text}", styles["Body"]))


def build_pdf():
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=letter,
        topMargin=0.65 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
    )

    story = []
    story.append(Paragraph("BudgetFlow 30-Day GitHub Presence Plan", styles["PageTitle"]))
    story.append(
        Paragraph(
            "A working sprint guide for turning BudgetFlow into a visible public GitHub portfolio project.",
            styles["Body"],
        )
    )
    story.append(Paragraph(f"Prepared on {date.today().isoformat()}", styles["Small"]))
    story.append(Spacer(1, 0.18 * inch))

    story.append(Paragraph("Operating Model", styles["SectionTitle"]))
    operating_points = [
        "Recommended public repository name: budgetflow-budget-app",
        "Default branch: main",
        "Commit format: day X: <clear outcome>",
        "One meaningful commit and push each day",
        "One visible output every day: code, docs, tests, screenshots, deployment, or release note",
    ]
    story.append(ListFlowable([checkbox_item(point, styles) for point in operating_points], bulletType="bullet"))

    story.append(Paragraph("Weekly Milestones", styles["SectionTitle"]))
    story.append(ListFlowable([checkbox_item(item, styles) for item in WEEKLY_MILESTONES], bulletType="bullet"))
    story.append(Spacer(1, 0.15 * inch))

    story.append(Paragraph("Daily Schedule", styles["SectionTitle"]))
    table_data = [["Day", "Task", "Done", "Notes"]]
    for index, task in enumerate(DAILY_TASKS, start=1):
        table_data.append([str(index), task, "", ""])

    table = Table(table_data, colWidths=[0.45 * inch, 4.55 * inch, 0.55 * inch, 1.1 * inch], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("LEADING", (0, 0), (-1, -1), 12),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(PageBreak())

    story.append(Paragraph("End-of-Day Review", styles["SectionTitle"]))
    review_points = [
        "What changed today?",
        "What is now visibly better in the repo?",
        "What issue was closed or updated?",
        "What is tomorrow's smallest meaningful improvement?",
    ]
    story.append(ListFlowable([checkbox_item(point, styles) for point in review_points], bulletType="bullet"))
    story.append(Spacer(1, 0.18 * inch))

    story.append(Paragraph("Success Criteria", styles["SectionTitle"]))
    success_points = [
        "30 consecutive days of meaningful pushed commits",
        "README explains the project clearly in under two minutes",
        "A reviewer can run backend and frontend locally from the docs",
        "At least two backend validation scenarios are covered by tests",
        "Mobile screenshots exist for the key views",
        "At least one GitHub release is published",
    ]
    story.append(ListFlowable([checkbox_item(point, styles) for point in success_points], bulletType="bullet"))
    story.append(Spacer(1, 0.18 * inch))

    story.append(Paragraph("Helpful Project Docs", styles["SectionTitle"]))
    doc_points = [
        "README.md",
        "docs/ROADMAP.md",
        "docs/DECISIONS.md",
        "docs/GITHUB_SETUP_CHECKLIST.md",
        "docs/MANUAL-QA-CHECKLIST.md",
        "docs/github-issue-seeds.md",
    ]
    story.append(ListFlowable([checkbox_item(point, styles) for point in doc_points], bulletType="bullet"))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
