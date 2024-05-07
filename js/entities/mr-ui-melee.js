class MRUIMelee extends MREntity {

    constructor() {
        super()

        this.type = 'melee';
        this.hoverName = 'hoverMelee';
        this.weaponName = 'meleeName';
        this.weaponAttack = 'meleeAttack';

        this.label = document.createElement("mr-text");
        this.weapons = [{
                name: "twig",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-stick1-UI.glb",
            },
            {
                name: "shortsword",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-shortSword1-UI.glb",
            },
        ];

        this.tileSelected = document.createElement('mr-model');
        this.tileNeutral = document.createElement('mr-model');
        this.tileHover = document.createElement('mr-model');

        // this.selection = new THREE.Mesh(
        //     new THREE.BoxGeometry(0.8, 0.2, 0.8),
        //     new THREE.MeshPhongMaterial({
        //         color: Colors.objects,
        //         transparent: true,
        //         opacity: 0.5
        //     }));
        // this.object3D.add(this.selection);
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

        this.appendChild(this.tileSelected);
        this.appendChild(this.tileNeutral);
        this.appendChild(this.tileHover);

        this.tileSelected.src = './assets/ui-models/borderObject-white.glb';
        this.tileNeutral.src = './assets/ui-models/borderObject-neutral.glb';
        this.tileHover.src = './assets/ui-models/borderObject-health.glb';

        this.tileSelected.style.visibility = 'hidden';
        this.tileNeutral.style.visibility = 'hidden';
        this.tileHover.style.visibility = 'hidden';

        this.appendChild(this.label);
        this.label.className = 'hud-text';
        this.label.dataset.rotation = "270 0 0";

        this.weapons.forEach((weapon, i) => {
            this.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            weapon.el.style.visibility = 'hidden';
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

        this.tileSelected.style.visibility = 'hidden';
        this.tileNeutral.style.visibility = 'hidden';
        this.tileHover.style.visibility = 'hidden';

        if (State.isInteractive) {
            if (State[this.hoverName]) {
                this.tileHover.style.visibility = 'visible';
            } else if (State.selectedWeapon == this.type && State[this.weaponName]) {
                this.tileSelected.style.visibility = 'visible';
            } else {
                this.tileNeutral.style.visibility = 'visible';
            }
        } else {
            this.tileNeutral.style.visibility = 'visible';
        }


    }
}

customElements.define('mr-ui-melee', MRUIMelee);
