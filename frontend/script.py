import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

def get_code_files(directory, extensions):
    """Fetch frontend source files in src directories, ignoring build/public folders."""
    code_files = {}
    for root, dirs, files in os.walk(directory):
        # Skip non-source folders
        ignored = {'node_modules', '.git', '__pycache__', 'build', 'public'}
        dirs[:] = [d for d in dirs if d not in ignored]

        # Include only paths that are within a 'src' folder
        if 'src' not in root.split(os.sep):
            continue

        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        code_files[file_path] = f.readlines()
                except Exception as e:
                    print(f"❌ Error reading {file_path}: {e}")
    return code_files


def create_pdf(code_data, output_pdf="Frontend_Code_Export.pdf"):
    c = canvas.Canvas(output_pdf, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    line_height = 10
    y = height - margin

    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "📁 Frontend File List:")
    y -= 2 * line_height

    file_paths = list(code_data.keys())

    # 1. File list
    c.setFont("Courier", 8)
    for path in file_paths:
        if y < margin:
            c.showPage()
            c.setFont("Courier", 8)
            y = height - margin
        display_path = os.path.relpath(path)
        c.drawString(margin, y, f"- {display_path}")
        y -= line_height

    # Add page break before code content
    c.showPage()
    y = height - margin

    # 2. File contents
    for file_path, lines in code_data.items():
        print(f"📄 Adding: {file_path}")

        if y < margin + 2 * line_height:
            c.showPage()
            y = height - margin

        display_path = os.path.relpath(file_path)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin, y, f"File: {display_path}")
        y -= line_height
        c.setFont("Courier", 8)

        for line in lines:
            line = line.strip("\n").encode("latin-1", "replace").decode("latin-1")
            if y < margin:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - margin
            c.drawString(margin, y, line[:300])
            y -= line_height

        y -= line_height  # spacing between files

    c.save()
    print(f"✅ PDF successfully created: {output_pdf}")

if __name__ == "__main__":
    root_dir = os.path.dirname(os.path.abspath(__file__))

    # Frontend-related extensions
    extensions = {".js", ".jsx", ".css"}

    code_files = get_code_files(root_dir, extensions)
    create_pdf(code_files)