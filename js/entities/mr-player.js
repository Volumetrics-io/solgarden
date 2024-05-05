class MRPlayer extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.light = document.createElement("mr-light");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");

        this.damageContainer = document.createElement("mr-div")
        this.damageValue = document.createElement("mr-text");
        this.damageValueBackface = document.createElement("mr-text");
    }

    connected() {
        this.appendChild(this.el);
        // this.el.src = "assets/models/mainCharacter_wip.glb";
        this.el.src = "assets/models/enemy_temp_multiTrack.glb";
        // this.el.src = "assets/models/poof1.glb";
        this.el.style.pointerEvents = 'none';
        this.el.object3D.traverse(object => {
            if (object.isMesh && object.morphTargetInfluences) {
                object.morphTargets = true;
                object.morphTargetInfluences[0] = 0.2;
            }
        })

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

        this.appendChild(this.damageContainer);
        this.damageContainer.dataset.position = '0 2.5 0';
        this.damageContainer.style.scale = 1 / 0.05; // will be fixed soon in MRjs
        Object.assign(this.damageContainer.style, {
            padding: "5px 10px",
            width: "auto",
            borderRadius: "5px",
            backgroundColor: '#e72d75',
            visibility: 'hidden'
        });

        this.damageContainer.appendChild(this.damageValue);
        this.damageValue.style.fontSize = '16px';
        this.damageValue.style.color = 'white';
        this.damageValue.textObj.position.setX((-this.damageValue.width / 2) / 0.005);

        this.damageContainer.appendChild(this.damageValueBackface);
        this.damageValueBackface.style.fontSize = '16px';
        this.damageValueBackface.style.color = 'white';
        this.damageValueBackface.textObj.position.setX((-this.damageValueBackface.width / 2) / 0.005);
        this.damageValueBackface.dataset.rotation = "0 180 0";
        this.damageValueBackface.dataset.position = "0 0 -0.001";
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
            clip: 1,
            action: "play",
            loop: false,
            clampWhenFinished: true
        });

        setTimeout(() => {
            this.playIdleAnimation();
        }, 2000)
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

    showCritSpikes() {
        this.el.object3D.traverse(object => {
            if (object.isMesh && object.morphTargetInfluences) {
                object.morphTargetInfluences[0] = 0.5;
            }
        })
        setTimeout(() => {
            this.el.object3D.traverse(object => {
                if (object.isMesh && object.morphTargetInfluences) {
                    object.morphTargetInfluences[0] = 0.2;
                }
            })
        }, 500)
    }

    showDamage(string) {
        this.damageValue.innerText = string;
        this.damageValueBackface.innerText = string;

        this.damageContainer.style.visibility = "visible";

        setTimeout(event => {
            this.damageValue.innerText = "";
            this.damageValueBackface.innerText = "";
            this.damageContainer.style.visibility = "hidden";
        }, 500);
    }

}

customElements.define('mr-player', MRPlayer);
