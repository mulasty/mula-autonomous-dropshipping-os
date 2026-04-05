export * as controlTowerModule from "./control-tower";
export * as listingFactoryModule from "./listing-factory";
export * as normalizationModule from "./normalization";
export * as orderRoutingModule from "./order-routing";
export * as publicationModule from "./publication";
export * as productPipelineModule from "./product-pipeline";
export * as qualificationModule from "./qualification";
export * as rulesEngineModule from "./rules-engine";
export * as supportModule from "./support";
export * as supplierIntakeModule from "./supplier-intake";
export * as syncEngineModule from "./sync-engine";

export interface RuntimeModuleDescriptor {
  moduleName: string;
  implementationStatus: "implemented" | "skeleton";
  description: string;
}

export const runtimeModuleCatalog: RuntimeModuleDescriptor[] = [
  {
    moduleName: "supplier-intake",
    implementationStatus: "implemented",
    description: "Runtime intake orchestration with fetch, parse, raw persistence, and prevalidation hooks."
  },
  {
    moduleName: "normalization",
    implementationStatus: "implemented",
    description: "Deterministic raw-to-canonical normalization with explicit data-quality warnings."
  },
  {
    moduleName: "rules-engine",
    implementationStatus: "implemented",
    description: "Deterministic margin and product qualification rules evaluation."
  },
  {
    moduleName: "qualification",
    implementationStatus: "implemented",
    description: "Qualification layer that composes deterministic rules and optional AI review handoff."
  },
  {
    moduleName: "product-pipeline",
    implementationStatus: "implemented",
    description: "Stage-aware product pipeline that connects normalization, rules evaluation, and qualification."
  },
  {
    moduleName: "order-routing",
    implementationStatus: "skeleton",
    description: "Routing orchestration with explicit supplier acknowledgement and escalation paths."
  },
  {
    moduleName: "listing-factory",
    implementationStatus: "implemented",
    description: "Deterministic listing draft generation and validation with channel-specific constraints."
  },
  {
    moduleName: "publication",
    implementationStatus: "implemented",
    description: "Separate publication-preparation boundary that marks validated drafts ready for channel handoff."
  },
  {
    moduleName: "sync-engine",
    implementationStatus: "implemented",
    description: "Conservative stock and price safety evaluation for live listing sync decisions."
  },
  {
    moduleName: "support",
    implementationStatus: "implemented",
    description: "Policy-bound support classification and safe response drafting for low-risk cases."
  },
  {
    moduleName: "control-tower",
    implementationStatus: "implemented",
    description: "Exception-centric operational summary and runtime visibility foundation."
  }
];
