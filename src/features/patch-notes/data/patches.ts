import { PatchNote, ChangeType, PatchPriority } from "../types";

export const PATCH_NOTES: PatchNote[] = [
  {
    id: "patch-2024-06-01",
    version: "1.3.0",
    releaseDate: "2024-06-01",
    title: "Filtros Avanzados para Tareas Archivadas",
    summary:
      "Ahora puedes buscar y filtrar tareas archivadas por nombre, fecha, estado y responsable, facilitando la gestión y recuperación de información histórica.",
    priority: PatchPriority.MEDIUM,
    isVisible: true,
    createdAt: "2024-06-01T08:00:00Z",
    changes: [
      {
        id: "archived-filters",
        type: ChangeType.NEW_FEATURE,
        title: "Filtros avanzados en archivados",
        description:
          "Se agregaron filtros de búsqueda por nombre, fecha, estado y responsable en el apartado de tareas archivadas.",
        details: [
          "Búsqueda por nombre de tarea",
          "Filtrado por fecha de archivado",
          "Filtrado por estado de la tarea",
          "Filtrado por responsable asignado",
          "Interfaz de filtros rápida y responsiva",
        ],
        affectedFeatures: ["Archived Tasks", "Filters", "Search"],
      },
    ],
  },
];

// Helper functions
export const getLatestPatch = (): PatchNote | undefined => {
  return PATCH_NOTES.filter((patch) => patch.isVisible).sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  )[0];
};

export const getPatchById = (id: string): PatchNote | undefined => {
  return PATCH_NOTES.find((patch) => patch.id === id);
};

export const getVisiblePatches = (): PatchNote[] => {
  return PATCH_NOTES.filter((patch) => patch.isVisible).sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
};

export const hasNewPatchesSince = (lastSeenPatchId: string): boolean => {
  const lastSeenIndex = PATCH_NOTES.findIndex(
    (patch) => patch.id === lastSeenPatchId
  );
  if (lastSeenIndex === -1) return true;

  const newerPatches = PATCH_NOTES.slice(0, lastSeenIndex);
  return newerPatches.some((patch) => patch.isVisible);
};
