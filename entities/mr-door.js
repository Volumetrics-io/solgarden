class MRDoor extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.ui = document.createElement("mr-model");

        // <mr-entity id="door-sound" data-comp-audio="src: ./audio/door-hinge.mp3; loop: false; state: stop;"></mr-entity>

        // this.el.onLoad = () => {
        //     this.el.object3D.traverse(object => {
        //         if (object.isMesh) {
        //             // Necessary for the single-faced
        //             // grass texture to appear correctly
        //             object.material.alphaTest = 0.5;
        //             object.receiveShadow = true;
        //             object.castShadow = true;
        //             object.morphTargets = true;
        //         }
        //     })
        // }
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "models/door1.glb";
        this.el.style.pointerEvents = 'none';

        this.appendChild(this.ui);
        this.ui.src = "models/door1-UI.glb";
        this.ui.style.pointerEvents = 'none';

        this.dataset.rotation = `0 180 0`

        this.components.set('audio', {
            src: "./audio/door-hinge.mp3",
            loop: false,
            state: "stop"
        })

        this.ui.components.set('animation', {
            clip: 0,
            action: "stop",
            loop: false,
            clampWhenFinished: true,
        })

        this.el.components.set('animation', {
            clip: 0,
            action: "stop",
            loop: false,
            clampWhenFinished: true,
        })

        if (this.dataset.hasKey !== undefined) {
            this.ui.components.set('animation', {
                action: "play",
            })

            this.el.components.set('animation', {
                action: "play",
            })
        }
    }

    open() {
        this.ui.components.set('animation', {
            action: "play",
        })

        setTimeout(() => {
            this.components.set('audio', {
                state: "play"
            })

        }, 1200);

        setTimeout(() => {
            this.el.components.set('animation', {
                action: "play",
            })

        }, 1000);
    }

}

customElements.define('mr-door', MRDoor);
