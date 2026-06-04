import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { PropertyForm, type PropertyFormValues } from '@/components/landlord/property-form';
import {
  usePropertyQuery,
  useUpdatePropertyMutation,
  usePublishPropertyMutation,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useSetCoverMediaMutation,
} from '@/services/properties/queries';

const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = usePropertyQuery(id!);
  const property = data?.data;

  const updateMutation = useUpdatePropertyMutation();
  const publishMutation = usePublishPropertyMutation();
  const uploadMutation = useUploadMediaMutation();
  const deleteMutation = useDeleteMediaMutation();
  const coverMutation = useSetCoverMediaMutation();

  const handleSubmit = async (values: PropertyFormValues) => {
    await updateMutation.mutateAsync({ id: id!, ...values });
    navigate(dashboardKeys.landlord.detail.build(id!));
  };

  const handlePublish = async () => {
    await publishMutation.mutateAsync(id!);
    navigate(dashboardKeys.landlord.properties.path);
  };

  const handleUpload = async (files: File[]) => {
    await uploadMutation.mutateAsync({ propertyId: id!, files });
  };

  const handleDeleteMedia = (mediaId: string) => {
    deleteMutation.mutate({ propertyId: id!, mediaId });
  };

  const handleSetCover = (mediaId: string) => {
    coverMutation.mutate({ propertyId: id!, mediaId });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-3xl py-8">
        <button
          onClick={() => navigate(dashboardKeys.landlord.detail.build(id!))}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to property
        </button>

        <h1 className="mb-8 font-display text-2xl font-bold">Edit Property</h1>

        <PropertyForm
          defaultValues={{
            title: property.title,
            description: property.description,
            type: property.type,
            address: property.address,
            lga: property.lga,
            state: property.state,
            priceMonthly: property.priceMonthly,
            priceAnnually: property.priceAnnually,
            cautionDeposit: property.cautionDeposit,
            availableFrom: property.availableFrom?.split('T')[0],
            isFurnished: property.isFurnished,
            hasGenerator: property.hasGenerator,
            hasSecurity: property.hasSecurity,
            hasParking: property.hasParking,
          }}
          existingMedia={property.media || []}
          propertyId={id}
          onSubmit={handleSubmit}
          onPublish={property.status === 'DRAFT' ? handlePublish : undefined}
          onUploadMedia={handleUpload}
          onDeleteMedia={handleDeleteMedia}
          onSetCoverMedia={handleSetCover}
          isSubmitting={updateMutation.isPending || publishMutation.isPending}
          isUploading={uploadMutation.isPending}
          mode="edit"
        />
      </div>
    </div>
  );
};

export default EditPropertyPage;
