# PowerShell script để loại bỏ hoàn toàn logic âm thanh
$files = Get-ChildItem "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\*.html"

foreach ($file in $files) {
    Write-Host "Processing $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Remove any music-related audio elements
    $content = $content -replace '(\s*<audio[^>]*music[^>]*>[\s\S]*?</audio>\s*)', ''
    
    # Remove music-related JavaScript functions and variables
    $content = $content -replace '(\s*function toggleMusic\(\)\s*\{[\s\S]*?\}\s*)', ''
    $content = $content -replace '(\s*let musicPlaying\s*=[\s\S]*?;\s*)', ''
    $content = $content -replace '(\s*const backgroundMusic\s*=[\s\S]*?;\s*)', ''
    $content = $content -replace '(\s*const musicToggle\s*=[\s\S]*?;\s*)', ''
    $content = $content -replace '(\s*backgroundMusic\.[\s\S]*?;\s*)', ''
    $content = $content -replace '(\s*musicToggle\.[\s\S]*?;\s*)', ''
    $content = $content -replace '(\s*musicPlaying\s*=[\s\S]*?;\s*)', ''
    
    # Remove music-related comments
    $content = $content -replace '(\s*//.*music.*\s*)', ''
    $content = $content -replace '(\s*//.*Music.*\s*)', ''
    
    Set-Content $file.FullName $content -Encoding UTF8
    Write-Host "Updated $($file.Name)"
}

Write-Host "Music cleanup completed!"
