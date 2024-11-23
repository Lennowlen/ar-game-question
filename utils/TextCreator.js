// utils/TextCreator.js
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export class TextCreator {
    static async loadFont(fontUrl = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json') {
        const loader = new FontLoader();
        return new Promise((resolve, reject) => {
            loader.load(fontUrl, resolve, undefined, reject);
        });
    }

    static createText({ text, font, size, height, color, position }) {
        const geometry = new TextGeometry(text, {
            font,
            size,
            height,
            curveSegments: 12
        });

        geometry.computeBoundingBox();
        const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        
        const material = new THREE.MeshPhongMaterial({ color });
        const textMesh = new THREE.Mesh(geometry, material);
        
        textMesh.position.set(
            position.x - textWidth / 2,
            position.y,
            position.z
        );
        
        return textMesh;
    }
}