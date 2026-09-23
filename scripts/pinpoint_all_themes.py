import os
import numpy as np
from PIL import Image

USER_UPLOADED_DIR = "C:/Users/Lenovo/.gemini/antigravity-ide/brain/8c22878d-60a7-4b23-87b4-3c016058391f/.user_uploaded"

def find_components_in_crop(mask_crop, offset_x, offset_y):
    from scipy.ndimage import label
    labeled, num_features = label(mask_crop)
    boxes = []
    for f in range(1, num_features + 1):
        ys, xs = np.where(labeled == f)
        if len(ys) > 10: # filter tiny noise
            boxes.append((xs.min() + offset_x, ys.min() + offset_y, xs.max() + offset_x, ys.max() + offset_y, len(ys)))
    return sorted(boxes, key=lambda b: b[0])

# Theme 3
im3_model = Image.open(os.path.join(USER_UPLOADED_DIR, "media_1790123467406.jpg")).convert('RGB')
im3_bg = Image.open(os.path.join(USER_UPLOADED_DIR, "media_1790123454561.jpg")).convert('RGB')
diff3 = np.max(np.abs(np.array(im3_model, dtype=np.int16) - np.array(im3_bg, dtype=np.int16)), axis=2) > 25

print("=== THEME 3 (1024x1024) ===")
# Header: Y: 260 - 380, X: 150 - 600
# 01 number
y01, x01 = np.where(diff3[260:380, 160:250])
print(f"ResultNum '01': X=[{x01.min()+160}, {x01.max()+160}], Y=[{y01.min()+260}, {y01.max()+260}], H={y01.max()-y01.min()}, W={x01.max()-x01.min()}")

# Premier category
yp, xp = np.where(diff3[260:310, 260:420])
print(f"Category 'Premier': X=[{xp.min()+260}, {xp.max()+260}], Y=[{yp.min()+260}, {yp.max()+260}], H={yp.max()-yp.min()}, W={xp.max()-xp.min()}")

# Sudoku comp name
ys, xs = np.where(diff3[300:380, 260:550])
print(f"CompName 'Sudoku': X=[{xs.min()+260}, {xs.max()+260}], Y=[{ys.min()+300}, {ys.max()+300}], H={ys.max()-ys.min()}, W={xs.max()-xs.min()}")

# Rank 1: Roman I, Name, Unit
yr1, xr1 = np.where(diff3[430:480, 230:260])
print(f"Rank 1 'I': X=[{xr1.min()+230}, {xr1.max()+230}], Y=[{yr1.min()+430}, {yr1.max()+430}]")
yn1, xn1 = np.where(diff3[430:480, 260:550])
print(f"Rank 1 Name 'Ameer favas': X=[{xn1.min()+260}, {xn1.max()+260}], Y=[{yn1.min()+430}, {yn1.max()+430}], H={yn1.max()-yn1.min()}")
yu1, xu1 = np.where(diff3[470:505, 260:450])
print(f"Rank 1 Unit 'zanzibari Souqs': X=[{xu1.min()+260}, {xu1.max()+260}], Y=[{yu1.min()+470}, {yu1.max()+470}], H={yu1.max()-yu1.min()}")

# Rank 2: Roman II, Name, Unit
yr2, xr2 = np.where(diff3[510:560, 225:260])
print(f"Rank 2 'II': X=[{xr2.min()+225}, {xr2.max()+225}], Y=[{yr2.min()+510}, {yr2.max()+510}]")
yn2, xn2 = np.where(diff3[510:560, 260:550])
print(f"Rank 2 Name 'Swadiq Jafar': X=[{xn2.min()+260}, {xn2.max()+260}], Y=[{yn2.min()+510}, {yn2.max()+510}], H={yn2.max()-yn2.min()}")
yu2, xu2 = np.where(diff3[550:585, 260:450])
print(f"Rank 2 Unit 'zanzibari Souqs': X=[{xu2.min()+260}, {xu2.max()+260}], Y=[{yu2.min()+550}, {yu2.max()+550}], H={yu2.max()-yu2.min()}")

# Rank 3: Roman III, Name, Unit
yr3, xr3 = np.where(diff3[595:645, 220:260])
print(f"Rank 3 'III': X=[{xr3.min()+220}, {xr3.max()+220}], Y=[{yr3.min()+595}, {yr3.max()+595}]")
yn3, xn3 = np.where(diff3[595:645, 260:550])
print(f"Rank 3 Name 'Midlaj Musthafa': X=[{xn3.min()+260}, {xn3.max()+260}], Y=[{yn3.min()+595}, {yn3.max()+595}], H={yn3.max()-yn3.min()}")
yu3, xu3 = np.where(diff3[640:675, 260:450])
print(f"Rank 3 Unit 'zanzibari Souqs': X=[{xu3.min()+260}, {xu3.max()+260}], Y=[{yu3.min()+640}, {yu3.max()+640}], H={yu3.max()-yu3.min()}")


