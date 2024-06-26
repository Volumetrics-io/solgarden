class MREnemy extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");
        this.critSound = document.createElement("mr-entity");

        this.poof = document.createElement("mr-model");

        this.el.onLoad = () => {

            // Bind our utils function to the current context here
            // so we can use the information more easily.

            const boundUpdateClipsFor = updateClipsFor.bind(this.el);

            // Cleanup animation clips for enemy

            switch (this.subtype) {
            case 'static':
                boundUpdateClipsFor('idle', 1, 30);
                boundUpdateClipsFor('attack', 31, 45);
                boundUpdateClipsFor('crit', 46, 60);
                boundUpdateClipsFor('damage', 61, 75);
                // console.log('do something');
                break;
            case 'homing':
                boundUpdateClipsFor('idle', 1, 30);
                boundUpdateClipsFor('attack', 31, 45);
                boundUpdateClipsFor('crit', 46, 60);
                boundUpdateClipsFor('damage', 61, 75);
                // console.log('do something');
                break;
            case 'aimless':
            default:
                boundUpdateClipsFor('idle', 1, 30);
                boundUpdateClipsFor('attack', 31, 45);
                boundUpdateClipsFor('crit', 46, 60);
                boundUpdateClipsFor('damage', 61, 75);
            }

            // Play necessary animations

            this.playIdleAnimation();
        }
    }

    async connected() {
        this.appendChild(this.el);
        this.dataset.rotation = `0 180 0`;
        this.el.dataset.compAnimation = "clip: 0; action: play;";

        this.el.style.pointerEvents = 'none';

        this.subtype = this.dataset.subtype ?? "aimless";
        this.el.src = ENEMY_MODELS[this.subtype];

        await super.connected();

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

    playIdleAnimation() {
        this.el.components.set("animation", {
            clip: 'idle',
            action: "play",
            loop: true,
        });
    }

    playCombatAnimation() {
        this.el.components.set("animation", {
            clip: 'attack',
            action: "play",
            loop: false,
            clampWhenFinished: true
        });
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
