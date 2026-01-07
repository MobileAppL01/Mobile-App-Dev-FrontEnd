@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/3] Deleting old build artifacts and cache...
:: Xóa các thư mục cache gây lỗi NDK và SDK
if exist "android\.gradle" rd /s /q "android\.gradle"
if exist "android\app\build" rd /s /q "android\app\build"
if exist "android\app\.cxx" rd /s /q "android\app\.cxx"

echo [2/3] Cleaning project with Gradlew...
cd android
call gradlew.bat clean

echo [3/3] Building APK (Release)...
:: Thêm --no-daemon để đảm bảo môi trường Java sạch hoàn toàn
call gradlew.bat assembleRelease --no-daemon --stacktrace > ..\build_log_detailed.txt 2>&1

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo APK location: android\app\build\outputs\apk\release\app-release.apk
    echo ========================================
    cd ..
) else (
    echo.
    echo ========================================
    echo BUILD FAILED! Check build_log_detailed.txt for details
    echo ========================================
    cd ..
    pause
)