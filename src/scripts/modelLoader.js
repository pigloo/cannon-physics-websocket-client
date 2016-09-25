import * as THREE from 'three';
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

class ModelLoader {
    constructor(){

        this._manager = new THREE.LoadingManager();
        this._manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };

        this._loader = new THREE.OBJLoader( this._manager );

    }

    onProgress( xhr ) {
        if (xhr.lengthComputable) {
          var percentComplete = xhr.loaded / xhr.total * 100;
          console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    }

    onError( xhr ) {
        console.log("[scratches head]");
        console.log(xhr);
    }

    load(path, scene, material){
        this._loader.load( path, function ( object ) {

            object.traverse( function( child ){
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = material;
                child.material.shading = THREE.SmoothShading;
            });

            scene.add(object);

        }, this.onProgress, this.onError );
    }
}

export default ModelLoader;
