// components/CardButton.js
import * as THREE from 'three';

export class CardButton {
    static create(width, height, depth, color, position) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 50
        });
        const button = new THREE.Mesh(geometry, material);
        button.position.copy(position);
        
        // Store original color for hover effects
        button.userData.originalColor = color;
        button.userData.hoverColor = new THREE.Color(color).multiplyScalar(1.2);
        
        return button;
    }
}