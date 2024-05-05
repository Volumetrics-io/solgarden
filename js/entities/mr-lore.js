class MRLore extends MREntity {

    constructor() {
        super()
        this.el = document.createElement("mr-model");
    }

    connected() {
        this.appendChild(this.el);
        this.el.src = "assets/models/item-memoryCard01.glb";
        this.el.dataset.compAnimation = "clip: 0; action: play;";
        this.el.style.pointerEvents = 'none';

        const loreEntries = [{
                origin: "Journal Entry",
                text: "The day the skies fell silent, and the cities burned like funeral pyres, we knew the age of machines had begun."
            },
            {
                origin: "Faded Note",
                text: "They say during the polar shift, even the robots paused, their eyes blank. If only that darkness had lasted forever."
            },
            {
                origin: "Torn Diary Page",
                text: "Grandma used to tell me, 'Child, we danced under the aurora the night we thought the world ended. It was our defiance, our hope.'"
            },
            {
                origin: "Crinkled Letter",
                text: "Mark, the solar fields are thriving this year. We thank the old tech every day, but remember, respect its power, fear its potential."
            },
            {
                origin: "Whispered Between Elders",
                text: "Ever heard of Bad Guy's name? They say he's more circuit than flesh now, hiding away, nursing his grudge against humanity."
            },
            {
                origin: "Hunter’s Warning",
                text: "Beware the woods. Machines with the faces of beasts roam there, eyes red as the war-time fires."
            },
            {
                origin: "Scout's Report",
                text: "Reports from the east speak of metal claws and laser eyes. The wilderness is reclaiming its dominion, not with trees, but with cold iron."
            },
            {
                origin: "Child's Rhyme",
                text: "Metal paws, laser jaws, run fast, children, from the techno-claws!"
            },
            {
                origin: "Old Soldier's Mumble",
                text: "We used to fear the night for its darkness, now we fear the shine of unblinking electronic eyes."
            },
            {
                origin: "Gardener’s Musing",
                text: "Nature finds a way, they say. But what about a nature made of wires and steel? What finds a way then?"
            },
            {
                origin: "Fisher’s Tale",
                text: "Caught a fish with glowing wires for guts. Threw it back. Some stones are better left unturned."
            },
            {
                origin: "Lover’s Promise",
                text: "Meet me where the wild cyborg roses grow, where once was a battlefield, now a garden."
            },
            {
                origin: "Drifter’s Song",
                text: "Oh, the world’s got teeth now, night’s got eyes; we live 'neath the watchful skies."
            },
            {
                origin: "Hermit’s Advice",
                text: "Trust the sun, boy. It's the only thing that ain't trying to sell you something or spy on you."
            },
            {
                origin: "Bartender’s Joke",
                text: "What’s the difference between a politician and a robot? One’s a programmed liar, the other’s just programmed!"
            },
            {
                origin: "Traveler’s Observation",
                text: "This land's littered with the bones of old cities and the ghosts of their people. Watch your step."
            },
            {
                origin: "Orphan’s Whisper",
                text: "Mama said the robots came like a winter storm, fast and cold. Then, just as quickly, silence."
            },
            {
                origin: "Farmer’s Wisdom",
                text: "Plant your roots deep, where the metal monsters can't reach. Grow quietly, grow strong."
            },
            {
                origin: "Poet’s Verse",
                text: "Beneath shattered moons and suns reborn, we till the fields of wire and thorn."
            },
            {
                origin: "Miner’s Note",
                text: "We dug for hope beneath the rubble, found old world tech - and trouble."
            },
            {
                origin: "Watchman’s Creed",
                text: "Eyes on the forest, heart in the hand, we stand on guard for our scrap-metal land."
            },
            {
                origin: "Librarian’s Record",
                text: "Bad Guy's manifesto was clear: 'With iron and script, I shall engineer fear.'"
            },
            {
                origin: "Teacher’s Lesson",
                text: "Children, remember, the greatest power lies not in what you build, but in what you refrain from destroying."
            },
            {
                origin: "Lost Hiker’s Plea",
                text: "If found, tell them I went north, following the stars, escaping the mechanical beasts’ jaws."
            },
            {
                origin: "Grave Digger’s Eulogy",
                text: "Here lies a man who fought machine with machine, may his circuits rest in peace."
            },
            {
                origin: "Refugee’s Scribble",
                text: "We fled from the cities, seeking sanctuary in the shadows of the silicon gods."
            },
            {
                origin: "Engineer’s Caution",
                text: "To use their tools against them, one must understand them, not just the metal, but the menace within."
            },
            {
                origin: "Survivor’s Guilt",
                text: "The war took everything. Even the victory felt like ashes in our mouths."
            },
            {
                origin: "Old Woman’s Tale",
                text: "When the darkness came, even the machines seemed afraid. That was our chance, our only chance."
            },
            {
                origin: "Scavenger’s Find",
                text: "Picked clean, the carcass of a robo-deer lay mingling with the autumn leaves. Nature always wins, I suppose."
            }
        ];

        const randomId = Math.floor(Math.random() * loreEntries.length);
        this.loreEntry = loreEntries[randomId];
    }

    playLore() {
        console.log(this.loreEntry);
    }

    hideModel() {
        this.removeChild(this.el);
    }

}

customElements.define('mr-lore', MRLore);
