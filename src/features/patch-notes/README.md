# Sistema de Patch Notes

Este sistema permite mostrar notificaciones sobre nuevas actualizaciones y características del proyecto KarmaKanban Plus.

## 🌟 Características

- **Notificaciones automáticas** para nuevas actualizaciones
- **Modal interactivo** para mostrar detalles de los patch notes
- **Persistencia local** del estado de lectura de cada usuario
- **Múltiples variantes** de notificación (icon, button, minimal)
- **Tooltips informativos** con detalles de la actualización
- **Categorización de cambios** (feature, bugfix, improvement, breaking)
- **Prioridades configurables** (low, medium, high, critical)

## 📁 Estructura del Proyecto

```
src/features/patch-notes/
├── components/
│   ├── change-type-icon.tsx          # Iconos para tipos de cambios
│   ├── patch-notification-badge.tsx   # Badge de notificación
│   ├── patch-notes-modal.tsx         # Modal principal
│   └── patch-notes-example.tsx       # Ejemplo de uso
├── data/
│   └── patches.ts                     # Datos de parches y utilidades
├── hooks/
│   └── usePatchNotes.ts              # Hook principal
├── types/
│   └── index.ts                      # Definiciones TypeScript
└── index.ts                          # Exportaciones principales
```

## 🚀 Uso Básico

### 1. Badge de Notificación en Navbar

```tsx
import {
  PatchNotificationBadge,
  PatchNotesModal,
} from "@/features/patch-notes";

const Navbar = () => {
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between">
        {/* ... otros elementos ... */}
        <PatchNotificationBadge
          onClick={() => setIsPatchNotesOpen(true)}
          variant="minimal"
          showTooltip={true}
          size="md"
        />
      </nav>

      <PatchNotesModal
        isOpen={isPatchNotesOpen}
        onClose={() => setIsPatchNotesOpen(false)}
        highlightLatest={true}
      />
    </>
  );
};
```

### 2. Hook para Gestionar Estado

```tsx
import { usePatchNotes } from "@/features/patch-notes";

const MyComponent = () => {
  const {
    latestPatch,
    hasUnreadPatches,
    unreadPatchesCount,
    markPatchAsSeen,
    markAllPatchesAsSeen,
  } = usePatchNotes();

  return (
    <div>
      {hasUnreadPatches && (
        <p>Tienes {unreadPatchesCount} actualizaciones sin leer</p>
      )}
    </div>
  );
};
```

## 🔧 Configuración

### Agregar Nuevos Patch Notes

Edita el archivo `src/features/patch-notes/data/patches.ts`:

```typescript
export const PATCH_NOTES: PatchNote[] = [
  {
    id: "patch-1.4.0",
    version: "1.4.0",
    title: "Nueva Característica Increíble",
    summary: "Descripción breve de la actualización...",
    releaseDate: "2025-01-25",
    priority: PatchPriority.HIGH,
    isVisible: true,
    changes: [
      {
        id: "change-1",
        type: ChangeType.FEATURE,
        title: "Nueva funcionalidad X",
        description: "Descripción detallada...",
        details: ["Detalle específico 1", "Detalle específico 2"],
        affectedFeatures: ["Dashboard", "Tasks"],
      },
    ],
  },
  // ... más patches
];
```

### Tipos de Cambios Disponibles

- `FEATURE` - Nueva funcionalidad
- `BUGFIX` - Corrección de errores
- `IMPROVEMENT` - Mejoras existentes
- `BREAKING` - Cambios que rompen compatibilidad

### Niveles de Prioridad

- `LOW` - Prioridad baja
- `MEDIUM` - Prioridad media
- `HIGH` - Prioridad alta
- `CRITICAL` - Crítico

## 🎨 Variantes de Notificación

### Icon Variant (Predeterminado)

- Badge circular con gradiente
- Ideal para sidebar o navbar compacto

### Button Variant

- Botón con texto "New Updates"
- Perfecto para áreas con más espacio

### Minimal Variant

- Icono simple con contador
- Minimalista para navegación clean

## 💾 Persistencia de Datos

El sistema utiliza `localStorage` para mantener el estado de lectura:

```typescript
// Estructura guardada en localStorage
{
  userId: "current-user",
  lastSeenPatchId: "patch-1.3.0",
  seenPatches: ["patch-1.1.0", "patch-1.2.0", "patch-1.3.0"],
  lastCheckDate: "2025-01-25T10:30:00.000Z"
}
```

## 🔄 API Principal

### `usePatchNotes()` Hook

```typescript
interface UsePatchNotesReturn {
  latestPatch: PatchNote | undefined; // Último patch disponible
  allPatches: PatchNote[]; // Todos los patches visibles
  hasNewPatches: boolean; // Si hay patches nuevos
  hasUnreadPatches: boolean; // Si hay patches no leídos
  unreadPatchesCount: number; // Número de patches no leídos
  isFirstTime: boolean; // Si es primera visita del usuario
  markPatchAsSeen: (patchId: string) => void; // Marcar patch como visto
  markAllPatchesAsSeen: () => void; // Marcar todos como vistos
  getUserPatchStatus: () => UserPatchStatus; // Obtener estado del usuario
  resetPatchStatus: () => void; // Resetear estado (debug)
}
```

### `PatchNotificationBadge` Props

```typescript
interface PatchNotificationBadgeProps {
  onClick?: () => void; // Callback al hacer click
  variant?: "icon" | "button" | "minimal"; // Variante visual
  showTooltip?: boolean; // Mostrar tooltip
  size?: "sm" | "md" | "lg"; // Tamaño del badge
}
```

### `PatchNotesModal` Props

```typescript
interface PatchNotesModalProps {
  isOpen: boolean; // Estado de apertura
  onClose: () => void; // Callback de cierre
  highlightLatest?: boolean; // Destacar último patch
}
```

## 🎯 Casos de Uso

1. **Notificación de Nuevas Características**: Informar sobre filtros avanzados, gamificación, etc.
2. **Avisos de Correcciones**: Comunicar bugfixes importantes
3. **Cambios Breaking**: Alertar sobre cambios que afectan el workflow
4. **Mejoras de UX**: Destacar optimizaciones y refinamientos

## 🧪 Testing

Para probar el sistema:

1. Limpia localStorage: `localStorage.removeItem("karmakanban-patch-status")`
2. Recarga la página para simular primer uso
3. El badge debería mostrar todas las actualizaciones como nuevas
4. Marca patches como vistos y verifica la persistencia

## 🚀 Próximas Mejoras

- [ ] Integración con sistema de autenticación real
- [ ] Notificaciones push para actualizaciones críticas
- [ ] Animaciones más sofisticadas
- [ ] Filtrado por tipo de cambio en el modal
- [ ] Export/import de configuración de patches
- [ ] Analytics de engagement con patch notes

## 📝 Notas de Implementación

- El sistema es completamente independiente y no requiere backend
- Compatible con el sistema de temas (dark/light mode)
- Responsive design para móvil y desktop
- Accesibilidad completa con ARIA labels
- TypeScript strict mode compatible
