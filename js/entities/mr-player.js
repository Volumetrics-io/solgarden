class MRPlayer extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.el.src = "assets/models/dot_unarmed.glb";
        this.el.style.pointerEvents = 'none';

        this.light = document.createElement("mr-light");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");

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

            _updateClipsFor('idle', 1, 60);
            _updateClipsFor('attack-melee', 61, 75);

            /* --- Play the default animation --- */

            this.playIdleAnimation();
        }
    }

    connected() {
        this.appendChild(this.el);
        this.appendChild(this.swooshSound);
        this.appendChild(this.bowReleaseSound);

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

        this.appendChild(this.light);
        this.light.setAttribute('color', "#ffffff");
        this.light.setAttribute('intensity', 0.02);
        this.light.dataset.position = `0 0.6 0.3`;
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
            clip: 'attack-melee',
            action: "play",
            loop: false,
            clampWhenFinished: true
        });
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

customElements.define('mr-player', MRPlayer);
