/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier BIOT
 * http://www.melonjs.org
 *
 */

(function($) {
    /**
     * Single Particle Object.
     * @class
     * @extends me.SpriteObject
     * @memberOf me
     * @constructor
     * @param {me.ParticleEmitter} particle emitter
     */
    me.Particle = me.Renderable.extend(
    /** @scope me.Particle.prototype */
    {
        
        /**
         * @ignore
         */
        init: function(emitter) {
            // Call the parent constructor
            this.parent(new me.Vector2d(emitter.pos.x + (Number.prototype.random(-emitter.varPos.x, emitter.varPos.x)),
                        emitter.pos.y + (Number.prototype.random(-emitter.varPos.y, emitter.varPos.y))),
                        emitter.image.width, emitter.image.height);

            // Particle will always update
            this.alwaysUpdate = true;

            // Cache the particle emitter
            this._emitter = emitter;

            // Set the start particle Angle and Speed as defined in emitter
            var angle = Number.prototype.random(emitter.minAngle * 10, emitter.maxAngle * 10) / 10;
            var speed = Number.prototype.random(emitter.minSpeed, emitter.maxSpeed);

            // Set the start particle Velocity
            this.vel = new me.Vector2d(speed * Math.cos(angle), -speed * Math.sin(angle));

            // Set the start particle Time of Life as defined in emitter
            this.life = Number.prototype.random(emitter.minLife, emitter.maxLife);
            this.startLife = this.life;

            // Set the start and end particle Scale as defined in emitter
            // clamp the values as minimum and maximum scales range
            this.startScale = Number.prototype.random(emitter.minStartScale, emitter.maxStartScale).
                            clamp(emitter.minStartScale, emitter.maxStartScale);
            this.endScale = Number.prototype.random(emitter.minEndScale, emitter.maxEndScale).
                            clamp(emitter.minEndScale, emitter.maxEndScale);

            // Set the particle Gravity and Wind (horizontal gravity) as defined in emitter
            this.gravity = emitter.gravity;
            this.wind = emitter.wind;

            // Set if the particle update the rotation in accordance the trajectory
            this.followTrajectory = emitter.followTrajectory;

            // Set if the particle update only in Viewport
            this.onlyInViewport = emitter.onlyInViewport;

            // Set the particle Z Order
            this.z = emitter.z;

            // cache inverse of the expected delta time
            this._deltaInv = me.sys.fps / 1000;

            this.transform = new me.Matrix2d(1, 0, 0, 1, this.pos.x, this.pos.y);

            // Set the start particle rotation as defined in emitter
            // if the particle not follow trajectory
            if (!emitter.followTrajectory) {
                this.angle = Number.prototype.random(emitter.minRotation, emitter.maxRotation);
            }
        },

        /**
         * Update the Particle <br>
         * This is automatically called by the game manager {@link me.game}
         * @name update
         * @memberOf me.Particle
         * @function
         * @ignore
         * @param {Number} dt time since the last update in milliseconds
         */
        update: function(dt) {
            // move things forward independent of the current frame rate
            var skew = dt * this._deltaInv;

            // Decrease particle life
            this.life = this.life > dt ? this.life - dt : 0;

            // Calculate the particle Age Ratio
            var ageRatio = this.life / this.startLife;

            // Resize the particle as particle Age Ratio
            var scale = this.startScale;
            if(this.startScale > this.endScale) {
                scale *= ageRatio;
                scale = (scale < this.endScale) ? this.endScale : scale;
            } else if(this.startScale < this.endScale) {
                scale /= ageRatio;
                scale = (scale > this.endScale) ? this.endScale : scale;
            }

            // Set the particle opacity as Age Ratio
            this.alpha = ageRatio;

            // Adjust the particle velocity
            this.vel.x += this.wind * skew;
            this.vel.y += this.gravity * skew;

            // If necessary update the rotation of particle in accordance the particle trajectory
            var angle = this.followTrajectory ? Math.atan2(this.vel.y, this.vel.x) : this.angle;

            // Update particle transform
            this.transform.setScale(scale).rotateLocal(angle).translate(this.vel.x * skew, this.vel.y * skew);

            // Return true if the particle is not dead yet 
            return (this.inViewport || !this.onlyInViewport) && (this.life > 0);
        },

        draw: function(context, originalAlpha) {
            // particle alpha value
            context.globalAlpha = originalAlpha * this.alpha;

            // translate to the defined anchor point and scale it
            var transform = this.transform;
            context.setTransform(transform.a, transform.b, transform.c, transform.d, ~~transform.e, ~~transform.f);

            var w = this.width, h = this.height;
            context.drawImage(this._emitter.image,
                            0, 0,
                            w, h,
                            -w / 2, -h / 2,
                            w, h);
        }
    });


    /*---------------------------------------------------------*/
    // END END END
    /*---------------------------------------------------------*/
})(window);
