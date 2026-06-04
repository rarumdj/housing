import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardKeys } from '@/routes/keys';
import { toRequestMessage } from '@/lib/utils';
import { PropertyForm, type PropertyFormValues } from '@/components/landlord/property-form';
import {
  useCreatePropertyMutation,
  usePublishPropertyMutation,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useSetCoverMediaMutation,
} from '@/services/properties/queries';
import type { PropertyMedia } from '@/types/domain';

const CreatePropertyPage = () => {
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
    const code = (result as unknown as { data: { code: string } }).data.code;
    setPropertyId(code);
    navigate(dashboardKeys.landlord.detail.build(code));
  };

  const handlePublish = async () => {
    if (!propertyId) return;
    try {
      await publishMutation.mutateAsync(propertyId);
      toast.success('Property submitted for review');
      navigate(dashboardKeys.landlord.properties.path);
    } catch (err) {
      toast.error(toRequestMessage(err));
    }
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
    setMedia((prev) => prev.filter((m) => m.code !== mediaId));
  };

  const handleSetCover = (mediaId: string) => {
    if (!propertyId) return;
    coverMutation.mutate({ propertyId, mediaId });
    setMedia((prev) =>
      prev.map((m) => ({ ...m, isCover: m.code === mediaId })),
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
};

export default CreatePropertyPage;
