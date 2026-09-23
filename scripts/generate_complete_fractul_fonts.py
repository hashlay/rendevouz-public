import os
import shutil
import numpy as np
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates

def decompose_contour(pts, flags):
    n = len(pts)
    dense = []
    full_pts = []
    full_on = []
    for i in range(n):
        full_pts.append(pts[i])
        full_on.append(bool(flags[i] & 1))
        next_i = (i + 1) % n
        if not (flags[i] & 1) and not (flags[next_i] & 1):
            mid = ((pts[i][0] + pts[next_i][0]) / 2.0, (pts[i][1] + pts[next_i][1]) / 2.0)
            full_pts.append(mid)
            full_on.append(True)
            
    m = len(full_pts)
    first_on = 0
    while first_on < m and not full_on[first_on]:
        first_on += 1
    if first_on == m:
        first_on = 0
        
    idx = first_on
    count = 0
    while count < m:
        p0 = full_pts[idx % m]
        next_idx = (idx + 1) % m
        if full_on[next_idx]:
            p1 = full_pts[next_idx]
            for step in range(8):
                t = step / 8.0
                dense.append((p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1])))
            idx = next_idx
            count += 1
        else:
            c = full_pts[next_idx]
            p2 = full_pts[(next_idx + 1) % m]
            for step in range(12):
                t = step / 12.0
                x = (1-t)**2 * p0[0] + 2*(1-t)*t * c[0] + t**2 * p2[0]
                y = (1-t)**2 * p0[1] + 2*(1-t)*t * c[1] + t**2 * p2[1]
                dense.append((x, y))
            idx = (next_idx + 1) % m
            count += 2
    if len(dense) == 0:
        dense = pts
    return np.array(dense)

def resample_contour(dense_pts, num_samples):
    diffs = np.diff(dense_pts, axis=0)
    dists = np.sqrt((diffs**2).sum(axis=1))
    total_len = dists.sum()
    if total_len == 0:
        return np.repeat(dense_pts[:1], num_samples, axis=0)
    cum_dists = np.concatenate(([0], np.cumsum(dists)))
    sample_dists = np.linspace(0, total_len, num_samples, endpoint=False)
    
    resampled = np.zeros((num_samples, 2))
    for i, sd in enumerate(sample_dists):
        idx = np.searchsorted(cum_dists, sd, side='right') - 1
        idx = max(0, min(idx, len(dists) - 1))
        seg_len = dists[idx]
        if seg_len > 0:
            frac = (sd - cum_dists[idx]) / seg_len
            resampled[i] = dense_pts[idx] + frac * (dense_pts[idx+1] - dense_pts[idx])
        else:
            resampled[i] = dense_pts[idx]
    return resampled

def get_contours_data(g, glyf_table):
    coords, endPts, flags = g.getCoordinates(glyf_table)
    conts = []
    start = 0
    for end in endPts:
        pts = [(coords[i][0], coords[i][1]) for i in range(start, end + 1)]
        fls = [flags[i] for i in range(start, end + 1)]
        conts.append((pts, fls))
        start = end + 1
    return conts

