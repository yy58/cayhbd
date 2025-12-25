#!/usr/bin/env python3
"""压缩照片到合适的网页尺寸"""
import os
from PIL import Image

PHOTO_DIR = 'assets/photos'
MAX_SIZE = 1200  # 最大宽度/高度
QUALITY = 85  # JPEG 质量 (0-100)

def compress_image(filepath):
    """压缩单个图片"""
    try:
        with Image.open(filepath) as img:
            # 转换 RGBA 到 RGB（如果需要）
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            
            # 计算新尺寸（保持比例）
            width, height = img.size
            if width > MAX_SIZE or height > MAX_SIZE:
                if width > height:
                    new_width = MAX_SIZE
                    new_height = int(height * (MAX_SIZE / width))
                else:
                    new_height = MAX_SIZE
                    new_width = int(width * (MAX_SIZE / height))
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # 保存压缩后的图片
            img.save(filepath, 'JPEG', quality=QUALITY, optimize=True)
            return True
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    """处理所有 JPG 图片"""
    for filename in os.listdir(PHOTO_DIR):
        if filename.lower().endswith('.jpg'):
            filepath = os.path.join(PHOTO_DIR, filename)
            size_before = os.path.getsize(filepath) / 1024 / 1024  # MB
            
            print(f"压缩 {filename} ({size_before:.2f}MB)...", end=' ')
            
            if compress_image(filepath):
                size_after = os.path.getsize(filepath) / 1024 / 1024
                saved = ((size_before - size_after) / size_before) * 100
                print(f"✓ {size_after:.2f}MB (节省 {saved:.1f}%)")
            else:
                print("失败")

if __name__ == '__main__':
    main()
