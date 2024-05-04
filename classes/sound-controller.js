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
            battery: document.querySelector('#fridge-sound'),
            plains: document.querySelector('#farm-sound'),
            desert: document.querySelector('#badlands-sound'),
            spawn: document.querySelector('#badlands-sound'),
        }

        this.initialize();
    }

    initialize() {
        this.sounds.battery.components.set('audio', {
            action: 'pause'
        });
        this.sounds.plains.components.set('audio', {
            action: 'pause'
        });
        this.sounds.desert.components.set('audio', {
            action: 'pause'
        });
    }

    play(sound) {
        this.sounds[sound].components.set('audio', {
            action: 'play'
        });
    }

    background(sound) {
        this.sounds.battery.components.set('audio', {
            action: 'pause'
        });
        this.sounds.plains.components.set('audio', {
            action: 'pause'
        });
        this.sounds.desert.components.set('audio', {
            action: 'pause'
        });
        this.sounds.spawn.components.set('audio', {
            action: 'pause'
        });
        this.play(sound)
    }

    // moveSoundPosition(sound, position) {
    //     this.sounds[sound] = position;
    // }

}
