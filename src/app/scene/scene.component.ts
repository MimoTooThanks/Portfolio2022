import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Planet } from './planet';

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
  private _stats: any = null;

  constructor () { }

  ngAfterViewInit(): void
  {
    this.initScene();
    this.initSkybox();
    this.main();
  }

  ngOnInit(): void { }

  private addLights()
  {
    const light = new THREE.AmbientLight(0x111111); // soft white light
    this._scene.add(light);

    const light2 = new THREE.PointLight(0xffffff, 2.0);
    light2.position.z = 70;
    light2.position.y = 70;
    light2.position.x = 70;
    this._scene.add(light2);
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

    this._camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.z = 70;



    //BUG - WebGLRenderer canvas property is broken, wont accept... hang on...
    // nevermind, fixed it by calling .nativeElement 🤡
    this._renderer = new THREE.WebGLRenderer({ canvas: this._sceneRef.nativeElement });
    this._renderer.setPixelRatio(window.devicePixelRatio || 1);
    this._renderer.setSize(window.innerWidth, window.innerHeight);


    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.target.set(0, 0, 0);
    this._controls.enablePan = true;
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
    const planetData = [
      {
        name: 'mercury',
        size: 2440 / 6371,
        textureUrl: 'assets/2k_mercury.jpg'
      },
      {
        name: 'venus',
        size: 6052 / 6371,
        textureUrl: 'assets/2k_venus_surface.jpg'
      },
      {
        name: 'earth',
        size: 6371 / 6371,
        textureUrl: 'assets/2k_earth_daymap.jpg'
      },
      {
        name: 'mars',
        size: 3390 / 6371,
        textureUrl: 'assets/2k_mars.jpg'
      },
      {
        name: 'jupiter',
        size: 69911 / 6371,
        textureUrl: 'assets/2k_jupiter.jpg'
      },
      {
        name: 'saturn',
        size: 58232 / 6371,
        textureUrl: 'assets/2k_saturn.jpg'
      },
      {
        name: 'uranus',
        size: 25362 / 6371,
        textureUrl: 'assets/2k_uranus.jpg'
      },
      {
        name: 'neptune',
        size: 24622 / 6371,
        textureUrl: 'assets/2k_neptune.jpg'
      }
    ];

    const planets = [];


    const circle = new THREE.CircleGeometry(30, planetData.length);
    const vectors = circle.getAttribute('position').array;
    const planetPositions = [];

    //create vector3's from circle to position planets nicely
    for (let i = 6; i < vectors.length; i = i + 3)
    {
      //swapping Y and Z to basically just rotate the array 90 degrees
      planetPositions.push(new THREE.Vector3(vectors[i], vectors[i + 2], vectors[i + 1]));
    }

    //add planets to scene
    for (let i = 0; i < planetData.length; i++)
    {
      const planet = planetData[i];
      const pos = planetPositions[i];

      planets.push(new Planet(planet.name, 5, planet.textureUrl).addToScene(this._scene, pos));
    }



    //earth.addMoon('luna', 0.27, 60.33 / 10, 'assets/2k_moon.jpg', 1, 1, 1);

    //Planet sizes are realistic. Based on earths radius, earth being 1 unit in the program.
    // const mercury = new Planet('mercury', 2440 / 6371, 'assets/2k_mercury.jpg');
    // const venus = new Planet('venus', 6052 / 6371, 'assets/2k_venus_surface.jpg');
    // const earth = new Planet('earth', 6371 / 6371, 'assets/2k_earth_daymap.jpg');
    // const mars = new Planet('mars', 3390 / 6371, 'assets/2k_mars.jpg');
    // const jupiter = new Planet('jupiter', 69911 / 6371, 'assets/2k_jupiter.jpg');
    // const saturn = new Planet('saturn', 58232 / 6371, 'assets/2k_saturn.jpg');
    // const uranus = new Planet('uranus', 25362 / 6371, 'assets/2k_uranus.jpg');
    // const neptune = new Planet('neptune', 24622 / 6371, 'assets/2k_neptune.jpg');
    // const mercurySize = mercury.getMesh().geometry.parameters.radius;
    // const venusSize = venus.getMesh().geometry.parameters.radius;
    // const earthSize = earth.getMesh().geometry.parameters.radius;
    // const marsSize = mars.getMesh().geometry.parameters.radius;
    // const jupiterSize = jupiter.getMesh().geometry.parameters.radius;
    // const saturnSize = saturn.getMesh().geometry.parameters.radius;
    // const uranusSize = uranus.getMesh().geometry.parameters.radius;
    // const neptuneSize = neptune.getMesh().geometry.parameters.radius;
    // const mercuryPos = mercury.getMesh().position;
    // const venusPos = venus.getMesh().position;
    // const earthPos = earth.getMesh().position;
    // const marsPos = mars.getMesh().position;
    // const jupiterPos = jupiter.getMesh().position;
    // const saturnPos = saturn.getMesh().position;
    // const uranusPos = uranus.getMesh().position;
    // const neptunePos = neptune.getMesh().position;
    // mercury.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize));
    // venus.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize * 2 + venusSize));
    // earth.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize * 2 + venusSize * 2 + earthSize));
    // mars.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize * 2 + venusSize * 2 + earthSize * 2 + marsSize));
    // jupiter.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize * 2 + venusSize * 2 + earthSize * 2 + marsSize * 2 + jupiterSize));
    // saturn.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize * 2 + venusSize * 2 + earthSize * 2 + marsSize * 2 + jupiterSize * 2 + saturnSize));
    // uranus.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize * 2 + venusSize * 2 + earthSize * 2 + marsSize * 2 + jupiterSize * 2 + saturnSize * 2 + uranusSize));
    // neptune.addToScene(this._scene, new THREE.Vector3(0, 0, mercurySize * 2 + venusSize * 2 + earthSize * 2 + marsSize * 2 + jupiterSize * 2 + saturnSize * 2 + uranusSize * 2 + neptuneSize));
    // console.log('mercury\'s size: ', mercury.getMesh().geometry.parameters.radius);
    // console.log('venus\'s size: ', venus.getMesh().geometry.parameters.radius);
    // console.log('earth\'s size: ', earth.getMesh().geometry.parameters.radius);
    // console.log('mars\'s size: ', mars.getMesh().geometry.parameters.radius);
    // console.log('jupiter\'s size: ', jupiter.getMesh().geometry.parameters.radius);
    // console.log('saturn\'s size: ', saturn.getMesh().geometry.parameters.radius);
    // console.log('uranus\'s size: ', uranus.getMesh().geometry.parameters.radius);
    // console.log('neptune\'s size: ', neptune.getMesh().geometry.parameters.radius);
    // console.log('mercury\'s position: ', mercuryPos);
    // console.log('venus\'s position: ', venusPos);
    // console.log('earth\'s position: ', earthPos);
    // console.log('mars\'s position: ', marsPos);
    // console.log('jupiter\'s position: ', jupiterPos);
    // console.log('saturn\'s position: ', saturnPos);
    // console.log('uranus\'s position: ', uranusPos);
    // console.log('neptune\'s position: ', neptunePos);




    this.addLights();

    let renderLoop = (() =>
    {
      this._stats.begin();

      //earth.getMesh().rotation.y += 0.01;
      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;

      this._controls.update();

      this._renderer.render(this._scene, this._camera);
      requestAnimationFrame(renderLoop);

      this._stats.end();
    });


    renderLoop();
  }
}
