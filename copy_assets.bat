@echo off
echo ==========================================================
echo  正在复制 暖心治园 RPG 游戏的宫崎骏风格背景资产...
echo ==========================================================
echo.

if not exist assets (
    echo 正在创建 assets 文件夹...
    mkdir assets
)

echo 正在复制游戏封面...
copy /Y "C:\Users\yanAndzeng\.gemini\antigravity-cli\brain\fc05877b-b50c-45c3-8e57-0a9daa008b9c\game_cover_1779545028056.png" "assets\game_cover.png"

echo 正在复制园长办公室背景...
copy /Y "C:\Users\yanAndzeng\.gemini\antigravity-cli\brain\fc05877b-b50c-45c3-8e57-0a9daa008b9c\director_office_1779545044261.png" "assets\director_office.png"

echo 正在复制报告背景...
copy /Y "C:\Users\yanAndzeng\.gemini\antigravity-cli\brain\fc05877b-b50c-45c3-8e57-0a9daa008b9c\report_bg_1779545059237.png" "assets\report_bg.png"

echo.
echo ==========================================================
echo  成功！所有吉卜力风格美术资源已复制至 assets 目录。
echo  您现在可以直接双击 index.html 开始体验游戏！
echo ==========================================================
pause
