class MREnemy extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.damageContainer = document.createElement("mr-div")
        this.damageValue = document.createElement("mr-text");
        this.damageValueBackface = document.createElement("mr-text");

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
        this.el.src = EnemyModels[subtype];

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


        // Damage display
        this.appendChild(this.damageContainer);
        this.damageContainer.dataset.position = '0 2.5 0';
        this.damageContainer.style.scale = 1 / 0.05; // will be fixed soon in MRjs
        Object.assign(this.damageContainer.style, {
            padding: "5px 10px",
            width: "auto",
            borderRadius: "5px",
            backgroundColor: Colors.health,
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

customElements.define('mr-enemy', MREnemy);
