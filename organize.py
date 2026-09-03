import os
import shutil

# Create directory structure
directories = [
    "assets/js",
    "assets/data",
    "assets/shaders",
    "assets/fonts/NBArchitektStd-Regular-export",
    "assets/fonts/NBArchitektStd-Light-export",
    "assets/fonts/NBArchitektStd-Bold-export",
    "assets/video"
]

for d in directories:
    os.makedirs(d, exist_ok=True)

# Define file copy mappings
copy_mappings = {
    # Main scripts and modules
    "app.1780406240914.js": "assets/js/app.1780406240914.js",
    "modules.1780406240914.js": "assets/js/modules.1780406240914.js",
    
    # Data JSON files
    "uil.1780406240914.json": "assets/data/uil.1780406240914.json",
    "projects-dev.json": "assets/data/projects-dev.json",
    "metadata-dev.json": "assets/data/metadata-dev.json",
    "contact-dev.json": "assets/data/contact-dev.json",
    
    # Shaders (renamed from .vs.txt to .vs)
    "compiled.vs.txt": "assets/shaders/compiled.vs",
    
    # Video
    "reel.mp4": "assets/video/reel.mp4",
    
    # Regular Font
    "NBArchitektStd-Regular.woff2": "assets/fonts/NBArchitektStd-Regular-export/NBArchitektStd-Regular.woff2",
    "NBArchitektStd-Regular.png": "assets/fonts/NBArchitektStd-Regular-export/NBArchitektStd-Regular.png",
    "NBArchitektStd-Regular.json": "assets/fonts/NBArchitektStd-Regular-export/NBArchitektStd-Regular.json",
    
    # Light Font
    "NBArchitektStd-Light.png": "assets/fonts/NBArchitektStd-Light-export/NBArchitektStd-Light.png",
    "NBArchitektStd-Light.json": "assets/fonts/NBArchitektStd-Light-export/NBArchitektStd-Light.json",
    
    # Bold Font
    "NBArchitektStd-Bold.woff2": "assets/fonts/NBArchitektStd-Bold-export/NBArchitektStd-Bold.woff2",
    "NBArchitektStd-Bold.png": "assets/fonts/NBArchitektStd-Bold-export/NBArchitektStd-Bold.png",
    "NBArchitektStd-Bold.json": "assets/fonts/NBArchitektStd-Bold-export/NBArchitektStd-Bold.json"
}

# If the source file exists in _files folder but not root, let's copy from there
src_dir_files = "Active Theory · Creative Digital Experiences_files"

for src, dest in copy_mappings.items():
    src_path = src
    if not os.path.exists(src_path) and os.path.exists(os.path.join(src_dir_files, src)):
        src_path = os.path.join(src_dir_files, src)
        
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest)
        print(f"Copied: {src_path} -> {dest}")
    else:
        print(f"Warning: Source not found: {src_path}")

# Handle the GTM script (saved as 'js' in the _files folder)
gtm_src = os.path.join(src_dir_files, "js")
if os.path.exists(gtm_src):
    shutil.copy2(gtm_src, "assets/js/gtag.js")
    print(f"Copied GTM: {gtm_src} -> assets/js/gtag.js")

# Modify index.html
html_filename = "Active Theory · Creative Digital Experiences.html"
if os.path.exists(html_filename):
    with open(html_filename, "r") as f:
        html_content = f.read()
    
    # Replace the browser saved paths with standard assets paths
    html_content = html_content.replace(
        "./Active Theory · Creative Digital Experiences_files/app.1780406240914.js",
        "assets/js/app.1780406240914.js"
    )
    html_content = html_content.replace(
        "./Active Theory · Creative Digital Experiences_files/modules.1780406240914.js",
        "assets/js/modules.1780406240914.js"
    )
    html_content = html_content.replace(
        "./Active Theory · Creative Digital Experiences_files/js",
        "assets/js/gtag.js"
    )
    
    # Let's save as index.html
    with open("index.html", "w") as f:
        f.write(html_content)
    print("Created index.html with corrected asset paths.")
else:
    print(f"Error: HTML file {html_filename} not found!")
