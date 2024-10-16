import { useEffect, useRef } from "react";
import {
  Scene,
  HemisphericLight,
  ArcRotateCamera,
  Vector3,
  Color3,
  Mesh,
  VertexBuffer,
  Engine,
  type EngineOptions,
  type SceneOptions,
  circleOfConfusionPixelShader,
  StandardMaterial,
} from "@babylonjs/core";
// import * as anu from "@jpmorganchase/anu";
import * as anu from "../../../anu/";
import {
  timeParse,
  utcFormat,
  extent,
  scaleLinear,
  timeFormat,
  scaleTime,
  scalePoint,
  scaleSequential,
  interpolateBlues,
  timeYear,
  csvParse,
} from "d3";
import rawData from "./data_entries.csv?raw";
import { M } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

const data = csvParse(rawData);

const onSceneReady = (scene: Scene) => {
  // SET UP CAMERA
  //Add a camera that rotates around the origin and adjust its properties
  const camera = new ArcRotateCamera(
    "Camera",
    -(Math.PI / 4) * 3,
    Math.PI / 4,
    10,
    new Vector3(0, 0, 0),
    scene
  );
  camera.wheelPrecision = 20; // Adjust the sensitivity of the mouse wheel's zooming
  camera.minZ = 0; // Adjust the distance of the camera's near plane
  camera.attachControl(true); // Allow the camera to respond to user controls
  camera.position = new Vector3(-3, 2, -3);

  // SET UP LIGHT
  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  //Specify the columns in our dataset that should each be its own line
  let dimensions = data.columns.filter((col) => col !== "timestamp");

  //Get all of the dates in our dataset into an array so that we can easily get its extents later
  let dates: Number[] = data.map((d) => Number(d.timestamp));

  //Create the D3 functions that we will use to scale our data dimensions to desired output ranges for our visualization
  //In this case, we create scale functions that correspond to the x, y, and z positions and color
  let scaleX = scaleLinear().domain(dates);
  let scaleY = scaleLinear().domain([20, 30]); // .range([0, 1]).nice();
  let scaleZ = scalePoint().domain(dimensions);
  let scaleC = scaleSequential(interpolateBlues).domain([1, -1]);

  //For each column/year/line, map it to its x, y, and z position along each timestep using the D3 scale functions
  let paths = dimensions.map((col) => {
    return data.map(
      (row) =>
        new Vector3(
          scaleX(Number(row.timestamp)),
          scaleY(Number(row[col])),
          scaleZ(col)
        )
    );
  });

  //Bind a new CoT
  let CoT = anu.bind("cot");

  // material
  var mat = new StandardMaterial("mat1", scene);

  //Bind a new ribbon mesh to the CoT, which we will need to update manually to create our 3D line chart
  let ribbon = CoT.bind(
    "ribbon",
    {
      pathArray: paths,
      updatable: true,
      sideOrientation: Mesh.DOUBLESIDE,
    },
    []
  ); //  .selected[0]; // Get the Babylon Mesh that Anu had created for us, which had been stored in this selected property as an element of an array

  //The ribbon already has our position values, but we now need to set its color values for each vertex in its mesh (data row)
  //Retrieve the VertexBuffer of position values of the ribbon, these are stored as Numbers in a flat array [x0, y0, z0, x1, y1, z1, ...]
  // let positions = ribbon.getVerticesData(VertexBuffer.PositionKind);
  // let colors = [];
  // console.log(ribbon.get("vertic"));
  // //Loop through our position buffer
  // for (let p = 0; p < positions.length; p += 3) {
  //   //Get the color that this vertex should have based on its y-axis value
  //   let colorString = scaleC(positions[p + 1]);
  //   //Our scaleC function, which is from D3, returns a string in the format 'rgb(r, g, b)', so we need to parse this
  //   let color = colorString
  //     .substring(4, colorString.length - 1)
  //     .replace(/ /g, "")
  //     .split(",");
  //   //Store our new color
  //   colors.push(color[0] / 255, color[1] / 255, color[2] / 255, 1);
  // }

  // if (ribbon) {
  //   //Set our new color values to the ribbon
  //   ribbon.setVerticesData(VertexBuffer.ColorKind, colors);
  //   //Turn off picking to improve performance of our complex mesh geometry
  //   ribbon.isPickable = false;
  // }

  const formatTime = utcFormat("%H:%M:%S");
  //Use the createAxes() Anu helper function to create the axes for us based on our D3 scale functions
  //Also adjust its visual properties to properly format the axes labels
  anu.createAxes("test", scene, {
    parent: CoT,
    scale: { x: scaleX, y: scaleY, z: scaleZ },
    // domainMaterialOptions: { color: Color3.White(), width: 4 },
    // gridTicks: { x: scaleX.ticks() },
    // labelTicks: { x: scaleX.ticks() },
    labelFormat: {
      x: (text: number) => formatTime(new Date(text)),
    },
  });

  //Add some additional red lines for each line (column)
  let redLines = CoT.bind("lineSystem", { lines: paths })
    .attr("color", Color3.Red())
    .prop("alpha", 0.9);

  //Add an additional green line to the front-most line
  let greenOutline = CoT.bind("lines", { points: paths[0] }).attr(
    "color",
    Color3.Green()
  );

  //   // SET UP A BOX AND GROUND
  //   // Our built-in 'box' shape.
  //   box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  //   // Move the box upward 1/2 its height
  //   box.position.y = 1;
  //   // Our built-in 'ground' shape.
  //   MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

  // SET UP ANU BOX

  // let cot = anu.bind("cot");
  // let spheres = cot.bind("sphere", { diameter: 0.5 }, iris);

  // let extentX: Iterable<NumberValue> = extent(
  //   map(iris, (d) => {
  //     return d.sepalLength;
  //   })
  // );
  // let extentY: Iterable<NumberValue> = extent(
  //   map(iris, (d) => {
  //     return d.petalLength;
  //   })
  // );
  // let extentZ: Iterable<NumberValue> = extent(
  //   map(iris, (d) => {
  //     return d.sepalWidth;
  //   })
  // );

  // let scaleX = scaleLinear().domain(extentX).range([-20, 20]).nice();
  // let scaleY = scaleLinear().domain(extentY).range([-20, 20]).nice();
  // let scaleZ = scaleLinear().domain(extentZ).range([-20, 20]).nice();

  // spheres
  //   .positionX((d) => scaleX(d.sepalLength))
  //   .positionY((d) => scaleY(d.petalLength))
  //   .positionZ((d) => scaleZ(d.sepalWidth));
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
