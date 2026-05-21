import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/markers-plugin/index.css';
import {
  VirtualTourPlugin,
  events as virtualTourEvents,
  type VirtualTourNode,
} from '@photo-sphere-viewer/virtual-tour-plugin';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Property, PropertyTourStop } from '@/types/domain';
import { PropertyMediaPreview } from './property-media-preview';

type PropertyLiveTourProps = {
  property: Property;
};

export function PropertyLiveTour({ property }: PropertyLiveTourProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const virtualTourRef = useRef<VirtualTourPlugin | null>(null);
  const [selectedStopId, setSelectedStopId] = useState(property.tourStops[0]?.id ?? '');

  const selectedStop =
    property.tourStops.find((stop) => stop.id === selectedStopId) ??
    property.tourStops[0];
  const selectedRoom = property.roomScans.find(
    (room) => room.room === selectedStop?.roomLabel
  );

  const nodes = useMemo<VirtualTourNode[]>(
    () =>
      property.tourStops.map((stop) => ({
        id: stop.id,
        panorama: stop.panoramaUrl,
        name: stop.label,
        caption: stop.label,
        description: stop.description,
        thumbnail: stop.thumbnailUrl,
        links: stop.links.map((link) => ({
          nodeId: link.nodeId,
          position: {
            yaw: link.yaw,
            pitch: link.pitch,
          },
        })),
        markers: stop.hotspots.map((hotspot) => ({
          id: hotspot.id,
          html: `<div class="tour-marker-chip">${hotspot.label}</div>`,
          anchor: 'bottom center',
          position: {
            yaw: hotspot.yaw,
            pitch: hotspot.pitch,
          },
          tooltip: {
            content: hotspot.note ?? hotspot.label,
            trigger: 'click',
          },
          content: hotspot.note ?? hotspot.label,
        })),
      })),
    [property.tourStops]
  );

  useEffect(() => {
    setSelectedStopId(property.tourStops[0]?.id ?? '');
  }, [property.tourStops]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) {
      return;
    }

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: nodes[0].panorama,
      mousewheelCtrlKey: false,
      touchmoveTwoFingers: false,
      defaultYaw: '0deg',
      defaultPitch: '0deg',
      plugins: [
        MarkersPlugin.withConfig({}),
        VirtualTourPlugin.withConfig({
          dataMode: 'client',
          positionMode: 'manual',
          renderMode: '3d',
          nodes,
          startNodeId: nodes[0].id,
          preload: true,
          transitionOptions: {
            showLoader: true,
            effect: 'fade',
            rotation: true,
            speed: '14rpm',
          },
          linksOnCompass: true,
          showLinkTooltip: true,
        }),
      ],
    });

    const virtualTour = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin | null;

    if (!virtualTour) {
      viewer.destroy();
      return;
    }

    const handleNodeChanged = (
      event: (typeof virtualTourEvents.NodeChangedEvent)['prototype']
    ) => {
      setSelectedStopId(event.node.id);
    };

    virtualTour.addEventListener(
      virtualTourEvents.NodeChangedEvent.type,
      handleNodeChanged
    );

    viewerRef.current = viewer;
    virtualTourRef.current = virtualTour;
    setSelectedStopId(nodes[0].id);

    return () => {
      virtualTour.removeEventListener(
        virtualTourEvents.NodeChangedEvent.type,
        handleNodeChanged
      );
      virtualTourRef.current = null;
      viewerRef.current = null;
      viewer.destroy();
    };
  }, [nodes]);

  if (!selectedStop) {
    return null;
  }

  function selectStop(stop: PropertyTourStop) {
    virtualTourRef.current?.setCurrentNode(stop.id, {
      showLoader: true,
      effect: 'fade',
      rotation: true,
      speed: '14rpm',
    });
  }

  return (
    <section className="surface-panel overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Remote inspection</p>
          <h2 className="mt-2 font-display text-4xl text-stone-950">
            3D walkthrough with checklist context
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Drag the viewer to inspect each room, then use the scene cards to move across
            the home. The right column keeps the current room features visible while you
            explore.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-stone-300/70 bg-white/70 px-4 py-3 text-sm text-stone-700">
          Active scene:
          <span className="ml-2 font-semibold text-stone-950">{selectedStop.label}</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-[1.9rem] border border-stone-300/60 bg-stone-950 shadow-[0_24px_60px_rgba(17,17,17,0.22)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <p className="font-semibold text-white">
              {property.title} / {selectedStop.label}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Inspection mode
            </p>
          </div>

          <div ref={containerRef} className="house-tour-viewer h-[560px] bg-stone-950" />

          <div className="grid gap-3 border-t border-white/10 bg-stone-950 p-4 md:grid-cols-4">
            {property.tourStops.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => selectStop(stop)}
                className={`overflow-hidden rounded-[1.25rem] border text-left transition ${
                  stop.id === selectedStop.id
                    ? 'border-orange-300/60 bg-white/12'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={stop.thumbnailUrl}
                    alt={`${stop.label} thumbnail`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                    {stop.kind}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{stop.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="soft-card">
            <p className="eyebrow">Current scene</p>
            <h3 className="mt-3 text-2xl font-semibold text-stone-950">
              {selectedStop.label}
            </h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {selectedStop.captureNote}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedStop.highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold text-orange-600"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-[1rem] border border-stone-300/70 bg-white/75 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Visible span
              </p>
              <p className="mt-1 text-xl font-semibold text-stone-950">
                {selectedStop.dimensions}
              </p>
            </div>

            {selectedRoom ? (
              <div className="mt-5 grid gap-3">
                {selectedRoom.fixtures.map((fixture) => (
                  <div
                    key={`${selectedRoom.room}-${fixture.label}`}
                    className="rounded-[1rem] border border-stone-300/70 bg-white/75 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-stone-900">{fixture.label}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                        {fixture.status}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{fixture.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {selectedStop.hotspots.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="rounded-[1rem] border border-stone-300/70 bg-white/75 px-4 py-3"
                  >
                    <p className="font-semibold text-stone-900">{hotspot.label}</p>
                    <p className="mt-2 text-sm text-stone-600">{hotspot.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="soft-card">
            <p className="eyebrow">3D relation</p>
            <div className="mt-4">
              <PropertyMediaPreview
                title={property.title}
                variant="aerial"
                roomLabels={[selectedStop.roomLabel ?? selectedStop.label]}
                caption="Use the walkthrough for free-look inspection, then cross-check room relation here."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
