import os
import numpy as np
from PIL import Image

USER_UPLOADED_DIR = "C:/Users/Lenovo/.gemini/antigravity-ide/brain/8c22878d-60a7-4b23-87b4-3c016058391f/.user_uploaded"

def analyze_model_boxes(model_path, name):
    print(f"\n=================== ANALYZING {name} ===================")
    im_model = Image.open(model_path).convert('RGB')
    arr = np.array(im_model)
    W, H = im_model.size

    # Crop specific known regions and find bounding boxes
    # Let's inspect Header region (Y: 250 to 450)
    # Rank 1 (Y: 450 to 550)
    # Rank 2 (Y: 550 to 650)
    # Rank 3 (Y: 650 to 750)
    
    # Let's do crop for Header
    crop_header = arr[250:450, 100:900]
    # For Theme 2, text is bright cyan/teal and white on dark green (#012002 or similar)
    # For Theme 3, text is gold/brown on white (#FFFFFF)
    # For Theme 4, text is yellow/white on dark red (#801010)

analyze_model_boxes(os.path.join(USER_UPLOADED_DIR, "media_1790123508032.jpg"), "THEME 2 MODEL (Green Stamp)")
analyze_model_boxes(os.path.join(USER_UPLOADED_DIR, "media_1790123467406.jpg"), "THEME 3 MODEL (White & Brown)")
analyze_model_boxes(os.path.join(USER_UPLOADED_DIR, "media_1790123494186.jpg"), "THEME 4 MODEL (Yellow & Red)")
