@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Building Spring Boot JAR file (skipping tests)...
call "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.0\plugins\maven\lib\maven3\bin\mvn.cmd" clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Exiting.
    exit /b %ERRORLEVEL%
)

echo Starting Spring Boot Cost Dashboard backend server from JAR...
java -jar target\backend-0.0.1-SNAPSHOT.jar
