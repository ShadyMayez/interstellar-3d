import os

files_to_patch = [
    "app.1780406240914.js",
    "assets/js/app.1780406240914.js",
    "Active Theory · Creative Digital Experiences_files/app.1780406240914.js"
]

target = "this.loadBuffer=async function(url){if(!_buffers[url]){_buffers[url]={loaded:Promise.create(),data:null};var response=await fetch(url),buffer=await response.arrayBuffer();_this.audioContext().decodeAudioData(buffer,(data=>{_buffers[url].data=data,_buffers[url].loaded.resolve()}))}return await _buffers[url].loaded,_buffers[url].data}"
replacement = "this.loadBuffer=async function(url){if(!_buffers[url]){_buffers[url]={loaded:Promise.create(),data:null};try{var response=await fetch(url),buffer=await response.arrayBuffer();_this.audioContext().decodeAudioData(buffer,(data=>{_buffers[url].data=data,_buffers[url].loaded.resolve()}),(_=>{_buffers[url].loaded.resolve()}))}catch(e){_buffers[url].loaded.resolve()}}return await _buffers[url].loaded,_buffers[url].data}"

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
