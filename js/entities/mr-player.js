class MRPlayer extends MREntity {

    constructor() {
        super()

        this.container = document.createElement('mr-div');
        this.container.style.pointerEvents = 'none';

        const MODELS = [
            'assets/models/dot_unarmed.glb',
            'assets/models/dot_stick.glb',
            'assets/models/dot_shortsword.glb',
            'assets/models/dot_slingshot.glb',
            'assets/models/dot_bow.glb'
        ]

        this.models = [];
        MODELS.forEach((model, i) => {
            const el = document.createElement("mr-model");
            el.src = model;
            if(i > 0) el.style.visibility = 'hidden';

            el.onLoad = () => {

                // Bind our utils function to the current context here
                // so we can use the information more easily.

                const boundUpdateClipsFor = updateClipsFor.bind(el);

                // Cleanup animation clips for player
                boundUpdateClipsFor('idle', 1, 30);
                boundUpdateClipsFor('attack', 31, 45);
                boundUpdateClipsFor('crit', 46, 60);
                boundUpdateClipsFor('damage', 61, 75);
                // boundUpdateClipsFor('death', 31, 80);
                // boundUpdateClipsFor('teleport', 81, 110);

                // Play necessary animations
                this.playIdleAnimation();
            }

            this.models.push(el);
            this.container.append(el);
        })

        // console.log(this.models);

        this.light = document.createElement("mr-light");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");

        // this.el.onLoad = () => {
        //
        //     // Bind our utils function to the current context here
        //     // so we can use the information more easily.
        //
        //     const boundUpdateClipsFor = updateClipsFor.bind(this.el);
        //
        //     // Cleanup animation clips for player
        //
        //     boundUpdateClipsFor('idle', 1, 30);
        //     boundUpdateClipsFor('death', 31, 80);
        //     boundUpdateClipsFor('teleport', 81, 110);
        //
        //     // Play necessary animations
        //
        //     this.playIdleAnimation();
        // }
    }

    connected() {
        this.appendChild(this.container);
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

    update() {
        this.models.forEach((el, i) => {
            el.style.visibility = 'hidden';
        });

        const weaponSubType = STATE.weapons[STATE.selectedWeaponID].subtype;
        // console.log(weaponSubType)
        switch (weaponSubType) {
            case "twig":
                this.models[1].style.visibility = 'visible';
                break;
            case 'shortsword':
                this.models[2].style.visibility = 'visible';
                break;
            case 'slingshot':
                this.models[3].style.visibility = 'visible';
                break;
            case 'bow':
                this.models[4].style.visibility = 'visible';
                break;
            default:
                this.models[0].style.visibility = 'visible';
        }

    }

    playIdleAnimation() {
        this.models.forEach((model, i) => {
            model.components.set("animation", {
                clip: 'idle',
                action: "play",
                loop: true,
            });
        });
    }

    playCombatAnimation() {
        this.models.forEach((model, i) => {
            model.components.set("animation", {
                clip: 'attack',
                action: "play",
                loop: false,
                clampWhenFinished: true
            });
        });

        setTimeout(() => {
            this.playIdleAnimation();
        }, 700);
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
