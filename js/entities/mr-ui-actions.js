class MRUIActions extends MREntity {

    constructor() {
        super()
        this.actionBalls = [];
    }

    connected() {
        const actionBallCount = 10;

        for (let i = 0; i < actionBallCount; i++) {
            const ballGeo = new THREE.SphereGeometry(0.08);
            ballGeo.translate(i * 0.2 + 0.1, 0, 0);
            let actionBall = new THREE.Mesh(
                ballGeo,
                new THREE.MeshPhongMaterial({
                    color: COLORS.movement,
                    transparent: true,
                    opacity: 1
                }));
            this.object3D.add(actionBall);
            this.actionBalls.push(actionBall);
        }
    }

    update(timer) {
        this.actionBalls.forEach((actionBall, i) => {
            if (i < State.maxAction) {
                actionBall.visible = true;
                if (i < State.action) {
                    actionBall.material.color.setStyle(COLORS.white)
                    actionBall.material.opacity = 1;
                } else {
                    actionBall.material.color.setStyle(COLORS.neutral)
                    actionBall.material.opacity = 0.25;
                }

                // recolor the ball if it's a projected cost
                if (i < State.projectedCost) {
                    actionBall.material.color.setStyle(COLORS.movement)
                } else if (State.projectedCost == Infinity) {
                    actionBall.material.color.setStyle(COLORS.neutral)
                }

                // recolor the ball if there are not enough action points
                if (State.projectedCost > State.action) {
                    actionBall.material.color.setStyle(COLORS.neutral)
                }
            } else {
                actionBall.visible = false;
            }
        });
    }
}

customElements.define('mr-ui-actions', MRUIActions);
