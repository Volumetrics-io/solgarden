class MRUIRange extends MREntity {

    constructor() {
        super()

        this.type = 'range';
        this.hoverName = 'hoverRange';
        this.weaponName = 'rangeName';
        this.weaponAttack = 'rangeAttack';

        this.label = document.createElement("mr-text");
        this.weapons = [{
                name: "slingshot",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-slingshot1-UI.glb",
            },
            {
                name: "bow",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-bow1-UI.glb",
            },
        ];

        this.selection = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.2, 0.8),
            new THREE.MeshPhongMaterial({
                color: Colors.objects,
                transparent: true,
                opacity: 0.5
            }));
        this.object3D.add(this.selection);
    }

    connected() {

        this.addEventListener('touchend', () => {
            if (State.isInteractive) {
                State.selectedWeapon = this.type;
                State.needsUpdate = true;
            }
        })

        this.addEventListener('mouseover', () => {
            if (State.isInteractive) {
                State[this.hoverName] = true;
                State.needsUpdate = true;
            }
        })

        this.addEventListener('mouseout', () => {
            if (State.isInteractive) {
                State[this.hoverName] = false;
                State.needsUpdate = true;
            }
        });

        this.label.style.fontSize = '300px';
        this.label.style.color = '#000';
        this.label.textObj.position.setX((-this.label.width / 2) / 0.005);
        this.label.dataset.rotation = "0 0 0";
        this.label.dataset.position = "0 0.15 0";

        this.weapons.forEach((weapon, i) => {
            this.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            weapon.el.dataset.position = "0 0.05 0";
        });
    }

    update(timer) {

        this.weapons.forEach((weapon, i) => {
            console.log(weapon.name, State[this.weaponName]);
            if (weapon.name == State[this.weaponName]) {
                weapon.el.style.visibility = "visible";
            } else {
                weapon.el.style.visibility = "hidden";
            }
        });

        if (State[this.weaponName]) {
            this.label.innerText = State[this.weaponAttack];
        } else {
            this.label.innerText = "";
        }

        // TODO: ew
        if (State.isInteractive) {
            this.selection.material.color.setStyle(Colors.objects);

            if (State.selectedWeapon == this.type && State[this.weaponName]) {
                this.selection.material.opacity = 0.5;
            } else {
                this.selection.material.opacity = 0;
            }
        } else {
            this.selection.material.color.setStyle(Colors.neutral);

            if (State.selectedWeapon == this.type && State[this.weaponName]) {
                this.selection.material.opacity = 0.5;
            } else {
                this.selection.material.opacity = 0;
            }
        }
    }
}

customElements.define('mr-ui-range', MRUIRange);
