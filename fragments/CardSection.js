// components/CardSection.js
import * as THREE from 'three';

export class CardSection {
    static create(width, height, color, x, y, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        return mesh;
    }
}