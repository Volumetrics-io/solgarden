class MRPlayer extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.el.src = "assets/models/dot-test.glb";
        this.el.style.pointerEvents = 'none';

        this.light = document.createElement("mr-light");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");

        this.el.onLoad = () => {
            console.log(entity.animations);

            /* --- Cleanup animation clips for player --- */

            // Since the animations we're using take up all the frames,
            // we want to trip the frames that we know are not needed.

            const _getAnimationIndex = (name) => {
                let targetAnimationIndex = -1;
                animations.forEach(function(animation, index) {
                    if (animation.name === targetAnimationName) {
                        targetAnimationIndex = index;
                        return;
                    }
                });

                if (targetAnimationIndex === -1) {
                    console.error('Animation with name ' + targetAnimationName + ' not found.');
                    return;
                }
                return targetAnimationIndex;
            }

            // trim idle clip frames
            let animIndex = _getAnimationIndex('idle');
            let originalAnimationClip = this.el.animations[animIndex];
            let subclip = AnimationUtils.subclip(originalAnimationClip, 'idle', 1, 30);
            entity.animations[animIndex] = subclip;

            // trim attack-melee clip frames
            animIndex = _getAnimationIndex('idle');
            originalAnimationClip = this.el.animations[_getAnimationIndex('attack-melee')];
            subclip = AnimationUtils.subclip(originalAnimationClip, 'attack-melee', 61, 75);
            entity.animations[animIndex] = subclip;

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
