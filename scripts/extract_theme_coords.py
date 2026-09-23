import os
import numpy as np
from PIL import Image

USER_UPLOADED_DIR = "C:/Users/Lenovo/.gemini/antigravity-ide/brain/8c22878d-60a7-4b23-87b4-3c016058391f/.user_uploaded"

def analyze_diff(model_path, bg_path, name):
    print(f"\n=================== ANALYZING {name} ===================")
    im_model = Image.open(model_path).convert('RGB')
    im_bg = Image.open(bg_path).convert('RGB')
    
    arr_model = np.array(im_model, dtype=np.int16)
    arr_bg = np.array(im_bg, dtype=np.int16)
    
    diff = np.abs(arr_model - arr_bg)
    diff_gray = np.max(diff, axis=2)
    
    # Threshold diff
    mask = diff_gray > 25
    
    # Find bounding boxes of text regions
    # Let's slice into vertical bands to isolate:
    # 1. Result number & Competition Title area (Y: 250 - 450)
    # 2. Rank 1 area (Y: 450 - 550)
    # 3. Rank 2 area (Y: 550 - 650)
    # 4. Rank 3 area (Y: 650 - 750)
    
    y_indices, x_indices = np.where(mask)
    if len(y_indices) == 0:
        print("No diff found!")
        return

    print(f"Total diff bounding box: X=[{x_indices.min()}, {x_indices.max()}], Y=[{y_indices.min()}, {y_indices.max()}]")
    
    # Let's inspect horizontal bands
    # Header area: Y from 250 to 450
    head_mask = mask[250:450, :]
    hy, hx = np.where(head_mask)
    if len(hy) > 0:
        hy += 250
        print(f"Header block: X=[{hx.min()}, {hx.max()}], Y=[{hy.min()}, {hy.max()}]")
        # Let's find distinct components in header:
        # e.g. '01' on left vs 'Premier' on top vs 'Sudoku' below
        
    # Let's check text lines by horizontal projection
    h_proj = mask.sum(axis=1)
    in_line = False
    start_y = 0
    lines = []
    for y in range(len(h_proj)):
        if h_proj[y] > 5 and not in_line:
            in_line = True
            start_y = y
        elif h_proj[y] <= 5 and in_line:
            in_line = False
            if y - start_y > 4: # at least 5px high
                lines.append((start_y, y))
                
    print(f"Detected {len(lines)} text horizontal bands:")
    for (sy, ey) in lines:
        line_mask = mask[sy:ey, :]
        ly, lx = np.where(line_mask)
        # sample color in model image
        pixels = arr_model[sy + ly, lx]
        mean_col = pixels.mean(axis=0).astype(int)
        hex_col = f"#{mean_col[0]:02X}{mean_col[1]:02X}{mean_col[2]:02X}"
        print(f"  Y: [{sy}, {ey}] (h={ey-sy}) | X: [{lx.min()}, {lx.max()}] (w={lx.max()-lx.min()}) | Approx Color: {hex_col}")

# Theme 3:
analyze_diff(
    os.path.join(USER_UPLOADED_DIR, "media_1790123467406.jpg"),
    os.path.join(USER_UPLOADED_DIR, "media_1790123454561.jpg"),
    "THEME 3 (White & Brown)"
)

# Theme 4:
analyze_diff(
    os.path.join(USER_UPLOADED_DIR, "media_1790123494186.jpg"),
    os.path.join(USER_UPLOADED_DIR, "media_1790123484182.jpg"),
    "THEME 4 (Yellow & Red Scroll)"
)
