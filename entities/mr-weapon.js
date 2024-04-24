class MRWeapon extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);

        // const levelId = this.dataset.levelId ?? 0;
        const model = this.dataset.model ?? "shortSword";

        const weaponModels = {
            twig: "models/weapon-stick1-pickup.glb",
            shortSword: "models/weapon-shortSword1-pickup.glb",
            slingshot: "models/weapon-slingshot1-pickup.glb",
            bow: "models/weapon-stick1.glb",
        }

        // const Weapons = [{
        //         name: "twig",
        //         model: "models/weapon-stick1.glb",
        //         subtype: "melee"
        //     },
        //     {
        //         name: "short-sword",
        //         model: "models/weapon-shortSword1-pickup.glb",
        //         subtype: "melee"
        //     },
        //     {
        //         name: "slingshot",
        //         model: "models/weapon-slingshot-temp.glb",
        //         subtype: "range"
        //     },
        //     {
        //         name: "bow",
        //         model: "models/weapon-stick1.glb",
        //         subtype: "range"
        //     },
        // ]
        // const randomId = Math.floor(Math.random() * Weapons.length);
        // const weaponId = this.dataset.weaponId ?? randomId;
        // const weapon = Weapons[weaponId];

        this.el.src = weaponModels[model];
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';

        // unused yet
        // this.dataset.type = 'weapon';
        // this.dataset.subType = weapon.subtype;
        // this.dataset.name = weapon.name;
        // this.dataset.attack = levelId + 2;

        // used for now
        // this.type = 'weapon';
        // this.subType = weapon.subtype;
        // this.name = weapon.name;
        // this.attack = levelId + 2;

        // console.log(weapon)

        // console.log(this.name);

        // switch (this.name) {
        //     case "short-sword":
        //         this.el.src = "models/weapon-shortSword01.glb";
        //         break;
        //     case "twig":
        //         this.el.src = "models/weapon-stick1.glb";
        //         break;
        // }


        this.el.style.pointerEvents = 'none';
    }

}

customElements.define('mr-weapon', MRWeapon);
