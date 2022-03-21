import
{
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

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
  private _pointLight;
  private _pointLight2;
  private _ambientLight;

  constructor () { }

  ngAfterViewInit(): void
  {
    this.initScene();
    this.main();
  }

  ngOnInit(): void { }

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

    this._ambientLight = new THREE.AmbientLight(0x111111);
    this._scene.add(this._ambientLight);

    this._pointLight = new THREE.PointLight(0xffffff, 2, 70, 2);
    this._pointLight.lookAt(0, -2, 0);
    this._pointLight.position.z = -28;
    this._pointLight.position.y = 10;
    this._pointLight.position.x = 10;
    this._pointLight2 = new THREE.PointLight(0xffffff, 1, 1000, 2);
    this._pointLight2.position.z = -150;
    this._pointLight2.position.y = 30;
    this._pointLight2.position.x = -30;

    // TODO remove debug
    // const sphereSize = 1;
    // const pointLightHelper = new THREE.PointLightHelper(this._pointLight, sphereSize);
    // const pointLightHelper2 = new THREE.PointLightHelper(this._pointLight2, sphereSize);
    // this._scene.add(pointLightHelper);
    // this._scene.add(pointLightHelper2);

    this._camera = new THREE.PerspectiveCamera(50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000);
    this._camera.position.z = 70;
    this._camera.add(this._pointLight);
    this._camera.add(this._pointLight2);
    this._scene.add(this._camera);

    this._renderer = new THREE.WebGLRenderer({
      canvas: this._sceneRef.nativeElement,
      antialias: true
    });
    this._renderer.setPixelRatio(window.devicePixelRatio || 1);
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.target.set(0, 0, 0);
    this._controls.enablePan = false;
    this._controls.rotateSpeed = 0.6;
    this._controls.enableZoom = false;
    this._controls.enableDamping = true;
    this._controls.minPolarAngle = 1.3;
    this._controls.maxPolarAngle = 1.3;
    this._controls.minAzimuthAngle = 0;
    this._controls.maxAzimuthAngle = 0;
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

    const circle = new THREE.CircleGeometry(30, planetData.length);
    const vectors = circle.getAttribute('position').array;
    const planets = [];
    const planetPositions = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let intersects;
    let intersected;

    // Create vector3's from circle to position planets nicely
    for (let i = 6; i < vectors.length; i = i + 3)
    {
      // Swapping Y and Z to rotate the array 90 degrees
      planetPositions.push(new THREE.Vector3(vectors[i],
        vectors[i + 2],
        vectors[i + 1]));
    }

    // TODO remove
    // planetData.forEach(planet =>
    // {
    //   console.log(planet.name + "'s original size:", planet.size);
    // });

    // Create the planets and add to array
    for (let i = 0; i < planetData.length; i++)
    {
      const planet = planetData[i];

      /* Because there is such a big difference between the actual planet sizes,
      i knock that difference down by a percentage to make small planets bigger
      and big planets smaller while keeping a realistic ratio between them. */
      const baseSize = 7;
      const scalePercentage = 50;
      const size = (((baseSize - planet.size) / 100)
        * scalePercentage
        + planet.size);

      planets.push(new Planet(planet.name, size, planet.textureUrl));
      //console.log(planet.name + "'s normalized size:", size);
    }

    //add all the planets to scene
    for (let i = 0; i < planets.length; i++)
    {
      const planet = planets[i];
      const pos = planetPositions[i];

      planet.addToScene(this._scene, pos);
    }

    // TODO add the moon back in via the addToScene method
    // earth.addMoon('luna', 0.27, 60.33 / 10, 'assets/2k_moon.jpg', 1, 1, 1);

    let onPointerMove = (event) =>
    {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    };

    let quaternion = new THREE.Quaternion(); // create one and reuse it

    let onPointerDown = (event) =>
    {
      //console.log(this._camera);

      if (intersected)
      {
        console.log(intersected);

        let camera2dPos = new THREE.Vector3(this._camera.position.x, 0, this._camera.position.z);
        let intersected2dPos = new THREE.Vector3(intersected.position.x, 0, intersected.position.z);
        let center = new THREE.Vector3(0, 0, 0);

        console.log("center to selection", center.distanceTo(intersected2dPos));
        console.log("selection to camera", intersected2dPos.distanceTo(camera2dPos));
        console.log("camera to center", camera2dPos.distanceTo(center));


        this._controls.minAzimuthAngle += Math.PI / 4;
        this._controls.maxAzimuthAngle += Math.PI / 4;

        // this._camera.position.x = intersected.position.x;
        // this._camera.position.y = intersected.position.y + 100;
        // this._camera.position.z = intersected.position.z;
        //this._controls.target.set(intersected.position.x, intersected.position.y, intersected.position.z);
        // console.log(this._controls.getPolarAngle());
        // console.log(this._controls);

        // quaternion.setFromUnitVectors(this._camera.position, intersected.position);
        // console.log(quaternion);

        // this._controls.applyQuaternion(quaternion);


      }


    };


    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);

    let renderLoop = (() =>
    {
      // update frame
      this._stats.begin();
      this._controls.update();
      this._renderer.render(this._scene, this._camera);
      requestAnimationFrame(renderLoop);

      // animate the planets
      planets.forEach((planet) =>
      {
        planet.animate();
      });

      // update the raycaster
      raycaster.setFromCamera(pointer, this._camera);
      raycaster.intersectObjects(this._scene.children, false);

      // find all objects intersected by the ray
      intersects = raycaster.intersectObjects(this._scene.children, false);

      // highlight the first object intersected by the ray
      if (intersects.length > 0)
      {
        if (intersected != intersects[0].object)
        {
          if (intersected)
          {
            intersected.material.emissive.setHex(intersected.currentHex);
          }
          intersected = intersects[0].object;
          intersected.currentHex = intersected.material.emissive.getHex();
          intersected.material.emissive.setHex(0xff0000);
        }
      }
      else
      {
        if (intersected)
        {
          intersected.material.emissive.setHex(intersected.currentHex);
        }
        intersected = null;
      }


      this._stats.end();

    });

    renderLoop();
  }
}
