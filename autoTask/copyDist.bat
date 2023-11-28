
:: copy file
@echo off
echo "正在复制文件"
xcopy "E:\enzo\code\html code\phaser-pig\*.*" "\\192.168.35.231\web_tlerp\QYWX\2018\pig" /e /d /f /i /y  /EXCLUDE:copyIgnore.txt
