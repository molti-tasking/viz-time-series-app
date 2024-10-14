import { useEffect, useRef } from "react";
import {
  Engine,
  type EngineOptions,
  Scene,
  type SceneOptions,
} from "@babylonjs/core";
// import * as anu from "@jpmorganchase/anu";
import * as anu from "../../../anu/";
import { FreeCamera, Vector3, HemisphericLight } from "@babylonjs/core";
import { extent, scaleLinear, map, NumberValue } from "d3";
import iris from "./iris.json";

const onSceneReady = (scene: Scene) => {
  // SET UP CAMERA
  // This creates and positions a free camera (non-mesh)
  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());
  const canvas = scene.getEngine().getRenderingCanvas();
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // SET UP LIGHT
  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  //   // SET UP A BOX AND GROUND
  //   // Our built-in 'box' shape.
  //   box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  //   // Move the box upward 1/2 its height
  //   box.position.y = 1;
  //   // Our built-in 'ground' shape.
  //   MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

  // SET UP ANU BOX

  let cot = anu.bind("cot");
  let spheres = cot.bind("sphere", { diameter: 0.5 }, iris);

  let extentX: Iterable<NumberValue> = extent(
    map(iris, (d) => {
      return d.sepalLength;
    })
  );
  let extentY: Iterable<NumberValue> = extent(
    map(iris, (d) => {
      return d.petalLength;
    })
  );
  let extentZ: Iterable<NumberValue> = extent(
    map(iris, (d) => {
      return d.sepalWidth;
    })
  );

  let scaleX = scaleLinear().domain(extentX).range([-20, 20]).nice();
  let scaleY = scaleLinear().domain(extentY).range([-20, 20]).nice();
  let scaleZ = scaleLinear().domain(extentZ).range([-20, 20]).nice();

  spheres
    .positionX((d) => scaleX(d.sepalLength))
    .positionY((d) => scaleY(d.petalLength))
    .positionZ((d) => scaleZ(d.sepalWidth));
};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene: Scene) => {
  //   if (box !== undefined) {
  //     const deltaTimeInMillis = scene.getEngine().getDeltaTime();
  //     const rpm = 10;
  //     box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  //   }
};

export const BabylonScene = () => (
  <div className="w-full">
    <SceneComponent
      antialias
      onSceneReady={onSceneReady}
      onRender={onRender}
      id="my-canvas"
      className="w-full"
    />
  </div>
);

interface SceneProps
  extends React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  antialias?: boolean;
  engineOptions?: EngineOptions;
  sceneOptions?: SceneOptions;
  onRender?: (scene: Scene) => void;
  onSceneReady?: (scene: Scene) => void;
}

const SceneComponent = ({
  antialias,
  engineOptions,
  sceneOptions,
  onRender,
  onSceneReady,
  ...rest
}: SceneProps) => {
  const reactCanvas = useRef(null);

  // set up basic engine and scene
  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(canvas, antialias, engineOptions);
    const scene = new Scene(engine, sceneOptions);
    if (scene.isReady()) {
      onSceneReady?.(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady?.(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [antialias, engineOptions, sceneOptions, onRender, onSceneReady]);

  return <canvas ref={reactCanvas} {...rest} />;
};
