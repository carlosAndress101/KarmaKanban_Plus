"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Star,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  PatchNote,
  PatchChange,
  PatchPriority,
} from "@/features/patch-notes/types";
import { ChangeTypeBadge } from "@/features/patch-notes/components/change-type-icon";
import { usePatchNotes } from "@/features/patch-notes/hooks/usePatchNotes";

const PRIORITY_CONFIG = {
  [PatchPriority.LOW]: {
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    label: "Low Priority",
  },
  [PatchPriority.MEDIUM]: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Medium Priority",
  },
  [PatchPriority.HIGH]: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "High Priority",
  },
  [PatchPriority.CRITICAL]: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Critical",
  },
};

export default function PatchNotesPage() {
  const router = useRouter();
  const { latestPatch, allPatches, markAllPatchesAsSeen } = usePatchNotes();

  const [selectedPatch, setSelectedPatch] = React.useState<
    PatchNote | undefined
  >(undefined);

  // Inicializar patch seleccionado solo si es necesario
  React.useEffect(() => {
    if (!selectedPatch && allPatches.length > 0) {
      setSelectedPatch(allPatches[0]);
    }
  }, [selectedPatch, allPatches]);

  // Marcar todos los patches como vistos al montar (no en cleanup)
  React.useEffect(() => {
    markAllPatchesAsSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mejorar navegación: volver al workspace actual
  const workspaceId =
    typeof window !== "undefined" ? window.location.pathname.split("/")[2] : "";
  const handleGoBack = () => {
    router.push(`/workspaces/${workspaceId}`);
  };

  const formatDate = (dateString: string) => {
    // Manually format the date without using Date constructor
    const [year, month, day] = dateString.split("-");

    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const monthName = monthNames[parseInt(month) - 1];
    return `${parseInt(day)} de ${monthName} de ${year}`;
  };

  const renderPatchChange = (change: PatchChange) => (
    <div
      key={change.id}
      className="space-y-3 p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
    >
      <div className="flex items-start gap-4">
        <ChangeTypeBadge type={change.type} size="sm" />
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-gray-900 mb-2">
            {change.title}
          </h4>
          <p className="text-gray-700 leading-relaxed">{change.description}</p>
        </div>
      </div>

      {change.details && change.details.length > 0 && (
        <div className="ml-8">
          <ul className="space-y-2">
            {change.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {change.affectedFeatures && change.affectedFeatures.length > 0 && (
        <div className="ml-8 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-500">
              Características afectadas:
            </span>
            {change.affectedFeatures.map((feature) => (
              <Badge
                key={feature}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPatchDetails = (patch: PatchNote) => (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base font-mono px-3 py-1">
              v{patch.version}
            </Badge>
            <Badge
              className={`${PRIORITY_CONFIG[patch.priority].bgColor} ${
                PRIORITY_CONFIG[patch.priority].color
              } font-medium`}
            >
              {PRIORITY_CONFIG[patch.priority].label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {formatDate(patch.releaseDate)}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {patch.title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {patch.summary}
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Changes */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          Novedades ({patch.changes.length} cambios)
        </h3>
        <div className="space-y-6">{patch.changes.map(renderPatchChange)}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                ¿Qué hay de nuevo?
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre las últimas características, mejoras y correcciones de
              KarmaKanban Plus
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with patch list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h3 className="font-semibold text-lg">
                  Historial de Versiones
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {allPatches.length} actualizaciones disponibles
                </p>
              </div>

              <ScrollArea className="h-96">
                <div className="p-4 space-y-3">
                  {allPatches.map((patch) => (
                    <button
                      key={patch.id}
                      onClick={() => setSelectedPatch(patch)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        selectedPatch?.id === patch.id
                          ? "bg-blue-50 border-blue-300 shadow-sm"
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono text-gray-500 font-medium">
                          v{patch.version}
                        </span>
                        {patch.id === latestPatch?.id && (
                          <Badge className="text-xs bg-green-500 text-white px-2 py-0.5">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                        {patch.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(patch.releaseDate)}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllPatchesAsSeen}
                  className="w-full cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar todo como leído
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {selectedPatch ? (
                renderPatchDetails(selectedPatch)
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      Selecciona una versión
                    </p>
                    <p className="text-sm">para ver sus detalles</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
