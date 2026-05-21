import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { PropertyForm, type PropertyFormValues } from '@/components/landlord/property-form';
import {
  useCreatePropertyMutation,
  usePublishPropertyMutation,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useSetCoverMediaMutation,
} from '@/services/properties/queries';
import type { PropertyMedia } from '@/types/domain';

export default function CreatePropertyPage() {
  const navigate = useNavigate();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [media, setMedia] = useState<PropertyMedia[]>([]);

  const createMutation = useCreatePropertyMutation();
  const publishMutation = usePublishPropertyMutation();
  const uploadMutation = useUploadMediaMutation();
  const deleteMutation = useDeleteMediaMutation();
  const coverMutation = useSetCoverMediaMutation();

  const handleSubmit = async (data: PropertyFormValues) => {
    if (propertyId) {
      navigate(dashboardKeys.landlord.detail.build(propertyId));
      return;
    }

    const result = await createMutation.mutateAsync(data);
    const id = (result as unknown as { data: { id: string } }).data.id;
    setPropertyId(id);
    navigate(dashboardKeys.landlord.detail.build(id));
  };

  const handlePublish = async () => {
    if (!propertyId) return;
    await publishMutation.mutateAsync(propertyId);
    navigate(dashboardKeys.landlord.properties.path);
  };

  const handleUpload = async (files: File[]) => {
    if (!propertyId) return;
    const result = await uploadMutation.mutateAsync({ propertyId, files });
    const newMedia = (result as unknown as { data: PropertyMedia[] }).data;
    setMedia((prev) => [...prev, ...newMedia]);
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (!propertyId) return;
    deleteMutation.mutate({ propertyId, mediaId });
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const handleSetCover = (mediaId: string) => {
    if (!propertyId) return;
    coverMutation.mutate({ propertyId, mediaId });
    setMedia((prev) =>
      prev.map((m) => ({ ...m, isCover: m.id === mediaId })),
    );
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-3xl py-8">
        <button
          onClick={() => navigate(dashboardKeys.landlord.home.path)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <h1 className="mb-8 font-display text-2xl font-bold">Add New Property</h1>

        <PropertyForm
          onSubmit={handleSubmit}
          onPublish={propertyId ? handlePublish : undefined}
          onUploadMedia={propertyId ? handleUpload : undefined}
          onDeleteMedia={handleDeleteMedia}
          onSetCoverMedia={handleSetCover}
          existingMedia={media}
          propertyId={propertyId ?? undefined}
          isSubmitting={createMutation.isPending || publishMutation.isPending}
          isUploading={uploadMutation.isPending}
          mode="create"
        />
      </div>
    </div>
  );
}
