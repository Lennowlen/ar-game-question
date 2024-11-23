import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

export class Cards {
    constructor(scene, position, headerText, bodyText, footerText, button1Text, button2Text) {
        this.scene = scene;
        this.position = new THREE.Vector3(position.x, position.y, position.z);

        // Card dimensions
        this.cardWidth = 7;
        this.cardHeight = 10;
        this.cardDepth = 0.1;

        // Section heights
        this.footerHeight = 1;
        this.headerHeight = 1.2;
        this.bodyHeight = this.cardHeight - this.headerHeight - this.footerHeight;

        // Button dimensions
        this.buttonHeight = 0.6;
        this.buttonWidth = 1.6;
        this.buttonDepth = 0.1;
        this.buttonSpacing = 0.5;

        // Text content
        this.headerText = headerText || 'Header';
        this.bodyText = bodyText || 'Body Content';
        this.footerText = footerText || 'Footer';
        this.button1Text = button1Text || 'Yes';
        this.button2Text = button2Text || 'No';

        // Colors
        this.colors = {
            header: 0x4CAF50, // color green
            body: 0xFFFFFF, // color white
            footer: 0x2196F3, // color blue
            button1: 0xFF5722, // color red
            button2: 0xFFC107, // color orange
            text: 0x000000, // color black
            textLight: 0xFFFFFF // color white
        };

        // Initialize components
        this.cardGroup = new THREE.Group();
        this.buttons = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Create the card
        this.init();
    }

    init() {
        this.createCardBody();
        this.createButtons();
        this.addTextContent();
        
        // Position the card group
        this.cardGroup.position.copy(this.position);
        this.scene.add(this.cardGroup);
    }

    createCardBody() {
        // Header
        const header = this.createSection(
            this.cardWidth,
            this.headerHeight,
            this.colors.header,
            0,
            this.cardHeight / 2 - this.headerHeight / 2
        );

        // Body
        const body = this.createSection(
            this.cardWidth,
            this.bodyHeight,
            this.colors.body,
            0,
            0
        );

        // Footer
        const footer = this.createSection(
            this.cardWidth,
            this.footerHeight,
            this.colors.footer,
            0,
            -this.cardHeight / 2 + this.footerHeight / 2
        );

        this.cardGroup.add(header, body, footer);
    }

    createSection(width, height, color, x, y) {
        const geometry = new THREE.BoxGeometry(width, height, this.cardDepth);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        return mesh;;
    }

    createButtons() {
        const buttonY = -this.cardHeight / 2 + this.footerHeight / 2;
        const button1X = -this.buttonWidth - this.buttonSpacing / 2;
        const button2X = this.buttonSpacing / 2;

        // Create buttons
        this.button1 = this.createButton(button1X, buttonY, this.colors.button1);
        this.button2 = this.createButton(button2X, buttonY, this.colors.button2);

        this.buttons.push(this.button1, this.button2);
        this.cardGroup.add(this.button1, this.button2);
    }

    createButton(x, y, color) {
        const geometry = new THREE.BoxGeometry(this.buttonWidth, this.buttonHeight, this.buttonDepth);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 50
        });
        const button = new THREE.Mesh(geometry, material);
        button.position.set(x, y, this.cardDepth / 2);
        
        // Store original color for hover effects
        button.userData.originalColor = color;
        button.userData.hoverColor = new THREE.Color(color).multiplyScalar(1.2);
        
        return button;
    }

    addTextContent() {
        const loader = new FontLoader();
        const fontUrl = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';
        
        loader.load(fontUrl, (font) => {
            // Header text
            this.createText({
                text: this.headerText,
                font,
                size: 0.4,
                height: 0.05,
                color: this.colors.textLight,
                position: new THREE.Vector3(0, this.cardHeight / 2 - this.headerHeight / 2, this.cardDepth)
            });

            // Body text
            this.createText({
                text: this.bodyText,
                font,
                size: 0.3,
                height: 0.05,
                color: this.colors.text,
                position: new THREE.Vector3(0, 0, this.cardDepth)
            });

            // Button texts
            this.createButtonText(this.button1, this.button1Text, font);
            this.createButtonText(this.button2, this.button2Text, font);
        });
    }

    createText({ text, font, size, height, color, position }) {
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
        
        this.cardGroup.add(textMesh);
    }

    createButtonText(button, text, font) {
        const geometry = new TextGeometry(text, {
            font,
            size: 0.2,
            height: 0.05,
            curveSegments: 12
        });

        geometry.computeBoundingBox();
        const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        const textHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

        const material = new THREE.MeshPhongMaterial({ color: this.colors.text });
        const textMesh = new THREE.Mesh(geometry, material);

        const buttonPos = button.position;
        textMesh.position.set(
            buttonPos.x - textWidth / 2,
            buttonPos.y - textHeight / 2,
            buttonPos.z + this.buttonDepth
        );

        this.cardGroup.add(textMesh);
    }

    checkButtonClick(mouseX, mouseY) {
        this.mouse.x = (mouseX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(mouseY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.scene.camera);
        const intersects = this.raycaster.intersectObjects(this.buttons);

        if (intersects.length > 0) {
            const clickedButton = intersects[0].object;
            this.handleButtonClick(clickedButton);
        }
    }

    handleButtonClick(button) {
        if (button === this.button1) {
            console.log("Yes clicked");
            // Add your custom logic here
            alert("Yes clicked")
        } else if (button === this.button2) {
            console.log("No clicked");
            // Add your custom logic here
        }

        // Animate button click
        this.animateButtonClick(button);
    }

    animateButtonClick(button) {
        const originalScale = button.scale.clone();
        button.scale.multiplyScalar(0.9);
        setTimeout(() => {
            button.scale.copy(originalScale);
        }, 100);
    }

    updateHover(mouseX, mouseY) {
        this.mouse.x = (mouseX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(mouseY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.scene.camera);
        const intersects = this.raycaster.intersectObjects(this.buttons);

        // Reset all buttons
        this.buttons.forEach(button => {
            button.material.color.setHex(button.userData.originalColor);
        });

        // Highlight hovered button
        if (intersects.length > 0) {
            const hoveredButton = intersects[0].object;
            hoveredButton.material.color.copy(hoveredButton.userData.hoverColor);
        }
    }
}