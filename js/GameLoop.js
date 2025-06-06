
export const FRAMERATE = 30;

export class GameLoop{
    constructor(update, render){

        this.lastFrameTime=0;
        this.accumulatedTime=0;
        this.timeStep = 1000/FRAMERATE; //60 fps 


        this.update=update;
        this.render=render;

        this.rafTd = null;
        this.isRunning = false;
    }
    
    mainLoop = (timeStamp) => {
        if(!this.isRunning) return;

        let delta = timeStamp - this.lastFrameTime;
        this.lastFrameTime = timeStamp;

        this.accumulatedTime += delta;

        //we update only if the frame has passed
        while(this.accumulatedTime>=this.timeStep) {
            this.update(this.timeStep);
            this.accumulatedTime -= this.timeStep;
        }

        this.render();

        this.rafTd=requestAnimationFrame(this.mainLoop);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning=true;
            this.rafTd=requestAnimationFrame(this.mainLoop);
        }
    }

    stop() {
        if(this.rafTd) {
            cancelAnimationFrame(this.rafId);
        }
        this.isRunning=false;
    }
}
