class SoundController {
    constructor() {
        this.sounds = {
            bgMusic: document.querySelector('#bg-music'),
            chessSound: document.querySelector('#chess-sound'),
            // doorSound: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound'),
            clashSound: document.querySelector('#clash-sound'),
            nopeSound: document.querySelector('#nope-sound'),
            swooshSound: document.querySelector('#swoosh-sound'),
            latchSound: document.querySelector('#latch-sound'),
            fridgeSound: document.querySelector('#fridge-sound'),
            farmSound: document.querySelector('#farm-sound'),
            bandlandsSound: document.querySelector('#badlands-sound'),
        }

        this.initialize();
    }

    initialize() {
        this.sounds.fridgeSound.components.set('audio', {
            action: 'pause'
        });
        this.sounds.farmSound.components.set('audio', {
            action: 'pause'
        });
        this.sounds.bandlandsSound.components.set('audio', {
            action: 'pause'
        });
    }

    play(sound) {
        this.sounds[sound].components.set('audio', {
            action: 'play'
        });
    }

    background(sound) {
        this.sounds.fridgeSound.components.set('audio', {
            action: 'pause'
        });
        this.sounds.farmSound.components.set('audio', {
            action: 'pause'
        });
        this.sounds.bandlandsSound.components.set('audio', {
            action: 'pause'
        });
        this.play(sound)
    }

    // moveSoundPosition(sound, position) {
    //     this.sounds[sound] = position;
    // }

}
