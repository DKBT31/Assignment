# PowerShell script để loại bỏ hệ thống âm thanh
$files = @(
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day1.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day2.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day3.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day4.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day5.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day6.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day7.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day8.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day9.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day10.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day11.html",
    "c:\Users\Xpeedent\Desktop\Assignment-main\dien-bien-phu-game\details\day12.html"
)

foreach ($file in $files) {
    Write-Host "Processing $file"
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Remove music control button
        $content = $content -replace '(\s*<!-- Music Control Button -->\s*<div class="music-control">\s*<button[^>]*>[\s\S]*?</button>\s*</div>\s*)', ''
        
        # Remove background music audio element
        $content = $content -replace '(\s*<audio id="backgroundMusic"[^>]*>[\s\S]*?</audio>\s*)', ''
        
        # Remove global-music.js script
        $content = $content -replace '(\s*<script src="[^"]*global-music\.js"></script>\s*)', ''
        
        # Remove toggleMusic script block
        $content = $content -replace '(\s*<!-- [^>]*toggleMusic[^>]*-->\s*<script>[\s\S]*?toggleMusic[\s\S]*?</script>\s*)', ''
        
        # Write back to file
        Set-Content $file $content -Encoding UTF8
        Write-Host "Updated $file"
    }
}

Write-Host "Completed!"