# Theme 4
im4_model = Image.open(os.path.join(USER_UPLOADED_DIR, "media_1790123494186.jpg")).convert('RGB')
im4_bg = Image.open(os.path.join(USER_UPLOADED_DIR, "media_1790123484182.jpg")).convert('RGB')
diff4 = np.max(np.abs(np.array(im4_model, dtype=np.int16) - np.array(im4_bg, dtype=np.int16)), axis=2) > 25

print("\n=== THEME 4 (1024x1024) ===")
# 01 number
y01_4, x01_4 = np.where(diff4[320:440, 420:520])
print(f"ResultNum '01': X=[{x01_4.min()+420}, {x01_4.max()+420}], Y=[{y01_4.min()+320}, {y01_4.max()+320}], H={y01_4.max()-y01_4.min()}, W={x01_4.max()-x01_4.min()}")

# Premier category
yp_4, xp_4 = np.where(diff4[320:370, 520:670])
print(f"Category 'Premier': X=[{xp_4.min()+520}, {xp_4.max()+520}], Y=[{yp_4.min()+320}, {yp_4.max()+320}], H={yp_4.max()-yp_4.min()}, W={xp_4.max()-xp_4.min()}")

# Sudoku comp name
ys_4, xs_4 = np.where(diff4[350:440, 520:790])
print(f"CompName 'Sudoku': X=[{xs_4.min()+520}, {xs_4.max()+520}], Y=[{ys_4.min()+350}, {ys_4.max()+350}], H={ys_4.max()-ys_4.min()}, W={xs_4.max()-xs_4.min()}")

# Rank 1: Roman I, Name, Unit
yr1_4, xr1_4 = np.where(diff4[470:525, 490:520])
print(f"Rank 1 'I': X=[{xr1_4.min()+490}, {xr1_4.max()+490}], Y=[{yr1_4.min()+470}, {yr1_4.max()+470}]")
yn1_4, xn1_4 = np.where(diff4[470:525, 520:750])
print(f"Rank 1 Name: X=[{xn1_4.min()+520}, {xn1_4.max()+520}], Y=[{yn1_4.min()+470}, {yn1_4.max()+470}], H={yn1_4.max()-yn1_4.min()}")
yu1_4, xu1_4 = np.where(diff4[510:550, 520:700])
print(f"Rank 1 Unit: X=[{xu1_4.min()+520}, {xu1_4.max()+520}], Y=[{yu1_4.min()+510}, {yu1_4.max()+510}], H={yu1_4.max()-yu1_4.min()}")

# Rank 2:
yr2_4, xr2_4 = np.where(diff4[540:600, 485:520])
print(f"Rank 2 'II': X=[{xr2_4.min()+485}, {xr2_4.max()+485}], Y=[{yr2_4.min()+540}, {yr2_4.max()+540}]")
yn2_4, xn2_4 = np.where(diff4[540:600, 520:750])
print(f"Rank 2 Name: X=[{xn2_4.min()+520}, {xn2_4.max()+520}], Y=[{yn2_4.min()+540}, {yn2_4.max()+540}], H={yn2_4.max()-yn2_4.min()}")
yu2_4, xu2_4 = np.where(diff4[585:625, 520:700])
print(f"Rank 2 Unit: X=[{xu2_4.min()+520}, {xu2_4.max()+520}], Y=[{yu2_4.min()+585}, {yu2_4.max()+585}], H={yu2_4.max()-yu2_4.min()}")

# Rank 3:
yr3_4, xr3_4 = np.where(diff4[620:680, 480:520])
print(f"Rank 3 'III': X=[{xr3_4.min()+480}, {xr3_4.max()+480}], Y=[{yr3_4.min()+620}, {yr3_4.max()+620}]")
yn3_4, xn3_4 = np.where(diff4[620:680, 520:790])
print(f"Rank 3 Name: X=[{xn3_4.min()+520}, {xn3_4.max()+520}], Y=[{yn3_4.min()+620}, {yn3_4.max()+620}], H={yn3_4.max()-yn3_4.min()}")
yu3_4, xu3_4 = np.where(diff4[665:705, 520:700])
print(f"Rank 3 Unit: X=[{xu3_4.min()+520}, {xu3_4.max()+520}], Y=[{yu3_4.min()+665}, {yu3_4.max()+665}], H={yu3_4.max()-yu3_4.min()}")


