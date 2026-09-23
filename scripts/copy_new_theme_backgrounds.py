import os
import shutil
from PIL import Image

USER_UPLOADED_DIR = "C:/Users/Lenovo/.gemini/antigravity-ide/brain/8c22878d-60a7-4b23-87b4-3c016058391f/.user_uploaded"

# Files:
# 1. media_1790123454561.jpg -> Theme 3 blank background (White & Brown)
# 2. media_1790123467406.jpg -> Theme 3 model
# 3. media_1790123484182.jpg -> Theme 4 blank background (Yellow & Scroll)
# 4. media_1790123494186.jpg -> Theme 4 model
# 5. media_1790123508032.jpg -> Theme 2 model (Green with stamp)

t3_bg = os.path.join(USER_UPLOADED_DIR, "media_1790123454561.jpg")
t4_bg = os.path.join(USER_UPLOADED_DIR, "media_1790123484182.jpg")

destinations = [
    "public/themes",
    "ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/public/themes",
]

for d in destinations:
    os.makedirs(d, exist_ok=True)
    shutil.copy(t3_bg, os.path.join(d, "theme_white_brown.jpg"))
    shutil.copy(t4_bg, os.path.join(d, "theme_yellow_scroll.jpg"))
    # Also theme 5
    shutil.copy("public/themes/theme_phytolore_green.jpg", os.path.join(d, "theme_phytolore_green_theme5.jpg"))
    print(f"Copied backgrounds to {d}")

print("Background copying done.")
