class MRChest extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/chest1.glb";
        this.el.style.pointerEvents = 'none';
        this.el.dataset.rotation = '0 180 0';

        this.components.set('audio', {
            src: "./assets/audio/latch.mp3",
            loop: false,
            action: "stop"
        })

        this.isOpened = false;

        this.el.components.set('animation', {
            clip: 0,
            action: "stop",
            loop: false,
            clampWhenFinished: true,
        })

    }

    open() {
        if (!this.isOpened) {
            this.el.components.set('animation', {
                action: "play",
            })
            this.components.set('audio', {
                action: "play"
            })
            this.isOpened = true;
        }
    }

}

customElements.define('mr-chest', MRChest);
