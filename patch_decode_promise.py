import os

files_to_patch = [
    "app.1780406240914.js",
    "assets/js/app.1780406240914.js",
    "Active Theory · Creative Digital Experiences_files/app.1780406240914.js"
]

target1 = "(await o).decodeAudioData(c,p.resolve,p.reject);"
replacement1 = "let p_dec1=(await o).decodeAudioData(c,p.resolve,p.reject);if(p_dec1&&p_dec1.catch)p_dec1.catch(()=>{});"

target2 = "_this.audioContext().decodeAudioData(buffer,(data=>{_buffers[url].data=data,_buffers[url].loaded.resolve()}),(_=>{_buffers[url].loaded.resolve()}))"
replacement2 = "let p_dec2=_this.audioContext().decodeAudioData(buffer,(data=>{_buffers[url].data=data,_buffers[url].loaded.resolve()}),(_=>{_buffers[url].loaded.resolve()}));if(p_dec2&&p_dec2.catch)p_dec2.catch(()=>{});"

for filepath in files_to_patch:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        patched = False
        if target1 in content:
            content = content.replace(target1, replacement1)
            patched = True
        
        if target2 in content:
            content = content.replace(target2, replacement2)
            patched = True
            
        if patched:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Patched: {filepath}")
        else:
            print(f"Warning: target strings not found in {filepath}")
    else:
        print(f"Warning: File not found: {filepath}")