def generate_weight_font(hairline_path, bold_path, out_path, factor, weight_class, weight_name):
    fh = TTFont(hairline_path)
    fb = TTFont(bold_path)
    f_out = TTFont(hairline_path)
    
    glyf_out = f_out['glyf']
    glyf_h = fh['glyf']
    glyf_b = fb['glyf']
    
    hmtx_out = f_out['hmtx']
    hmtx_h = fh['hmtx']
    hmtx_b = fb['hmtx']
    
    for name in f_out.getGlyphOrder():
        gh = glyf_h[name]
        gb = glyf_b[name]
        
        adv_h, lsb_h = hmtx_h[name]
        adv_b, lsb_b = hmtx_b[name]
        adv = int(round(adv_h + factor * (adv_b - adv_h)))
        lsb = int(round(lsb_h + factor * (lsb_b - lsb_h)))
        hmtx_out[name] = (adv, lsb)
        
        if gh.numberOfContours <= 0 or gb.numberOfContours <= 0:
            continue
            
        coords_h, endPts_h, flags_h = gh.getCoordinates(glyf_h)
        coords_b, endPts_b, flags_b = gb.getCoordinates(glyf_b)
        
        if len(coords_h) == len(coords_b):
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
        elif gh.numberOfContours == gb.numberOfContours:
            conts_h = get_contours_data(gh, glyf_h)
            conts_b = get_contours_data(gb, fb['glyf'])
            
            all_new_pts = []
            new_endPts = []
            new_flags = []
            
            for c_idx in range(len(conts_h)):
                pts_h, fls_h = conts_h[c_idx]
                pts_b, fls_b = conts_b[c_idx]
                
                num_samples = max(len(pts_h), len(pts_b)) * 3
                
                dense_h = decompose_contour(pts_h, fls_h)
                dense_b = decompose_contour(pts_b, fls_b)
                
                res_h = resample_contour(dense_h, num_samples)
                res_b = resample_contour(dense_b, num_samples)
                
                best_shift = 0
                best_dist = float('inf')
                for shift in range(0, num_samples, 2):
                    rolled_b = np.roll(res_b, shift, axis=0)
                    d = np.sum((res_h - rolled_b)**2)
                    if d < best_dist:
                        best_dist = d
                        best_shift = shift
                res_b = np.roll(res_b, best_shift, axis=0)
                
                interp = (1.0 - factor) * res_h + factor * res_b
                for pt in interp:
                    all_new_pts.append((int(round(pt[0])), int(round(pt[1]))))
                    new_flags.append(1)
                new_endPts.append(len(all_new_pts) - 1)
                
            g_out = glyf_out[name]
            g_out.coordinates = GlyphCoordinates(all_new_pts)
            g_out.endPtsOfContours = new_endPts
            g_out.flags = bytearray(new_flags)
            g_out.recalcBounds(glyf_out)
            
    # Set clean vertical line for rank numerals 'I' and 'bar' (no serifs)
    stem_w = int(round(14 + factor * (140 - 14)))
    x0 = 80
    x1 = x0 + stem_w
    for gname in ['I', 'bar']:
        if gname in glyf_out:
            g_bar = glyf_out[gname]
            g_bar.numberOfContours = 1
            g_bar.coordinates = GlyphCoordinates([(x0, 0), (x0, 690), (x1, 690), (x1, 0)])
            g_bar.endPtsOfContours = [3]
            g_bar.flags = bytearray([1, 1, 1, 1])
            g_bar.recalcBounds(glyf_out)
            hmtx_out[gname] = (x1 + x0, x0)
            
    # Update OS/2 table
    if 'OS/2' in f_out:
        f_out['OS/2'].usWeightClass = weight_class
        f_out['OS/2'].recalcAvgCharWidth(f_out)
        
    safe_name = weight_name.replace(" ", "")
    for rec in f_out['name'].names:
        if rec.nameID == 2:
            rec.string = weight_name
        elif rec.nameID == 4:
            rec.string = f"Fractul Alt W05 {weight_name}"
        elif rec.nameID == 6:
            rec.string = f"FractulAlt-{safe_name}"
            
    f_out.save(out_path)
    print(f"Generated {out_path} ({weight_name}, {weight_class})")

if __name__ == '__main__':
    hairline = 'public/fonts/FractulAlt-Hairline.ttf'
    bold = 'public/fonts/FractulAlt.ttf'
    
    weights = [
        ("Regular", 400, (400 - 95) / 705.0),
        ("Medium", 500, (500 - 95) / 705.0),
        ("SemiBold", 600, (600 - 95) / 705.0),
        ("Bold", 700, (700 - 95) / 705.0),
    ]
    
    dest_dirs = [
        'public/fonts',
        'dist/fonts',
        'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/public/fonts',
        'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/dist/fonts'
    ]
    
    for name, weight, factor in weights:
        out_file = f"public/fonts/FractulAlt-{name}.ttf"
        generate_weight_font(hairline, bold, out_file, factor, weight, name)
        
        # Copy to other directories
        for d in dest_dirs[1:]:
            os.makedirs(d, exist_ok=True)
            target = os.path.join(d, f"FractulAlt-{name}.ttf")
            shutil.copyfile(out_file, target)
            print(f"Copied to {target}")
            
    print("\nAll Fractul Alt weights successfully built and synchronized!")
