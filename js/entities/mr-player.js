class MRPlayer extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.light = document.createElement("mr-light");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");

        this.el.onLoad = () => {
            // let mixer = this.el.mixer;
            let animations = this.el.animations;

            this.el.mixer = new THREE.AnimationMixer(this.el.object3D);
            this.el.mixer.clipAction(THREE.AnimationUtils.subclip(animations[0], 'idle', 0, 30)).setDuration(1).play(); //0
            this.el.mixer.clipAction(THREE.AnimationUtils.subclip(animations[0], 'run', 60, 75)).setDuration(1).play(); //1
            this.el.mixer._actions[0].enabled = true;
            this.el.mixer._actions[1].enabled = false;

            console.log(this.el.mixer, animations);

            this.playIdleAnimation();
        }
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/dot-test.glb";
        this.el.style.pointerEvents = 'none';

        //character
        // const gltfLoader = new GLTFLoader();
        // gltfLoader.load('./character.glb', function(gltf) {
        //     character = gltf.scene;
        //     mixer = new THREE.AnimationMixer(character);
        //     mixer.clipAction(THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 0, 221)).setDuration(6).play(); //0
        //     mixer.clipAction(THREE.AnimationUtils.subclip(gltf.animations[0], 'run', 222, 244)).setDuration(0.7).play(); //1
        //     mixer._actions[0].enabled = true;
        //     mixer._actions[1].enabled = false;
        //     character.children[1].visible = true;
        //     character.children[2].visible = false;
        //     scene.add(character);
        // }); //end loader

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
        this.light.setAttribute('intensity', 0.03);
        this.light.dataset.position = `0 0.6 0.3`;
    }

    playIdleAnimation() {
        let action = this.el.mixer.clipAction(0);
        action.reset.play();

        // this.el.components.set("animation", {
        //     clip: 0,
        //     action: "play",
        //     loop: true,
        // });
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
