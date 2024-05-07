class MREnemy extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");
        this.critSound = document.createElement("mr-entity");

        this.poof = document.createElement("mr-model");
    }

    connected() {

        this.appendChild(this.el);
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.dataset.rotation = `0 0 0`
        this.el.style.pointerEvents = 'none';

        const subtype = this.dataset.subtype ?? "aimless";
        this.el.src = ENEMY_MODELS[subtype];

        // Sound effects
        this.appendChild(this.swooshSound);
        this.appendChild(this.bowReleaseSound);
        this.appendChild(this.critSound);
        this.swooshSound.components.set('audio', {
            src: "./assets/audio/swoosh.mp3",
            loop: false,
            action: "stop"
        })
        this.bowReleaseSound.components.set('audio', {
            src: "./assets/audio/bow-release.mp3",
            loop: false,
            action: "stop"
        })
        this.critSound.components.set('audio', {
            src: "./assets/audio/crits.mp3",
            loop: false,
            action: "stop"
        })

        // Poof effect
        this.appendChild(this.poof);
        this.poof.src = "./assets/models/poof1.glb";

        this.poof.components.set('animation', {
            action: "stop",
            loop: false,
        })
    }

    playPoof() {
        this.poof.components.set('animation', {
            action: "play"
        })
    }

    playCrit() {
        this.critSound.components.set('audio', {
            action: "play"
        })
    }

    playSwoosh() {
        this.swooshSound.components.set('audio', {
            action: "play"
        })
    }

    playBowRelease() {
        this.bowReleaseSound.components.set('audio', {
            action: "play"
        })
    }
}

customElements.define('mr-enemy', MREnemy);
