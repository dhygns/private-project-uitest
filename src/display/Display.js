import THREE from "n3d-threejs"

class Particle extends THREE.Object3D{

  constructor() {
    super();
    this.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 10.0, 10.0),
      new THREE.ShaderMaterial({
        transparent : true,
        uniforms : {
          unif_color : { type : "4f", value : [
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.5,
            1.0]}
        },
        fragmentShader : `
        uniform vec4 unif_color;
        void main(void) {
          gl_FragColor = vec4(unif_color.rgb, 1.0);
        }
        `,
        vertexShader : `
        void main(void) {
          gl_Position =
            projectionMatrix *
            viewMatrix * modelMatrix * vec4(position, 1.0);
        }
        `
      })
    ));
    const scale = 50.0;

    this.position.x = (Math.random() - 0.5) * scale;
    this.position.y = (Math.random() - 0.5) * scale;
    this.position.z = (Math.random() - 0.5) * scale;

    this.rotation.x = (Math.random() - 0.5) * Math.PI * 2.0;
    this.rotation.y = (Math.random() - 0.5) * Math.PI * 2.0;
    this.rotation.z = (Math.random() - 0.5) * Math.PI * 2.0;

    this.rotation.sx = (Math.random() - 0.5) * Math.PI * 2.0;
    this.rotation.sy = (Math.random() - 0.5) * Math.PI * 2.0;
    this.rotation.sz = (Math.random() - 0.5) * Math.PI * 2.0;

    this.position.sx = (Math.random() - 0.5) * scale * 0.01;
    this.position.sy = (Math.random() - 0.5) * scale * 0.01;
    this.position.sz = (Math.random() - 0.5) * scale * 0.01;

  }

  update(dt) {
    this.position.ax = -this.position.x;
    this.position.ay = -this.position.y;
    this.position.az = -this.position.z;

    this.position.sx += this.position.ax * dt;
    this.position.sy += this.position.ay * dt;
    this.position.sz += this.position.az * dt;

    this.position.x += this.position.sx * dt;
    this.position.y += this.position.sy * dt;
    this.position.z += this.position.sz * dt;

    this.rotation.x += this.rotation.sx * dt;
    this.rotation.y += this.rotation.sy * dt;
    this.rotation.z += this.rotation.sz * dt;
  }
}



class Display {

  constructor() {
    this.renderer = new THREE.WebGLRenderer({alpha : true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this._initRTT();
    this._initMain();

  }

  _initRTT() {
    this.texture = new THREE.WebGLRenderTarget(
      window.innerWidth, window.innerHeight, {
        minFilter : THREE.LinearFilter,
        magFilter : THREE.LinearFilter
      }
    );

    this.rttcam = new THREE.Camera();
    this.rttscn = new THREE.Scene();
    this.rttscn.add(new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 2.0),
      new THREE.ShaderMaterial({
        uniforms : {
          unif_texture : { type : "t", value : this.texture}
        },
        vertexShader : `
        varying vec2 vtex;
        void main(void) {
          vtex = uv;
          gl_Position = vec4(position, 1.0);
        }
        `,
        fragmentShader : `
        uniform sampler2D unif_texture;
        varying vec2 vtex;
        void main(void) {
          gl_FragColor = texture2D(unif_texture, vtex);
        }
        `
      })
    ))
  }

  _initMain() {
    //Create Camera
    this.camera = new THREE.PerspectiveCamera(
      45, //Field Of View (45도)
      window.innerWidth / window.innerHeight, //Ratio oF ViewPort (화면 비율)
      1.0, //Near Plane (표현가능 최소 거리)
      1000.0 //Far Plane (표현가능 최대 거리)
    );
    this.camera.position.z = 50.0;
    this.camera.positionMatrix = new THREE.Matrix4();
    this.camera.positionMatrix.set(
       Math.cos(0.01), 0.0, Math.sin(0.01), 0.0,
       0.0, 1.0, 0.0, 0.0,
      -Math.sin(0.01), 0.0, Math.cos(0.01), 0.0,
       0.0, 0.0, 0.0, 1.0
    );
    this.camera.lookposition = new THREE.Vector3(0.0, 0.0, 0.0);

    //Create Scene
    this.scene = new THREE.Scene();


    for(var i = 0 ; i < 50 ; i++) {
      this.scene.add(new Particle());
    }
  }

  _updateTime() {
    if(this.oldt == undefined) this.nowt = this.oldt = new Date() * 0.001;
    this.nowt = new Date() * 0.001;
    this.delt = this.nowt - this.oldt;
    this.oldt = this.nowt;
    return this.delt;
  }

  _updateCamera(dt) {
    this.camera.position.applyMatrix4(this.camera.positionMatrix);
    this.camera.lookAt(this.camera.lookposition);
  }

  _updateObjects(dt) {
    this.scene.children.forEach((obj)=>{
      if(obj.update) obj.update(dt);
    });
  }

  //public Function
  update() {
    var dt = this._updateTime(); //deltaTime Update
    this._updateObjects(dt);
    this._updateCamera(dt);
  }

  render() {
    this.renderer.autoClear = false;
    this.renderer.render(this.scene, this.camera, this.texture);
    this.renderer.autoClear = true;
    this.renderer.render(this.rttscn, this.rttcam);

  }

}

export default Display;
