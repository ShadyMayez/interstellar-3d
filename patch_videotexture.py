import os

files_to_patch = [
    "app.1780406240914.js",
    "assets/js/app.1780406240914.js",
    "Active Theory · Creative Digital Experiences_files/app.1780406240914.js"
]

target = "const update=_=>{_this.texture=_this.videoTexture,_this.events.unsub"
replacement = "const update=_=>{_this.texture=_this.videoTexture||_this.texture,_this.events.unsub"

for filepath in files_to_patch:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        if target in content:
            new_content = content.replace(target, replacement)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Patched: {filepath}")
        else:
            print(f"Warning: target string not found in {filepath}")
    else:
        print(f"Warning: File not found: {filepath}")
