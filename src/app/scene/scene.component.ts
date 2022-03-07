import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
import { CubeTexturePass } from 'three/examples/jsm/postprocessing/CubeTexturePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit, AfterViewInit
{
  @ViewChild('scene') private _sceneRef: ElementRef;
  @ViewChild('sceneContainer') private _sceneContainerRef: ElementRef;

  private _scene: any = null;
  private _renderer: any = null;
  private _camera: any = null;
  private _controls: any = null;
  private _composer: any = null;
  private _clearPass: any = null;
  private _cubeTexturePass: any = null;
  private _renderPass: any = null;
  private _stats: any = null;
  private _copyPass: any = null;

  constructor () { }

  ngAfterViewInit(): void
  {
    this.initScene();
    this.initSkybox();
    this.main();
  }

  ngOnInit(): void { }

  private addSphere()
  {
    const group = new THREE.Group();
    this._scene.add(group);

    const light = new THREE.PointLight(0xddffdd, 1.0);
    light.position.z = 70;
    light.position.y = - 70;
    light.position.x = - 70;
    this._scene.add(light);

    const light2 = new THREE.PointLight(0xffdddd, 1.0);
    light2.position.z = 70;
    light2.position.x = - 70;
    light2.position.y = 70;
    this._scene.add(light2);

    const light3 = new THREE.PointLight(0xddddff, 1.0);
    light3.position.z = 70;
    light3.position.x = 70;
    light3.position.y = - 70;
    this._scene.add(light3);

    const geometry = new THREE.SphereGeometry(1, 48, 24);

    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.5 * Math.random() + 0.25;
    material.metalness = 0;
    material.color.setHSL(Math.random(), 1.0, 0.3);

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

  }

  private initSkybox()
  {
    const genCubeUrls = function (prefix, postfix)
    {
      return [
        prefix + 'px' + postfix, prefix + 'nx' + postfix,
        prefix + 'py' + postfix, prefix + 'ny' + postfix,
        prefix + 'pz' + postfix, prefix + 'nz' + postfix
      ];
    };

    const urls = genCubeUrls('assets/', '.png');
    const loader = new THREE.CubeTextureLoader();
    const cubeMap = loader.load(urls);

    cubeMap.format = THREE.RGBFormat;

    return cubeMap;

  }

  private initScene()
  {
    const skybox = this.initSkybox();

    this._scene = new THREE.Scene();
    this._scene.background = skybox;

    this._camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 10);
    this._camera.position.z = 7;


    //BUG - WebGLRenderer canvas property is broken, wont accept... hang on...
    // nevermind, fixed it by calling .nativeElement 🤡
    this._renderer = new THREE.WebGLRenderer({ canvas: this._sceneRef.nativeElement });
    this._renderer.setPixelRatio(window.devicePixelRatio || 1);
    this._renderer.setSize(window.innerWidth, window.innerHeight);


    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.target.set(0, 0, 0);
    this._controls.enablePan = false;
    this._controls.enableDamping = true;
    this._controls.update();

    this._stats = new Stats();
    this._sceneContainerRef.nativeElement.appendChild(this._stats.dom);

    window.addEventListener('resize', () =>
    {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;

      this._camera.aspect = aspect;
      this._camera.updateProjectionMatrix();

      this._renderer.setSize(width, height);
      //this._composer.setSize(width, height);
    });
  }



  private main()
  {
    this.addSphere();

    let renderLoop = (() =>
    {
      this._stats.begin();

      requestAnimationFrame(renderLoop);
      this._renderer.render(this._scene, this._camera);

      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;

      this._stats.end();
    });


    renderLoop();
  }
}
