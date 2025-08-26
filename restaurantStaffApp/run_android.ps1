Start-Process -NoNewWindow -FilePath "C:\Users\minku\AppData\Local\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd Pixel_8_API_35"
Start-Sleep -s 10
npx react-native run-android

# vs code 터미널에서 실행   에뮬 깨끗한 상태로 재시작
# C:\Users\minku\AppData\Local\Android\Sdk\emulator\emulator -avd Pixel_8_API_35 -no-snapshot-load

# 연결돼 있는 에뮬/디바이스 확인
# adb devices   

# [ usb로 핸드폰 연결해서 핸드폰으로 실행할 경우 ]
# npx react-native run-android	