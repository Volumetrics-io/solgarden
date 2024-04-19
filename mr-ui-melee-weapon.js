class MRUIMeleeWeapon extends MREntity {

    constructor() {
        super()
        // this.el = document.createElement("mr-model");

        this.meleeWeapons = [{
                name: "twig",
                el: document.createElement("mr-model"),
                src: "models/weapon-stick1.glb",
            },
            {
                name: "short-sword",
                el: document.createElement("mr-model"),
                src: "models/weapon-shortSword01.glb",
            },
        ]
    }

    connected() {

        this.meleeWeapons.forEach((weapon, i) => {
            this.appendChild(weapon.el);
            weapon.el.setAttribute('src', weapon.src);
            weapon.el.style.scale = 0.05;
            // weapon.el.style.pointerEvents = 'none';
        });

        const selectedWeaponName = this.dataset.selectedWeaponName ?? "short-sword";
        this.setWeapon(selectedWeaponName);

        console.log(selectedWeaponName)
    }

    setWeapon(selectedWeaponName) {
        // console.log('selected weapon: ' + selectedWeaponName);
        this.meleeWeapons.forEach((weapon, i) => {
            if(weapon.name == selectedWeaponName) {
                weapon.el.style.visibility = "visible";
            } else {
                weapon.el.style.visibility = "hidden";
            }
        });
    }

}

customElements.define('mr-ui-melee-weapon', MRUIMeleeWeapon);
