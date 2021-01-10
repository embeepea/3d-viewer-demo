import {Axes} from "./axes.js";
import {EventTracker} from "./event_tracker.js";
import {Settings} from "./settings.js";


class App {
  /**
   */
  constructor(container) {
    this.renderRequested = false;
    this.container = container;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );

    this.renderer.setClearColor( 0x000000, 1 );
    this.container.appendChild( this.renderer.domElement );
    this.eventTracker = new EventTracker(this.container);

    this.eventTracker.setMouseDownListener(e => {
    }).setMouseMoveListener(e => {
    }).setTouchStartListener(p => {
    }).setTouchMoveListener((p,dp) => {
      if (p.length >= 2) {
        // >= 2 touch points: rotate camera

        // t = displacement of the midpoint of the 1st two touch points, between this
        // event and the last one
        const t = new THREE.Vector2(
            (dp[0].x + dp[1].x) / 2,
            (dp[0].y + dp[1].y) / 2
        );

        const xangle = 0.25 * (t.y / this.container.offsetWidth) * Math.PI;
        const yangle = 0.25 * (t.x / this.container.offsetWidth) * Math.PI;

        this.cameraXAngle += xangle;
        this.cameraYAngle += yangle;
        this.updateCamera();
      } else {
        // 1 touch point: translate camera

        // t = touch point displacement, between this event and the last
        //    I determined the factor 10 experimentally, based on what seems like reasonable behavior on my phone.
        //    It may or may not be correct for other devices.
        const t = new THREE.Vector2(10 * Settings.walkSpeed * dp[0].x / this.container.offsetWidth,
                                    10 * Settings.walkSpeed * dp[0].y / this.container.offsetWidth);
        this.moveCamera(t);
      }
    }).setMouseUpListener(e => {
      //console.log('mouseUp: e = ', e);
    }).setMouseDragListener((p, dp, button) => {
        const xangle = (dp.y / this.container.offsetWidth) * Math.PI;
        const yangle = (dp.x / this.container.offsetWidth) * Math.PI;

        this.cameraXAngle += xangle;
        this.cameraYAngle += yangle;
        this.updateCamera();
    }).setMouseWheelListener(e => {
      //console.log('mouseWheel: e = ', e);
    }).setKeyPressListener(e => {
      if (e.key == 'w') {
        this.walkCamera(Settings.walkSpeed);
      } else if (e.key == 's') {
        this.walkCamera(-Settings.walkSpeed);
      } else if (e.key == 'a') {
        this.walkCamera(Settings.walkSpeed, /* sideways= */true);
      } else if (e.key == 'd') {
        this.walkCamera(-Settings.walkSpeed, /* sideways= */true);
      } else if (e.key == '1') {
      }
    }).setKeyUpListener(e => {
      // noop
    }).setKeyDownListener(e => {
      // Note these keys (and some other special keys) doesn't trigger a keypress event, so we have to listen
      // for them with keydown instead
      if (e.key == 'ArrowUp') {
        this.walkCamera(Settings.walkSpeed);
      } else if (e.key == 'ArrowDown') {
        this.walkCamera(-Settings.walkSpeed);
      } else if (e.key == 'ArrowLeft') {
        this.walkCamera(Settings.walkSpeed, /* sideways= */true);
      } else if (e.key == 'ArrowRight') {
        this.walkCamera(-Settings.walkSpeed, /* sideways= */true);
      } else if (e.key == 'Escape') {
      }
    });
    this.eventTracker.start();
  }

  mouseToViewportCoords(mouse) {
    return new THREE.Vector2(
        (mouse.x / this.container.offsetWidth) * 2 - 1,
        1 - (mouse.y / this.container.offsetHeight) * 2);
  }

  /*
   * Adjust to a new container size.  Call this e.g. when the browser window size changes.
   */
  resize() {
    this.renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  moveCamera(t) {
    const lookDir = new THREE.Vector3();
    this.camera.getWorldDirection(lookDir);
    const lookLen = Math.sqrt(lookDir.x*lookDir.x + lookDir.z*lookDir.z);
    const forwardDisplacement = new THREE.Vector2(lookDir.x, lookDir.z).multiplyScalar(t.y / lookLen);
    const rightDisplacement = new THREE.Vector2(lookDir.z, -lookDir.x).multiplyScalar(t.x / lookLen);
    this.cameraX += (forwardDisplacement.x + rightDisplacement.x);
    this.cameraZ += (forwardDisplacement.y + rightDisplacement.y);
    this.updateCamera();
  }

  walkCamera(amount, sideways) {
    if (sideways) {
      this.moveCamera(new THREE.Vector2(amount, 0));
      return;
    }
    this.moveCamera(new THREE.Vector2(0, amount));
  }

  initializeLights() {
    // Add ambient lights.
    Settings.lights.Ambient.forEach((item) => {
      this.scene.add(new THREE.AmbientLight(item.color, item.intensity));
    });
    // Add directional lights (no shadows).
    Settings.lights.directional.forEach((item) => {
      const light = new THREE.DirectionalLight(item.color, item.intensity);
      light.position.set(item.position.x, item.position.y, item.position.z);
      this.scene.add(light);
    });
  }

  /**
   * Sets the camera position (& rotation) from this.camera{X,Y,Z} and this.camera{X,Y}Angle,
   * and requests a render.
   */
  updateCamera() {
    this.camera.matrix.identity();

    this.camera.matrix.multiply(new THREE.Matrix4().makeTranslation(this.cameraX, this.cameraY, this.cameraZ));
    this.camera.matrix.multiply(new THREE.Matrix4().makeRotationY(this.cameraYAngle));
    this.camera.matrix.multiply(new THREE.Matrix4().makeRotationX(this.cameraXAngle));

    this.camera.matrixAutoUpdate = false;
    this.camera.matrixWorldNeedsUpdate = true;
    this.requestRender();
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(
        Settings.fieldOfView,
        /* aspectRatio= */ this.container.offsetWidth/this.container.offsetHeight,
        Settings.nearPlane, Settings.farPlane);

    this.cameraXAngle = -0.4;
    this.cameraYAngle = -0.3;
    this.cameraX = -2;
    this.cameraY = 2;
    this.cameraZ = 5;
    this.updateCamera();

    this.scene.add(this.camera);
  }

  initializeAxes() {
    this.axes = Axes.axes3D({
      length: 5.0,
      tipRadius: 0.05,
      tipHeight: 0.1
    });
    this.axes.position.set(0,0.0,0);
    this.scene.add(this.axes);
  }

  // Asyncly load an obj file.  Returns a promise that resolves when the object has been loaded and added to
  // the scene.  Pass the returned promise to this.requestRenderAfterEach() to ensure that the scene gets
  // re-rendered with the new object.
  loadObjFile(file) {
    return fetch(file)
    .then(response => response.text())
    .then(contents => {
      const objLoader = new THREE.OBJLoader();
      const object3D = objLoader.parse(contents);
      this.scene.add(object3D);
    });
  }

  // Request a single re-render in the next possible animation frame.  Note this function does not
  // actually perform a render -- it just requests that one be done at the next possible time.
  // Calling this multiple times before the next animation frame will result in only one re-render
  // on that frame, no matter how many times it was called.
  requestRender() {
    if (this.renderRequested) {
      return;
    }
    this.renderRequested = true;
    requestAnimationFrame(() => {
      this.renderRequested = false;
      this.renderer.render( this.scene, this.camera );
    });
  }

  // Request render passes after the given promise(s) resolve.  Takes any number of arguments,
  // each of which is a promise.  A render pass will be requested after each promise resolves.
  requestRenderAfterEach(...promises) {
    promises.forEach(promise => {
      promise.then(() => {
        this.requestRender();
      });
    });
  }

  initialize() {
    this.initializeAxes();
    this.requestRenderAfterEach(this.loadObjFile("dodec.obj"));

    // lights
    this.initializeLights();

    // camera
    this.initializeCamera();

    // action!
    this.requestRender();
  }
}

export {App};
