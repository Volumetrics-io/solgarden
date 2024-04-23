class MRMeleeWeapon extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);

        const levelId = this.dataset.levelId ?? 0;

        const randomWeapons = [{
                name: "twig",
                model: "models/weapon-stick1.glb",
                subtype: "melee"
            },
            {
                name: "short-sword",
                model: "models/weapon-shortSword01.glb",
                subtype: "melee"
            },
            {
                name: "slingshot",
                model: "models/weapon-slingshot-temp.glb",
                subtype: "range"
            },
            {
                name: "bow",
                model: "models/weapon-stick1.glb",
                subtype: "range"
            },
        ]

        const weapon = randomWeapons[Math.floor(Math.random() * randomWeapons.length)];

        this.el.src = weapon.model;

        // unused yet
        this.dataset.type = 'weapon';
        this.dataset.subType = weapon.subtype;
        this.dataset.name = weapon.name;
        this.dataset.attack = levelId + 1;

        // used for now
        this.type = 'weapon';
        this.subType = weapon.subtype;
        this.name = weapon.name;
        this.attack = levelId + 1;

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

customElements.define('mr-melee-weapon', MRMeleeWeapon);
