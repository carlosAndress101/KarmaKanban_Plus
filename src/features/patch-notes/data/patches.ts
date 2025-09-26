import { PatchNote, ChangeType, PatchPriority } from "../types";

export const PATCH_NOTES: PatchNote[] = [
  {
    id: "patch-2025-09-26-v2",
    version: "1.4.0",
    releaseDate: "2025-09-26",
    title: "¡Notificaciones por Email y Mejoras en la App!",
    summary:
      "¡Ahora recibirás emails automáticos cuando te asignen tareas o haya novedades en la tienda! También mejoramos la experiencia general de la aplicación.",
    priority: PatchPriority.HIGH,
    isVisible: true,
    createdAt: "2025-09-26T12:00:00",
    changes: [
      {
        id: "email-notifications",
        type: ChangeType.NEW_FEATURE,
        title: "📧 ¡Notificaciones por Email!",
        description:
          "¡Ya no te perderás nada importante! Ahora recibirás emails automáticos para mantenerte al día con tu equipo.",
        details: [
          "📌 Te avisamos cuando te asignen una nueva tarea",
          "🏪 Los administradores reciben avisos de canjes en la tienda",
          "✅ Notificaciones cuando aprueban o rechazan tus canjes",
          "⚡ Los emails llegan súper rápido",
        ],
        affectedFeatures: ["Tareas", "Tienda", "Workspaces"],
      },
      {
        id: "logout-fix",
        type: ChangeType.BUG_FIX,
        title: "🔒 Logout Mejorado",
        description:
          "¡Arreglamos un problemita! Ahora cuando cierras sesión desde cualquier parte de la app, funciona perfecto.",
        details: [
          "✨ El logout funciona correctamente desde la Tienda",
          "🔄 Te redirige bien a la página de login",
          "🧹 Limpia toda tu sesión cuando sales",
        ],
        affectedFeatures: ["Cerrar Sesión", "Tienda", "Navegación"],
      },
    ],
  },
  {
    id: "patch-2025-09-26",
    version: "1.3.0",
    releaseDate: "2025-09-26",
    title: "🔍 Filtros para Tareas Archivadas",
    summary:
      "¡Ahora puedes encontrar fácilmente tus tareas archivadas! Busca por nombre, fecha, estado y responsable para encontrar rápidamente lo que necesitas.",
    priority: PatchPriority.MEDIUM,
    isVisible: true,
    createdAt: "2025-09-26T08:00:00",
    changes: [
      {
        id: "archived-filters",
        type: ChangeType.NEW_FEATURE,
        title: "🎯 Búsqueda Súper Rápida",
        description:
          "¡Encontrar tus tareas archivadas ahora es súper fácil! Usa los nuevos filtros para buscar exactamente lo que necesitas.",
        details: [
          "🔎 Busca tareas por su nombre",
          "📅 Filtra por cuándo las archivaste",
          "📋 Encuentra tareas por su estado",
          "👤 Busca por quién las hizo",
          "⚡ Todo súper rápido y fácil de usar",
        ],
        affectedFeatures: ["Tareas Archivadas", "Búsqueda"],
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
