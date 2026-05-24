import os
import sys

# 自动检测并安装 Pillow 库
try:
    from PIL import Image
except ImportError:
    print("Pillow library not found. Attempting to install...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def make_background_transparent(image_path, output_path, threshold_inner=30, threshold_outer=50):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist.")
        return False
    
    try:
        # 打开图像并转为 RGBA 模式
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()
        
        # 采样四个角来推算背景基准色
        width, height = img.size
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((width - 1, 0)),
            img.getpixel((0, height - 1)),
            img.getpixel((width - 1, height - 1))
        ]
        
        # 取四个角 RGB 的平均值作为背景色
        bg_r = sum(c[0] for c in corners) // 4
        bg_g = sum(c[1] for c in corners) // 4
        bg_b = sum(c[2] for c in corners) // 4
        
        print(f"Processing {os.path.basename(image_path)}: sampled background color RGB({bg_r}, {bg_g}, {bg_b})")
        
        new_data = []
        for item in datas:
            r, g, b, a = item
            
            # 计算当前像素与背景色的欧几里得距离
            dist = ((r - bg_r) ** 2 + (g - bg_g) ** 2 + (b - bg_b) ** 2) ** 0.5
            
            if dist < threshold_inner:
                # 完全透明
                new_data.append((r, g, b, 0))
            elif dist < threshold_outer:
                # 渐变半透明羽化边缘
                alpha = int(((dist - threshold_inner) / (threshold_outer - threshold_inner)) * 255)
                new_data.append((r, g, b, min(a, alpha)))
            else:
                # 保留原色
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully processed and saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Failed to process {image_path}: {e}")
        return False

if __name__ == '__main__':
    assets_dir = r"C:\Users\yanAndzeng\kindergarten-rpg-game\assets"
    
    # 待处理的头像列表
    avatars = [
        "guide_zeng.png",
        "teacher_wang.png",
        "teacher_wang_cry.png",
        "teacher_li.png",
        "teacher_chen.png"
    ]
    
    print("=== 开始头像透明化抠图 ===")
    for av in avatars:
        path = os.path.join(assets_dir, av)
        # 直接覆盖原文件，保持 PNG 格式
        make_background_transparent(path, path, threshold_inner=35, threshold_outer=55)
    print("=== 抠图工作完成 ===")
