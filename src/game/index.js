import Engine, { loadModel } from '../engine/Engine';
import Camera from '../engine/Camera';
import Texture from '../engine/Texture';
import Plain from '../engine/Plain';
import SkyBox from '../engine/SkyBox';
import CarController from '../engine/CarController';

const PI2 = Math.PI * 2;

window.normalizeAngle = normalizeAngle;

const game = new Engine(document.getElementById('game-view'));
const camera = new Camera(game);

camera.position.y = 1.7;

game.setCamera(camera);

Promise.all([
    loadModel(game, {
        model: 'tank',
    }),
    loadModel(game, {
        model: 'oak',
        alphaTextures: ['blaetter'],
    }),
    SkyBox.loadSkyBox(game, 'skybox.jpg')
]).then(([tank, oak, skyBox]) => {
    game.keyboard.on('keydown', key => {
        if (key === 'q') {
            console.log('QQ');
        }
    });

    const turret = tank.getPart('Turret_2');

    game.addLogicHook(delta => {
        const _delta = delta * 0.0008;

        const needAngle  = camera.rotation.y - tank.rotation.y;
        const deltaAngle = normalizeAngle(turret.rotation.y - needAngle);

        if (deltaAngle < _delta || deltaAngle > PI2 - _delta) {
            turret.rotation.y = needAngle
        } else {
            if (deltaAngle > Math.PI) {
                turret.rotation.y += _delta;
            } else {
                turret.rotation.y -= _delta;
            }
        }
    });

    tank.position = {
        x: 0,
        y: -tank.boundBox.min[1],
        z: -7,
    };

    game.addModel(tank);

    const cc = new CarController(game, tank);
    game.addController(cc);

    game.setSkyBox(skyBox);

    oak.setScale(0.1);
    oak.position.z = 10;
    game.addModel(oak);

    game.startDrawCycle();

    Texture.loadTexture(game, 'grass.jpg').then(texture => {
        const plain = new Plain(game, texture, {
            repeat: [16, 16],
            size:   [128, 128],
        });

        game.addModel(plain);
    });
});

// const triangle = new Model(game, new Float32Array([
//     0, 1, 0,
//     -1, -1, 0,
//     1, -1, 0,
// ]));

function normalizeAngle(angle) {
    let _angle = angle;

    if (_angle < 0) {
        return _angle - Math.floor(_angle / PI2) * PI2;
    } else {
        if (_angle < PI2) {
            return _angle
        } else {
            return _angle % PI2;
        }
    }
}
