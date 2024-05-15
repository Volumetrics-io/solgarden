class MREnemy extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");
        this.critSound = document.createElement("mr-entity");

        this.poof = document.createElement("mr-model");

        this.el.onLoad = () => {

            /* --- Cleanup animation clips for player --- */

            // Since the animations we're using take up all the frames,
            // we want to skip the frames that we know are not needed.

            const _updateClipsFor = (name, startFrame, endFrame) => {
                // Find the original clip
                const index = this.el.animations.findIndex((clip) => clip.name === name);
                if (index === -1) {
                    console.warn('Clip not found by name:', name);
                    return;
                }
                const originalClip = this.el.animations[index];

                // Assume 24 frames per second, adjust according to your animation data
                const fps = 24;
                const newClip = THREE.AnimationUtils.subclip(
                    originalClip,
                    originalClip.name,
                    startFrame,
                    endFrame,
                    fps
                );

                // Replace the original clip with the new subclip in the animations array
                this.el.animations[index] = newClip;
            }

            _updateClipsFor('idle', 1, 30);
            _updateClipsFor('attack', 31, 45);
            _updateClipsFor('crit', 46, 60);
            _updateClipsFor('damage', 61, 75);

            this.playIdleAnimation();
        }
    }

    async connected() {
        this.appendChild(this.el);
        this.el.dataset.compAnimation = "clip: 0; action: play;";

        this.el.style.pointerEvents = 'none';

        const subtype = this.dataset.subtype ?? "aimless";
        this.el.src = ENEMY_MODELS[subtype];

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
