Add-Type -AssemblyName System.Drawing

$srcPath = "D:\PROJECTS\green gardens\green gardens\assets\images\green_gardens_logo.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$img = [System.Drawing.Bitmap]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.DrawImage($img, 0, 0, $img.Width, $img.Height)
$graphics.Dispose()
$img.Dispose()

# Flood-fill / scan outside background to make transparent
# Check distance from center to preserve inner white details if any
$centerX = $bmp.Width / 2.0
$centerY = $bmp.Height * 0.44  # Crest center
$radius = $bmp.Width * 0.38    # Crest radius

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        
        # If pixel is near white/light gray
        if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
            # Check if outside the main emblem circle or below the crest
            $dx = $x - $centerX
            $dy = $y - $centerY
            $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
            
            if ($dist -gt ($radius * 0.96) -or $y -gt ($bmp.Height * 0.8)) {
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
}

$dest1 = "D:\PROJECTS\green gardens\green gardens\assets\images\logo.png"
$dest2 = "D:\PROJECTS\green gardens\green gardens\assets\images\logo_diamond.png"
$dest3 = "D:\PROJECTS\green gardens\green gardens\assets\images\green_gardens_logo.png"

$bmp.Save($dest1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($dest2, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($dest3, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output "✅ Transparent PNG logos saved successfully!"
