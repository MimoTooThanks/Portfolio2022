import * as THREE from 'three';

// All objects in this universe are perfect spheres lmao
abstract class CelestialBody
{
    private readonly _mesh: THREE.Mesh;

    constructor (name: string, size: number, textureUrl: string)
    {
        const textureLoader = new THREE.TextureLoader();
        const geometry = new THREE.SphereGeometry(size, 30, 30);
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh();
        const texture = textureLoader.load(textureUrl);

        material.roughness = 0.6;
        material.map = texture;

        mesh.geometry = geometry;
        mesh.material = material;

        this._mesh = mesh;
    }

    //helper function
    randomInRange(from: number, to: number): number
    {
        let x = Math.random() * (to - from);
        return x + from;
    };

    getMesh(): THREE.Mesh
    {
        return this._mesh;
    }
}

export class Planet extends CelestialBody
{
    private _moons: Moon[] = [];
    bounce;
    bounceSpeed;
    rotationSpeed;
    theta;


    constructor (name: string, size: number, textureUrl: string)
    {
        super(name, size, textureUrl);
        this.bounce = this.randomInRange(0.5, 2);
        this.bounceSpeed = this.randomInRange(0.01, 0.05);
        this.rotationSpeed = this.randomInRange(0.005, 0.02);
        this.theta = 0;
    }

    addToScene(scene: THREE.Scene, position: THREE.Vector3): void
    {
        const planet = this.getMesh();

        planet.position.x = position.x;
        planet.position.y = position.y;
        planet.position.z = position.z;

        scene.add(planet);

        if (this._moons.length > 0)
        {
            this._moons.forEach(moon =>
            {
                const m = moon.getMesh();
                const moonR = m.geometry.parameters.radius;
                const moonDist = moon.distance;
                const parentPos = planet.position;
                const parentR = planet.geometry.parameters.radius;

                m.position.x = parentPos.x + parentR + moonR + moonDist;
                m.position.y = parentPos.y;
                m.position.z = parentPos.z;
                scene.add(m);
            });
        }
    }


    addMoon(name: string, size: number, distance: number, textureUrl: string, radius: number, theta: number, phi: number)
    {
        this._moons.push(new Moon(this.getMesh(), name, size, distance, textureUrl, radius, theta, phi));
    }



    animateMoons()
    {
        // mesh.position.y = radius * Math.cos(theta);
        // mesh.position.x = radius * Math.sin(theta);
        // mesh.position.z = radius * Math.cos(theta);
        // theta += 0.01;
    }

};

class Moon extends Planet
{
    orbitRadius;
    theta;
    phi;
    distance;
    constructor (planet: THREE.Mesh, name: string, size: number, distance: number, textureUrl: string, orbitRadius: number, theta: number, phi: number)
    {
        super(name, size, textureUrl);

        const moon = this.getMesh();

        this.distance = distance;
        this.orbitRadius = orbitRadius;
        this.theta = theta;
        this.phi = phi;


        //     this.radius = this.mesh.position.x;

        //     this.theta = 0;
        //     this.dTheta = 2 * Math.PI / this.randomInRange(150, 200);
        //     this.phi = this.randomInRange(0, Math.PI);

        //     for (let i = 1; i <= 1; i++)
        //     {
        //         let p = new Particle();
        //         particles.push(p);
        //         scene.add(p.mesh);
        //     }


    }
}