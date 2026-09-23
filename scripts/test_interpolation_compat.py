import sys
from fontTools.ttLib import TTFont

font_hairline = TTFont('public/fonts/FractulAlt-Hairline.ttf')
font_extrabold = TTFont('public/fonts/FractulAlt.ttf')

glyf_h = font_hairline['glyf']
glyf_b = font_extrabold['glyf']

compatible = 0
incompatible = 0
total = len(font_hairline.getGlyphOrder())

for name in font_hairline.getGlyphOrder():
    if name not in glyf_b:
        incompatible += 1
        continue
    gh = glyf_h[name]
    gb = glyf_b[name]
    if gh.numberOfContours != gb.numberOfContours:
        incompatible += 1
    else:
        compatible += 1

print(f"Total glyphs: {total}, Compatible: {compatible}, Incompatible: {incompatible}")
