"use client";

import React from "react";
import { getLab } from "./catalog";
import { LabsCatalog } from "./LabsCatalog";
import { LabWorkspace } from "./LabWorkspace";
import { initialLabsRoute, type LabsRoute } from "../nav";

/**
 * Labs entry point: the catalog of available labs, or one lab's weekly
 * workspace. The route lives in the shell so the dashboard can deep-link into
 * a specific week.
 */
export function LabsSection({
  route,
  setRoute,
}: {
  route: LabsRoute;
  setRoute: (route: LabsRoute) => void;
}) {
  const lab = route.labId ? getLab(route.labId) : undefined;

  if (!lab) {
    return <LabsCatalog onOpen={(labId, week) => setRoute({ labId, week, tab: "material" })} />;
  }

  return (
    <LabWorkspace
      lab={lab}
      week={route.week}
      tab={route.tab}
      onSelectWeek={(week) => setRoute({ ...route, week, tab: "material" })}
      onSelectTab={(tab) => setRoute({ ...route, tab })}
      onBack={() => setRoute(initialLabsRoute)}
    />
  );
}
