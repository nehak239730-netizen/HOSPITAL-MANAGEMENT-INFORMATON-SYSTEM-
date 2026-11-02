@echo off
title HMIS Java Backend & MySQL Server
echo ========================================================
echo   Hospital Management Information System (HMIS)
echo   Starting Java Spring Boot Backend & Static Web Server
echo ========================================================
echo.

set MAVEN_CMD="C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2024.3.4.1\plugins\maven\lib\maven3\bin\mvn.cmd"

if exist %MAVEN_CMD% (
    echo Using IntelliJ Bundled Maven...
    %MAVEN_CMD% spring-boot:run
) else (
    echo Using System Maven...
    mvn spring-boot:run
)

pause
