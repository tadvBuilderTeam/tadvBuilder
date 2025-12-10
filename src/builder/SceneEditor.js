import AsciiTreeRenderer from "./AsciiTreeRenderer.js";
import Feedback from "./Feedback.js";
import SceneRenderer from "./SceneRenderer.js";
import Scene from "./core/Scene.js";
import Story from "./core/Story.js";
import TreeEditor from "./TreeEditor.js";

/**
 * Editor used by the form-based story builder.
 * Holds a reference to the Story instance and the Scene class.
 */
export default class SceneEditor {
    /**
     * @param {Story} storyInstance - The story instance to be edited.
     */
    constructor(storyInstance) {
        this.story = storyInstance;
    }

    /**
     * Adds a new choice field to the choices container.
     * @param {HTMLElement} parentElement
     * @returns void
     */
    static addChoiceField(parentElement) {
        if (!parentElement) {
            console.error('parentElement is not found.');
            return;
        }

        const container = document.createElement('div');
        container.className = 'choice-inputs';
        container.innerHTML = `
        <input type="text" class="choice-text" placeholder="Entscheidungstext">
        <input type="text" class="choice-next" placeholder="Nächste Szene (Schlüssel)">
      `;
        parentElement.appendChild(container);
    }

    /**
     * Adds a new scene to the story.
     * @param {Story} story
     * @returns void
     */
    static addScene(story) {
        const sceneKey = document.getElementById('creator-scene-key').value.trim();
        const text = document.getElementById('creator-scene-text').value.trim();
        const editorSection = document.getElementById('scene-creator');

        if (!sceneKey || !text) {
            Feedback.show("Bitte Schlüssel und Text ausfüllen.", editorSection, false);
            return;
        }

        const creatorChoicesContainer = document.getElementById('creator-choices-container');
        const choiceElements = Array.from(creatorChoicesContainer.querySelectorAll('.choice-inputs'));
        const choices = new Map();
        choiceElements.forEach(el => {
            const textInput = el.querySelector('.choice-text');
            const nextInput = el.querySelector('.choice-next');
            if(! nextInput) {
                console.log("No input for next scene key found. ");
            }
            const text = textInput.value.trim();
            const next = nextInput.value.trim();
            if (text && next) choices.set(next, text);
        });

        if (!story.addScene(new Scene(sceneKey, text, null, choices))) {
            Feedback.show("Scene could not be added to story, key already exists.", editorSection, false);
            return;
        }
        SceneRenderer.render(story, sceneKey);
        AsciiTreeRenderer.generateTreeAscii(story);
        TreeEditor.render(story);

        // Eingabefelder leeren
        document.getElementById('creator-scene-key').value = "";
        document.getElementById('creator-scene-text').value = "";
        const choicesContainer = document.getElementById('creator-choices-container');
        choicesContainer.innerHTML = `<div class="choice-inputs">
    <input type="text" class="choice-text" placeholder="Entscheidungstext">
    <input type="text" class="choice-next" placeholder="Nächste Szene (Schlüssel)">
    </div>`;

        Feedback.show(`Szene wurde gespeichert.`, editorSection, true)
    }

    /**
     * @param {Story} story
     */
    static editScene(story) {
        const keyInput = document.getElementById("editor-scene-key");
        const status = document.getElementById("editor-scene-status");
        const textInput = document.getElementById("editor-scene-text");
        const choicesContainer = document.getElementById("editor-choices-container");
        const key = keyInput.value.trim();
        const text = textInput.value.trim();

        if (!key) {
            Feedback.show("Bitte gib den Schlüssel der zu bearbeitenden Szene ein.", status, false);
            return;
        }

        let choices = new Map();
        for (const el of choicesContainer.children) {
            if (!el.classList.contains('choice-inputs')) continue;

            let choiceTextInput = el.querySelector(".choice-text");
            let choiceKeyInput = el.querySelector(".choice-next");

            if (!choiceTextInput || !choiceKeyInput
                || !(choiceTextInput instanceof HTMLInputElement) || !(choiceKeyInput instanceof HTMLInputElement)) {
                console.log("Error in editScene: Invalid choice input elements. Skipping choice.");
                continue;
            }
            let choiceKey = choiceKeyInput.value.trim();
            let choiceText = choiceTextInput.value.trim();
            if( !choiceKey ) continue;
            choices.set(choiceKey, choiceText);
        }

        let success = story.editScene(key, text, choices);
        if (success) {
            SceneRenderer.render(story, key);
            Feedback.show(`Szene wurde erfolgreich bearbeitet.`, status, true);
        }
    }
}
