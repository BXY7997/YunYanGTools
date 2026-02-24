"use client"

import DiagramFeaturePage from "@canvas/pages/DiagramFeature"

interface CanvasDiagramFeatureRouteProps {
  params: {
    type: string
  }
}

export default function CanvasDiagramFeatureRoute({
  params,
}: CanvasDiagramFeatureRouteProps) {
  return <DiagramFeaturePage type={params.type} />
}

