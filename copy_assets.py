import os
import shutil

src_dir = r"C:\Users\yanAndzeng\.gemini\antigravity-cli\brain\fc05877b-b50c-45c3-8e57-0a9daa008b9c"
dst_dir = r"C:\Users\yanAndzeng\kindergarten-rpg-game\assets"

files = {
    # 背景
    "game_cover_1779545028056.png": "game_cover.png",
    "director_office_1779545044261.png": "director_office.png",
    "report_bg_1779545059237.png": "report_bg.png",
    # 角色立绘
    "guide_zeng_1779545627131.png": "guide_zeng.png",
    "teacher_wang_1779545645620.png": "teacher_wang.png",
    "teacher_wang_cry_1779545662187.png": "teacher_wang_cry.png",
    "teacher_li_1779545680084.png": "teacher_li.png",
    "teacher_chen_1779545693406.png": "teacher_chen.png"
}

os.makedirs(dst_dir, exist_ok=True)

for src_name, dst_name in files.items():
    src_path = os.path.join(src_dir, src_name)
    dst_path = os.path.join(dst_dir, dst_name)
    try:
        shutil.copy(src_path, dst_path)
        print(f"Copied {src_name} to {dst_path}")
    except Exception as e:
        print(f"Failed to copy {src_name}: {e}")
print("Copy process finished.")