# Theme 2 (media_1790123508032.jpg)
print("\n=== THEME 2 (1024x1024) ===")
im2_model = Image.open(os.path.join(USER_UPLOADED_DIR, "media_1790123508032.jpg")).convert('RGB')
arr2 = np.array(im2_model)
# Look at text in arr2 - background is dark green (R < 30, G < 50, B < 40), text is either cyan/teal (B > 100, G > 100) or white (R > 180, G > 180, B > 180)
mask2 = (arr2[:, :, 1] > 90) | (arr2[:, :, 0] > 100) | (arr2[:, :, 2] > 100)
# exclude bottom logos/footer (Y > 800) and left stamp (X < 320)
mask2[800:, :] = False
mask2[:, :320] = False
mask2[:200, :] = False

# 01 number
y01_2, x01_2 = np.where(mask2[300:430, 320:430])
print(f"Theme 2 ResultNum '01': X=[{x01_2.min()+320}, {x01_2.max()+320}], Y=[{y01_2.min()+300}, {y01_2.max()+300}], H={y01_2.max()-y01_2.min()}, W={x01_2.max()-x01_2.min()}")

# Premier category
yp_2, xp_2 = np.where(mask2[300:360, 420:580])
print(f"Theme 2 Category 'Premier': X=[{xp_2.min()+420}, {xp_2.max()+420}], Y=[{yp_2.min()+300}, {yp_2.max()+300}], H={yp_2.max()-yp_2.min()}, W={xp_2.max()-xp_2.min()}")

# Sudoku comp name
ys_2, xs_2 = np.where(mask2[330:430, 420:730])
print(f"Theme 2 CompName 'Sudoku': X=[{xs_2.min()+420}, {xs_2.max()+420}], Y=[{ys_2.min()+330}, {ys_2.max()+330}], H={ys_2.max()-ys_2.min()}, W={xs_2.max()-xs_2.min()}")

# Rank 1:
yr1_2, xr1_2 = np.where(mask2[460:520, 395:430])
print(f"Theme 2 Rank 1 'I': X=[{xr1_2.min()+395}, {xr1_2.max()+395}], Y=[{yr1_2.min()+460}, {yr1_2.max()+460}]")
yn1_2, xn1_2 = np.where(mask2[460:520, 430:680])
print(f"Theme 2 Rank 1 Name: X=[{xn1_2.min()+430}, {xn1_2.max()+430}], Y=[{yn1_2.min()+460}, {yn1_2.max()+460}]")
yu1_2, xu1_2 = np.where(mask2[500:540, 430:620])
print(f"Theme 2 Rank 1 Unit: X=[{xu1_2.min()+430}, {xu1_2.max()+430}], Y=[{yu1_2.min()+500}, {yu1_2.max()+500}]")

# Rank 2:
yr2_2, xr2_2 = np.where(mask2[540:600, 395:430])
print(f"Theme 2 Rank 2 'II': X=[{xr2_2.min()+395}, {xr2_2.max()+395}], Y=[{yr2_2.min()+540}, {yr2_2.max()+540}]")
yn2_2, xn2_2 = np.where(mask2[540:600, 430:680])
print(f"Theme 2 Rank 2 Name: X=[{xn2_2.min()+430}, {xn2_2.max()+430}], Y=[{yn2_2.min()+540}, {yn2_2.max()+540}]")
yu2_2, xu2_2 = np.where(mask2[580:620, 430:620])
print(f"Theme 2 Rank 2 Unit: X=[{xu2_2.min()+430}, {xu2_2.max()+430}], Y=[{yu2_2.min()+580}, {yu2_2.max()+580}]")

# Rank 3:
yr3_2, xr3_2 = np.where(mask2[620:680, 395:430])
print(f"Theme 2 Rank 3 'III': X=[{xr3_2.min()+395}, {xr3_2.max()+395}], Y=[{yr3_2.min()+620}, {yr3_2.max()+620}]")
yn3_2, xn3_2 = np.where(mask2[620:680, 430:740])
print(f"Theme 2 Rank 3 Name: X=[{xn3_2.min()+430}, {xn3_2.max()+430}], Y=[{yn3_2.min()+620}, {yn3_2.max()+620}]")
yu3_2, xu3_2 = np.where(mask2[660:700, 430:620])
print(f"Theme 2 Rank 3 Unit: X=[{xu3_2.min()+430}, {xu3_2.max()+430}], Y=[{yu3_2.min()+660}, {yu3_2.max()+660}]")
