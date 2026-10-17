@echo off
echo Launching MANAVAI TVK (V) on emulator...
adb -s emulator-5554 shell monkey -p com.tvk.app -c android.intent.category.LAUNCHER 1
echo App launched!
