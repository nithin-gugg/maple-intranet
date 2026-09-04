import os
from io import BytesIO
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Note: In a real app, you might want to register custom fonts. 
# For now, we rely on standard fonts built into ReportLab (like Helvetica-Bold, Helvetica).

def generate_certificate(template_path: str, output_path: str, config_json: dict, data: dict):
    """
    Overlays text on a PDF template based on config_json.
    data contains:
      employee_name
      course_name
      completion_date
      certificate_id
    """
    
    # Check if template exists
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Certificate template not found: {template_path}")
        
    # Read the template PDF to get dimensions
    reader = PdfReader(template_path)
    if not reader.pages:
        raise ValueError("The provided template is empty.")
    
    template_page = reader.pages[0]
    
    # We create a new blank PDF in memory using ReportLab
    packet = BytesIO()
    
    # Use the dimensions of the first page of the template
    width = float(template_page.mediabox.width)
    height = float(template_page.mediabox.height)
    
    c = canvas.Canvas(packet, pagesize=(width, height))
    
    # Ensure standard mapping exists in config_json or fallback to defaults
    for field, field_data in data.items():
        if field in config_json:
            cfg = config_json[field]
            x = cfg.get("x", 100)
            # PDF coordinates: y=0 is bottom. Usually config from UI considers y=0 as top.
            # If UI sends top-down Y, we might need to do: y = height - cfg["y"]
            # Let's assume UI config sends standard PDF Y (bottom-up) or we handle it in frontend. 
            # We'll assume the frontend sends bottom-up coordinates to be safe, or we provide a conversion flag.
            # Let's assume Y is from the bottom for simplicity.
            y = cfg.get("y", 100) 
            
            font_size = cfg.get("font_size", 20)
            font = cfg.get("font", "Helvetica")
            
            c.setFont(font, font_size)
            
            # Align center if configured, else left
            align = cfg.get("align", "left")
            if align == "center":
                c.drawCentredString(x, y, str(field_data))
            elif align == "right":
                c.drawRightString(x, y, str(field_data))
            else:
                c.drawString(x, y, str(field_data))
                
    c.save()
    
    # Move to the beginning of the StringIO buffer
    packet.seek(0)
    
    # Read the transparent PDF containing only the text
    new_pdf = PdfReader(packet)
    
    # We have to overlay it on ALL pages or just the first page. Typically, certificates are 1 page.
    writer = PdfWriter()
    
    page = template_page
    page.merge_page(new_pdf.pages[0])
    writer.add_page(page)
    
    # Make sure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "wb") as f:
        writer.write(f)
        
    return output_path
