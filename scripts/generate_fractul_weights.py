import copy
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import GlyphCoordinates

def interpolate_font(hairline_path, extrabold_path, output_path, factor, weight_class, weight_name):
    """
    factor: 0.0 = hairline (weight ~95), 1.0 = extrabold (weight ~800)
    e.g. 
      Regular (400): factor = (400 - 95) / (800 - 95) = 305 / 705 = 0.4326
      Medium (500): factor = (500 - 95) / (705) = 405 / 705 = 0.5745
      SemiBold (600): factor = (600 - 95) / (705) = 505 / 705 = 0.7163
      Bold (700): factor = (700 - 95) / (705) = 605 / 705 = 0.8582
    """
    f_h = TTFont(hairline_path)
    f_b = TTFont(extrabold_path)
    
    # We will clone f_h
    out_font = TTFont(hairline_path)
    
    glyf_out = out_font['glyf']
    glyf_h = f_h['glyf']
    glyf_b = f_b['glyf']
    
    hmtx_out = out_font['hmtx']
    hmtx_h = f_h['hmtx']
    hmtx_b = f_b['hmtx']
    
    for name in out_font.getGlyphOrder():
        gh = glyf_h[name]
        gb = glyf_b[name]
        
        # Interpolate metrics
        adv_h, lsb_h = hmtx_h[name]
        adv_b, lsb_b = hmtx_b[name]
        adv = int(round(adv_h + factor * (adv_b - adv_h)))
        lsb = int(round(lsb_h + factor * (lsb_b - lsb_h)))
        hmtx_out[name] = (adv, lsb)
        
        if gh.numberOfContours <= 0:
            continue
            
        # Interpolate coordinates
        coords_h, endPts_h, flags_h = gh.getCoordinates(glyf_h)
        coords_b, endPts_b, flags_b = gb.getCoordinates(glyf_b)
        
        if len(coords_h) != len(coords_b):
            continue
            
        new_coords = GlyphCoordinates([
            (
                round(coords_h[i][0] + factor * (coords_b[i][0] - coords_h[i][0])),
                round(coords_h[i][1] + factor * (coords_b[i][1] - coords_h[i][1]))
            )
            for i in range(len(coords_h))
        ])
        
        g_out = glyf_out[name]
        g_out.coordinates = new_coords
        g_out.recalcBounds(glyf_out)
        
    # Update OS/2 table
    if 'OS/2' in out_font:
        out_font['OS/2'].usWeightClass = weight_class
        out_font['OS/2'].recalcAvgCharWidth(out_font)
        
    # Update name table
    name_table = out_font['name']
    for record in name_table.names:
        # 1: Family, 2: Subfamily, 4: Full Name, 6: PostScript
        if record.nameID == 2:
            record.string = weight_name
        elif record.nameID == 4:
            record.string = f"Fractul Alt W05 {weight_name}"
        elif record.nameID == 6:
            record.string = f"FractulAlt-{weight_name.replace(' ', '')}"
            
    out_font.save(output_path)
    print(f"Generated {output_path} (Weight: {weight_class}, Name: {weight_name})")

# Generate Regular, Medium, SemiBold, Bold
weights = [
    ("Regular", 400, (400 - 95) / 705.0),
    ("Medium", 500, (500 - 95) / 705.0),
    ("SemiBold", 600, (600 - 95) / 705.0),
    ("Bold", 700, (700 - 95) / 705.0),
]

for name, weight, factor in weights:
    out_file = f"public/fonts/FractulAlt-{name}.ttf"
    interpolate_font('public/fonts/FractulAlt-Hairline.ttf', 'public/fonts/FractulAlt.ttf', out_file, factor, weight, name)

print("All weights generated successfully!")
