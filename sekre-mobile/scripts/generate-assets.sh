#!/bin/bash
set -e

# Path to master logo
MASTER_LOGO="assets/master_logo.png"

if [ ! -f "$MASTER_LOGO" ]; then
  echo "Error: Master logo not found at $MASTER_LOGO"
  exit 1
fi

echo "Generating Android Launcher Icons..."
ANDROID_RES_DIR="android/app/src/main/res"

# Android mipmap dimensions:
# mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192
folders=("mipmap-mdpi" "mipmap-hdpi" "mipmap-xhdpi" "mipmap-xxhdpi" "mipmap-xxxhdpi")
sizes=(48 72 96 144 192)

for i in "${!folders[@]}"; do
  folder="${folders[$i]}"
  size="${sizes[$i]}"
  target_dir="$ANDROID_RES_DIR/$folder"
  mkdir -p "$target_dir"
  
  echo "  -> Generating $folder (size ${size}x${size})..."
  sips -s format png -z "$size" "$size" "$MASTER_LOGO" --out "$target_dir/ic_launcher.png" > /dev/null
  sips -s format png -z "$size" "$size" "$MASTER_LOGO" --out "$target_dir/ic_launcher_round.png" > /dev/null
done

echo "Generating iOS App Icons..."
IOS_APPICON_DIR="ios/SekreMobile/Images.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_APPICON_DIR"

# iOS icon sizes to generate:
filenames=("AppIcon-20x20@2x.png" "AppIcon-20x20@3x.png" "AppIcon-29x29@2x.png" "AppIcon-29x29@3x.png" "AppIcon-40x40@2x.png" "AppIcon-40x40@3x.png" "AppIcon-60x60@2x.png" "AppIcon-60x60@3x.png" "AppIcon-1024x1024@1x.png")
ios_sizes=(40 60 58 87 80 120 120 180 1024)

for i in "${!filenames[@]}"; do
  filename="${filenames[$i]}"
  size="${ios_sizes[$i]}"
  echo "  -> Generating $filename (size ${size}x${size})..."
  sips -s format png -z "$size" "$size" "$MASTER_LOGO" --out "$IOS_APPICON_DIR/$filename" > /dev/null
done

# Write updated Contents.json
cat <<EOT > "$IOS_APPICON_DIR/Contents.json"
{
  "images" : [
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20",
      "filename" : "AppIcon-20x20@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20",
      "filename" : "AppIcon-20x20@3x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29",
      "filename" : "AppIcon-29x29@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29",
      "filename" : "AppIcon-29x29@3x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40",
      "filename" : "AppIcon-40x40@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40",
      "filename" : "AppIcon-40x40@3x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60",
      "filename" : "AppIcon-60x60@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60",
      "filename" : "AppIcon-60x60@3x.png"
    },
    {
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024",
      "filename" : "AppIcon-1024x1024@1x.png"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOT

echo "Successfully generated all production ready icons for Android and iOS!"
