class MRTile extends MREntity {

    constructor() {
        super()

        this.el = document.createElement("mr-model");

        this.borderWhite = document.createElement("mr-model");
        this.borderObjects = document.createElement("mr-model");
        this.borderHealth = document.createElement("mr-model");
        this.borderNeutral = document.createElement("mr-model");

        this.numberContainer = document.createElement("mr-div");
        this.numberString = document.createElement("mr-text");

        this.rotationCollection = [0, 90, 180, 270];

        this.el.onLoad = () => {
            this.el.object3D.traverse(object => {
                if (object.isMesh && object.morphTargetInfluences) {
                    // Necessary for the single-faced
                    // grass texture to appear correctly
                    object.material.alphaTest = 0.5;
                    // object.receiveShadow = true;
                    // object.castShadow = true;
                    object.morphTargets = true;
                    object.morphTargetInfluences[0] = Math.random()
                }
            })
        }
    }

    connected() {

        // TODO: automate this
        this.appendChild(this.borderWhite);
        this.borderWhite.src = '/ui-models/borderObject-white.glb';
        this.borderWhite.dataset.position = "0 0.2 0";
        this.borderWhite.style.visibility = "hidden";

        this.appendChild(this.borderObjects);
        this.borderObjects.src = '/ui-models/borderObject-objects.glb';
        this.borderObjects.dataset.position = "0 0.2 0";
        this.borderObjects.style.visibility = "hidden";

        this.appendChild(this.borderHealth);
        this.borderHealth.src = '/ui-models/borderObject-health.glb';
        this.borderHealth.dataset.position = "0 0.2 0";
        this.borderHealth.style.visibility = "hidden";

        this.appendChild(this.borderNeutral);
        this.borderNeutral.src = '/ui-models/borderObject-neutral.glb';
        this.borderNeutral.dataset.position = "0 0.2 0";
        this.borderNeutral.style.visibility = "hidden";

        this.appendChild(this.el);
        const tileset = this.dataset.tileset.split(',');
        const tilepath = this.dataset.tilepath;

        let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
        this.dataset.rotation = `0 ${randomRotation} 0`;

        let randomModel = tileset[Math.floor(Math.random() * tileset.length)];
        this.el.src = tilepath + randomModel;

        this.numberString.dataset.position = '0.25 0.3 0';
        this.numberString.style.fontSize = "200px";
        this.numberContainer.appendChild(this.numberString);

        this.numberContainer.dataset.position = '0 0.2 0'
        this.numberContainer.dataset.rotation = `270 0 -${randomRotation + 90}`
        // this.numberContainer.dataset.rotation = `270 0 0`;
        Object.assign(this.numberContainer.style, {
            width: "300px",
            height: "300px",
        })

        this.appendChild(this.numberContainer);
    }

    hideTile() {
        this.borderWhite.style.visibility = "hidden";
        this.borderObjects.style.visibility = "hidden";
        this.borderHealth.style.visibility = "hidden";
        this.borderNeutral.style.visibility = "hidden";
        this.setCostIndicator("");
    }

    tileColor(color) {
        this.hideTile();
        switch (color) {
            case 'neutral':
                this.borderNeutral.style.visibility = "visible";
                this.numberString.style.color = Colors.neutral;
                break;
            case 'white':
                this.borderWhite.style.visibility = "visible";
                this.numberString.style.color = Colors.white;
                break;
            case 'health':
                this.borderHealth.style.visibility = "visible";
                this.numberString.style.color = Colors.health;
                break;
            case 'objects':
                this.borderObjects.style.visibility = "visible";
                this.numberString.style.color = Colors.objects;
                break;
        }
    }

    setCostIndicator(number) {
        this.numberString.innerText = number;
    }
}

customElements.define('mr-tile', MRTile);
