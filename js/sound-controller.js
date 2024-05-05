class SoundController {
    constructor() {
        this.sounds = {
            chessSound: document.querySelector('#chess-sound'),
            // doorHinge: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound'),
            clashSound: document.querySelector('#clash-sound'),
            nopeSound: document.querySelector('#nope-sound'),
            swooshSound: document.querySelector('#swoosh-sound'),
            latchSound: document.querySelector('#latch-sound'),
            spawn: document.querySelector('#plains-sound'),
            battery: document.querySelector('#fridge-sound'),
            plains: document.querySelector('#plains-sound'),
            desert: document.querySelector('#desert-sound'),
        }

        this.initialize();
    }

    initialize() {
        this.sounds.spawn.components.set('audio', {
            action: 'pause'
        });
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
        this.sounds.spawn.components.set('audio', {
            action: 'pause'
        });
        this.sounds.battery.components.set('audio', {
            action: 'pause'
        });
        this.sounds.plains.components.set('audio', {
            action: 'pause'
        });
        this.sounds.desert.components.set('audio', {
            action: 'pause'
        });
        this.play(sound);
    }

}
