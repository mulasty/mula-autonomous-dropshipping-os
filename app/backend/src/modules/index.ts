export * as orderRoutingModule from "./order-routing";
export * as qualificationModule from "./qualification";
export * as rulesEngineModule from "./rules-engine";
export * as supplierIntakeModule from "./supplier-intake";

export interface RuntimeModuleDescriptor {
  moduleName: string;
  implementationStatus: "implemented" | "skeleton";
  description: string;
}

export const runtimeModuleCatalog: RuntimeModuleDescriptor[] = [
  {
    moduleName: "supplier-intake",
    implementationStatus: "skeleton",
    description: "Runtime intake orchestration with fetch, parse, persistence, and prevalidation hooks."
  },
  {
    moduleName: "rules-engine",
    implementationStatus: "implemented",
    description: "Deterministic margin and product qualification rules evaluation."
  },
  {
    moduleName: "qualification",
    implementationStatus: "skeleton",
    description: "Qualification layer that composes deterministic rules and optional AI review handoff."
  },
  {
    moduleName: "order-routing",
    implementationStatus: "skeleton",
    description: "Routing orchestration with explicit supplier acknowledgement and escalation paths."
  }
];
