$path = "android/app/build.gradle"
$content = Get-Content $path
$newContent = @()
foreach ($line in $content) {
    if ($line -match "ndkVersion") {
        $newContent += "    ndkVersion `"27.0.12077973`""
    } else {
        $newContent += $line
    }
}
$newContent | Set-Content $path
