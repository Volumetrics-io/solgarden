class MRUIMeleeWeapon extends MREntity {

    constructor() {
        super()
        // this.el = document.createElement("mr-model");

        this.attackValueEl = document.createElement("mr-text");

        this.meleeWeapons = [{
                name: "twig",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-stick1.glb",
            },
            {
                name: "short-sword",
                el: document.createElement("mr-model"),
                src: "assets/models/weapon-shortSword01.glb",
            },
        ]
    }

    connected() {

        this.appendChild(this.attackValueEl);
        // this.attackValueEl.innerText = '99';
        this.attackValueEl.style.fontSize = '300px';
        this.attackValueEl.style.color = 'black';
        this.attackValueEl.textObj.position.setX((-this.attackValueEl.width / 2) / 0.005);
        this.attackValueEl.dataset.rotation = "270 0 270";
        this.attackValueEl.dataset.position = "0 0.2 0";

        this.meleeWeapons.forEach((weapon, i) => {
            this.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            // weapon.el.style.scale = 0.05;
            // weapon.el.style.pointerEvents = 'none';
        });

        const selectedWeaponName = this.dataset.selectedWeaponName ?? "short-sword";
        this.setWeapon(selectedWeaponName);

        // console.log(selectedWeaponName)
    }

    setAttackValue(value) {
        // console.log(value);
        this.attackValueEl.innerText = value;
    }

    setWeapon(selectedWeaponName) {
        // console.log(selectedWeaponName);
        // this.attackValueEl
        // console.log('selected weapon: ' + selectedWeaponName);
        this.meleeWeapons.forEach((weapon, i) => {
            if (weapon.name == selectedWeaponName) {
                weapon.el.style.visibility = "visible";
            } else {
                weapon.el.style.visibility = "hidden";
            }
        });
    }

}

customElements.define('mr-ui-melee-weapon', MRUIMeleeWeapon);
