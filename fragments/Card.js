import * as THREE from 'three';
import { CARD_COLORS, CARD_DIMENSIONS } from '../constants.js';
import { TextCreator } from '../utils/TextCreator.js';
import { CardSection } from './CardSection.js';
import { CardButton } from './CardButton.js';
import { MindARThree } from 'mindar-image-three';

export class Card {
    constructor(scene, position, width, height, options = {}) {
        this.scene = scene;
        this.position = new THREE.Vector3(position.x, position.y, position.z);

        // setup mindar
        // const mindarThree = new MindARThree({
            
        // })
        
        this.height = height || CARD_DIMENSIONS.height;
        this.width = width || CARD_DIMENSIONS.width;

        // Mengambil pertanyaan dari localStorage dengan format yang benar
        const questionsData = JSON.parse(localStorage.getItem('Questions'));
        this.questions = questionsData;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.totalPoints = 0;

        console.log("length", this.questions[0].question.length);
        
        
        // Text content
        this.updateCardContent();

        // Initialize components
        this.cardGroup = new THREE.Group();
        this.buttons = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Store text meshes for easy cleanup
        this.textMeshes = {
            header: null,
            body: null,
            footer: null,
            button1: null,
            button2: null
        };

        this.init();
    }

    updateCardContent() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (currentQuestion) {
            this.headerText = `Question ${this.currentQuestionIndex + 1}/${this.questions.length}`;
            this.bodyText = currentQuestion.question;
            this.footerText = `Total Points: ${this.totalPoints}`;
            this.button1Text = 'Yes';
            this.button2Text = 'No';
        } else {
            this.headerText = 'Finished!';
            this.bodyText = `Your Final Score: ${this.totalPoints} out of ${this.questions.length * 25}`;
            this.footerText = 'Thank you for answering all questions';
            this.button1Text = 'Restart';
            this.button2Text = 'Exit';
        }
    }

    clearTextMeshes() {
        // Remove all existing text meshes
        Object.values(this.textMeshes).forEach(mesh => {
            if (mesh) {
                this.cardGroup.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
            }
        });
        
        // Reset text meshes object
        this.textMeshes = {
            header: null,
            body: null,
            footer: null,
            button1: null,
            button2: null
        };
    }

    async init() {
        this.createCardBody();
        this.createButtons();
        
        const font = await TextCreator.loadFont();
        this.addTextContent(font);
        
        // this.cardGroup.position.copy(this.position);
        // this.scene.add(this.cardGroup);
        // return this.cardGroup;
    }

    saveAnswer(isYes) {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const answer = {
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            userAnswer: isYes ? "yes" : "no",
            correctAnswer: currentQuestion.answer,
            points: isYes ? 25 : 0
        };

        this.answers.push(answer);
        this.totalPoints += answer.points;

        localStorage.setItem('UserAnswers', JSON.stringify({
            answers: this.answers,
            totalPoints: this.totalPoints,
            completedAt: new Date().toISOString()
        }));

        this.currentQuestionIndex++;
        this.updateCardDisplay();
    }

    updateCardDisplay() {
        this.updateCardContent();
        this.clearTextMeshes(); // Clear existing text meshes
        
        TextCreator.loadFont().then(font => {
            this.addTextContent(font);
        });
    }

    addTextContent(font) {
        const { height, headerHeight, depth } = CARD_DIMENSIONS;

        // Header text
        this.textMeshes.header = TextCreator.createText({
            text: this.headerText,
            font,
            size: 0.4,
            height: 0.05,
            color: CARD_COLORS.textLight,
            position: new THREE.Vector3(0, height / 2 - headerHeight / 2, depth)
        });

        // Body text
        this.textMeshes.body = TextCreator.createText({
            text: this.bodyText,
            font,
            size: 0.3,
            height: 0.05,
            color: CARD_COLORS.text,
            position: new THREE.Vector3(0, 0, depth)
        });

        // Footer text
        this.textMeshes.footer = TextCreator.createText({
            text: this.footerText,
            font,
            size: 0.3,
            height: 0.05,
            color: CARD_COLORS.text,
            position: new THREE.Vector3(0, -height / 3, depth)
        });

        // Button texts
        this.textMeshes.button1 = this.createButtonText(this.button1, this.button1Text, font);
        this.textMeshes.button2 = this.createButtonText(this.button2, this.button2Text, font);

        // Add all text meshes to card group
        Object.values(this.textMeshes).forEach(mesh => {
            if (mesh) {
                mesh.isText = true;
                this.cardGroup.add(mesh);
            }
        });
    }

    createButtonText(button, text, font) {
        return TextCreator.createText({
            text,
            font,
            size: 0.2,
            height: 0.05,
            color: CARD_COLORS.text,
            position: new THREE.Vector3(
                button.position.x,
                button.position.y,
                button.position.z + CARD_DIMENSIONS.buttonDepth
            )
        });
    }

    handleButtonClick(button) {
        const isButton1 = button === this.button1;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.saveAnswer(isButton1);
        } else {
            if (isButton1) {
                this.currentQuestionIndex = 0;
                this.answers = [];
                this.totalPoints = 0;
                localStorage.removeItem('UserAnswers');
                this.updateCardDisplay();
            } else {
                console.log("Exit application");
                localStorage.removeItem('UserAnswers');
            }
        }

        this.animateButtonClick(button);
    }

    // ... (sisanya tetap sama seperti sebelumnya)
    createCardBody() {
        const { width, height, depth, headerHeight, footerHeight } = CARD_DIMENSIONS;
        const bodyHeight = height - headerHeight - footerHeight;

        // Header
        const header = CardSection.create(
            width,
            headerHeight,
            CARD_COLORS.header,
            0,
            height / 2 - headerHeight / 2,
            depth
        );

        // Body
        const body = CardSection.create(
            width,
            bodyHeight,
            CARD_COLORS.body,
            0,
            0,
            depth
        );

        // Footer
        const footer = CardSection.create(
            width,
            footerHeight,
            CARD_COLORS.footer,
            0,
            -height / 2 + footerHeight / 2,
            depth
        );

        this.cardGroup.add(header, body, footer);
    }

    createButtons() {
        const { height, footerHeight, buttonWidth, buttonHeight, buttonDepth, buttonSpacing } = CARD_DIMENSIONS;
        const buttonY = -height / 2 + footerHeight / 2;
        const button1X = -buttonWidth - buttonSpacing / 2;
        const button2X = buttonSpacing / 2;

        this.button1 = CardButton.create(
            buttonWidth,
            buttonHeight,
            buttonDepth,
            CARD_COLORS.button1,
            new THREE.Vector3(button1X, buttonY, buttonDepth / 2)
        );

        this.button2 = CardButton.create(
            buttonWidth,
            buttonHeight,
            buttonDepth,
            CARD_COLORS.button2,
            new THREE.Vector3(button2X, buttonY, buttonDepth / 2)
        );

        this.buttons.push(this.button1, this.button2);
        this.cardGroup.add(this.button1, this.button2);
    }

    updateMousePosition(mouseX, mouseY) {
        this.mouse.x = (mouseX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(mouseY / window.innerHeight) * 2 + 1;
    }

    getButtonIntersections() {
        this.raycaster.setFromCamera(this.mouse, this.scene.camera);
        return this.raycaster.intersectObjects(this.buttons);
    }

    checkButtonClick(mouseX, mouseY) {
        this.updateMousePosition(mouseX, mouseY);
        const intersects = this.getButtonIntersections();

        if (intersects.length > 0) {
            this.handleButtonClick(intersects[0].object);
        }
    }

    updateHover(mouseX, mouseY) {
        this.updateMousePosition(mouseX, mouseY);
        const intersects = this.getButtonIntersections();

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

    animateButtonClick(button) {
        const originalScale = button.scale.clone();
        button.scale.multiplyScalar(0.9);
        setTimeout(() => {
            button.scale.copy(originalScale);
        }, 100);
    }
}