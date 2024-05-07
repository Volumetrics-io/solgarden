class MRUIWeapon extends MREntity {

    constructor() {
        super()

        this.weapons = [];
        this.isHovered = false;

        this.label = document.createElement("mr-text");
        this.tileSelected = document.createElement('mr-model');
        this.tileNeutral = document.createElement('mr-model');
        this.tileHover = document.createElement('mr-model');
    }

    connected() {
        this.type = this.dataset.type ?? 0;

        WEAPONS[this.type].forEach((weapon, i) => {
            weapon.el = document.createElement("mr-model");
            this.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.uiModel);
            weapon.el.style.visibility = 'hidden';
            this.weapons.push(weapon);
        });

        this.addEventListener('touchend', () => {
            if (State.isInteractive && State.weapons[this.type].attack > 0) {
                this.isHovered = false;
                State.selectedWeaponID = this.type;
                State.needsUpdate = true;
            }
        })

        this.addEventListener('mouseover', () => {
            if (State.isInteractive && State.weapons[this.type].range > 0) {
                this.isHovered = true;
                State.displayRange = State.weapons[this.type].range;
                State.needsUpdate = true;
            }
        })

        this.addEventListener('mouseout', () => {
            if (State.isInteractive) {
                this.isHovered = false;
                State.displayRange = 0;
                State.needsUpdate = true;
            }
        });

        this.appendChild(this.tileSelected);
        this.appendChild(this.tileNeutral);
        this.appendChild(this.tileHover);

        this.tileSelected.src = './assets/ui-models/borderObject-white.glb';
        this.tileNeutral.src = './assets/ui-models/borderObject-neutral.glb';
        this.tileHover.src = './assets/ui-models/borderObject-movement.glb';

        this.tileSelected.style.visibility = 'hidden';
        this.tileNeutral.style.visibility = 'hidden';
        this.tileHover.style.visibility = 'hidden';

        this.appendChild(this.label);
        this.label.className = 'hud-text';
        this.label.dataset.rotation = "270 0 0";
        this.label.dataset.position = "-0.3 0 -0.35";
    }

    update(timer) {

        this.weapons.forEach((weapon, i) => {
            if (weapon.subtype == State.weapons[this.type].subtype) {
                weapon.el.style.visibility = "visible";
            } else {
                weapon.el.style.visibility = "hidden";
            }
        });

        if (State.weapons[this.type].attack > 0) {
            this.label.innerText = State.weapons[this.type].attack;
        } else {
            this.label.innerText = "";
        }

        this.tileSelected.style.visibility = 'hidden';
        this.tileNeutral.style.visibility = 'hidden';
        this.tileHover.style.visibility = 'hidden';

        if (State.isInteractive) {
            if (this.isHovered) {
                this.tileHover.style.visibility = 'visible';
            } else if (State.selectedWeaponID == this.type) {
                this.tileSelected.style.visibility = 'visible';
            } else {
                this.tileNeutral.style.visibility = 'visible';
            }
        } else {
            this.tileNeutral.style.visibility = 'visible';
        }


    }
}

customElements.define('mr-ui-weapon', MRUIWeapon);
