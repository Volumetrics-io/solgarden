class MRDoor extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
        this.ui = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/door1.glb";
        this.el.style.pointerEvents = 'none';

        this.appendChild(this.ui);
        this.ui.src = "assets/models/door1-UI.glb";
        this.ui.style.pointerEvents = 'none';

        this.dataset.rotation = `0 180 0`

        this.components.set('audio', {
            src: "./assets/audio/door-hinge.mp3",
            loop: false,
            action: "stop"
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
                action: "play"
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
