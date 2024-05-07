class MRPlayer extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.light = document.createElement("mr-light");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/dot-test.glb";
        // this.el.src = "assets/models/mainCharacter_wip.glb";
        // this.el.src = "assets/models/enemy_temp_multiTrack.glb";
        // this.el.src = "assets/models/poof1.glb";
        this.el.style.pointerEvents = 'none';
        // this.el.object3D.traverse(object => {
        //     if (object.isMesh && object.morphTargetInfluences) {
        //         object.morphTargets = true;
        //         object.morphTargetInfluences[0] = 0.2;
        //     }
        // })


        this.appendChild(this.swooshSound);
        this.appendChild(this.bowReleaseSound);

        this.playIdleAnimation();

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
        this.light.setAttribute('intensity', 0.03);
        this.light.dataset.position = `0 0.6 0.3`;
    }

    playIdleAnimation() {
        this.el.components.set("animation", {
            clip: 0,
            action: "play",
            loop: true,
        });
    }

    playCombatAnimation() {
        this.el.components.set("animation", {
            clip: 2,
            action: "play",
            loop: false,
            // clampWhenFinished: true
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
