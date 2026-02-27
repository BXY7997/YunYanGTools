import type { FeatureStructureApiContract } from "@/features/tools/feature-structure/types/feature-structure"

export const featureStructureApiContract: FeatureStructureApiContract = {
  generatePath: "/api/tools/feature-structure/generate",
  exportPath: "/api/tools/feature-structure/export",
  syncPath: "/api/tools/feature-structure/sync",
}
