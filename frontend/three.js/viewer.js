    // ---------- file input ---------- Attach a change listener to the file <input> that the markup created:

    const fileInput = document.getElementById('fileInput');
    let currentModel, currentURL;   // keep references for cleanup

    fileInput.addEventListener('change', async e=>{
      const file = e.target.files[0];
      if(!file) return;

      disposeCurrent();            // remove old model if any
      try{
        await loadUserModel(file);
        centerView();
      }catch(err){
        alert('Could not load model: '+err.message);
        console.error(err);
      }
    });

    // The helper disposeCurrent() removes the old mesh / gltf scene graph and revokes the previous object-URL to prevent memory leaks 
    function disposeCurrent(){
        if(currentModel){
          scene.remove(currentModel);
          currentModel.traverse(obj=>{
            if(obj.geometry) obj.geometry.dispose();
            if(obj.material){
              (Array.isArray(obj.material)?obj.material:[obj.material])
                .forEach(mat=>{
                  if(mat.map) mat.map.dispose();
                  mat.dispose();
                });
            }
          });
        }
        if(currentURL){
          URL.revokeObjectURL(currentURL);     // free blob
          currentURL = null;
        }
        currentModel = null;
      }
  

      // detecting the file type 
      function guessType(file){
        const name = file.name.toLowerCase();
        if(name.endsWith('.obj'))  return 'obj';
        if(name.endsWith('.gltf')) return 'gltf';
        if(name.endsWith('.glb'))  return 'glb';
        throw new Error('Unsupported file format');
      }
  

      // loading the file
      async function loadUserModel(file){
        const type = guessType(file);
  
        currentURL = URL.createObjectURL(file);   // blob:abcd...
        let loader;
  
        if(type === 'obj'){
          loader = new OBJLoader();
          // optional: supply custom MTLLoader if user also picked a .mtl
        }else{
          loader = new GLTFLoader();
        }
  
        return new Promise((resolve,reject)=>{
          loader.load(
            currentURL,
            obj=>{
              currentModel = (type==='obj') ? obj : obj.scene;
              scene.add(currentModel);
              resolve();
            },
            xhr=>{
              console.log((xhr.loaded/xhr.total*100).toFixed(0)+'% loaded');
            },
            err=>reject(err)
          );
        });
      }
  

      // centering and scaling the model
      function centerView(){
        if(!currentModel) return;
        const box = new THREE.Box3().setFromObject(currentModel);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        controls.update();
  
        // position camera to frame the object
        const fitOffset = 1.2;
        const fov = THREE.MathUtils.degToRad(camera.fov);
        const dist = size / (2*Math.tan(fov/2));
        const dir = new THREE.Vector3()
                     .subVectors(camera.position, center)
                     .normalize()
                     .multiplyScalar(dist*fitOffset);
        camera.position.copy(center).add(dir);
        camera.near = size/100;
        camera.far  = size*100;
        camera.updateProjectionMatrix();
      }

      
      // full file putting it all together
      