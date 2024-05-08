class MRPlayer extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.el.src = "assets/models/dot-test.glb";
        this.el.style.pointerEvents = 'none';
        this.el.object3D.name = "---DOTCHAR---";

        this.light = document.createElement("mr-light");

        this.swooshSound = document.createElement("mr-entity");
        this.bowReleaseSound = document.createElement("mr-entity");

        this.el.onLoad = () => {
            let animations = this.el.animations;
            if (!this.el.mixer) {
                this.el.mixer = new THREE.AnimationMixer(this.el.object3D);
            }
            let mixer = this.el.mixer;

            // this.idleAction = mixer.clipAction(THREE.AnimationUtils.subclip(animations[0], 'idle', 0, 30));
            // this.idleAction.setLoop(THREE.LoopRepeat);
            // this.idleAction.enabled = true; // set the idle animation to be the one running

            // this.runAction = mixer.clipAction(THREE.AnimationUtils.subclip(animations[0], 'run', 60, 75)); // 1
            // this.runAction.setLoop(THREE.LoopRepeat);
            // this.runAction.enabled = false; // turn of the run animation for now

            // Find the 'idle' animation clip in the animations array
            const idleAnimationClip = animations.find(clip => clip.name === 'idle');
            console.log('idle anim clip is:', idleAnimationClip);
            this.idleAnimationAction = mixer.clipAction(idleAnimationClip);
            this.idleAnimationAction.setLoop(THREE.LoopRepeat, Infinity);
            this.idleAnimationAction.clampWhenFinished = true; // Ensure the animation stops at the last frame when paused
            // this.idleAnimationAction.enabled = true;

            const attackAnimationClip = animations.find(clip => clip.name === 'attack-melee');
            console.log('attack anim clip is:', attackAnimationClip);
            this.attackAnimationAction = mixer.clipAction(attackAnimationClip);
            this.attackAnimationAction.setLoop(THREE.LoopRepeat, Infinity);
            this.attackAnimationAction.clampWhenFinished = true; // Ensure the animation stops at the last frame when paused
            // this.attackAnimationAction.enabled = false;

            console.log('mixer:', mixer, 'animations', animations);

            this.playIdleAnimation();
        }
    }

    connected() {
        this.appendChild(this.el);
        this.add(this.el);
        

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
        console.log('PLAYING IDLE ANIMATION');
        this.idleAnimationAction.enabled = true;
        this.attackAnimationAction.enabled = false;
        this.idleAnimationAction.reset().play();
        
        // console.log(action);
        // action.reset().play();

        // this.el.components.set("animation", {
        //     clip: 0,
        //     action: "play",
        //     loop: true,
        // });
    }

    playCombatAnimation() {
        console.log('PLAYING COMBAT ANIMATION');
        this.attackAnimationAction.enabled = true;
        this.idleAnimationAction.enabled = false;
        this.attackAnimationAction.reset().play();

        // this.el.components.set("animation", {
        //     clip: 2,
        //     action: "play",
        //     loop: false,
        //     // clampWhenFinished: true
        // });
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
