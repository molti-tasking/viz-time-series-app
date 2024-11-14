import * as Comlink from "comlink";
import { aggregatorB } from "./clusteringB";

// Define the functions that will be available in the worker
const workerFunctions = {
  aggregatorB,
};

export type ClusteringWorker = typeof workerFunctions;

// Expose the worker functions to the main thread
Comlink.expose(workerFunctions);
