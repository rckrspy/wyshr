import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

interface Vehicle {
  id: string;
  licensePlate: string;
  state: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  status: 'pending_verification' | 'verified' | 'rejected' | 'expired';
  verifiedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

interface CreateVehicleRequest {
  licensePlate: string;
  state: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
}

export interface VehicleVerification {
  id: string;
  documentType: 'insurance' | 'registration' | 'title';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  requiresManualReview: boolean;
}

interface VerificationStatus {
  vehicle: {
    id: string;
    status: string;
    verifiedAt?: string;
    expiresAt?: string;
  };
  verifications: VehicleVerification[];
  isVerified: boolean;
  requiresAction: boolean;
}

interface UploadDocumentRequest {
  vehicleId: string;
  documentType: 'insurance' | 'registration' | 'title';
  document: File;
}

export const vehicleApi = createApi({
  reducerPath: 'vehicleApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vehicle', 'VehicleVerification'],
  endpoints: (builder) => ({
    // Get all user vehicles
    getVehicles: builder.query<Vehicle[], void>({
      query: () => '/user/vehicles',
      providesTags: ['Vehicle'],
      transformResponse: (response: { vehicles: Vehicle[] }) => response.vehicles,
    }),

    // Get specific vehicle
    getVehicle: builder.query<Vehicle, string>({
      query: (id) => `/user/vehicles/${id}`,
      transformResponse: (response: { vehicle: Vehicle }) => response.vehicle,
      providesTags: (result, error, id) => [{ type: 'Vehicle', id }],
    }),

    // Create new vehicle
    createVehicle: builder.mutation<Vehicle, CreateVehicleRequest>({
      query: (body) => ({
        url: '/user/vehicles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vehicle'],
      transformResponse: (response: { message: string; vehicle: Vehicle }) => response.vehicle,
    }),

    // Delete vehicle
    deleteVehicle: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/user/vehicles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // Upload verification document
    uploadVerificationDocument: builder.mutation<
      { message: string; verification: VehicleVerification },
      UploadDocumentRequest
    >({
      query: ({ vehicleId, documentType, document }) => {
        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('document', document);

        return {
          url: `/user/vehicles/${vehicleId}/verify`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: 'Vehicle', id: vehicleId },
        'VehicleVerification',
      ],
    }),

    // Submit verification
    submitVerification: builder.mutation<{ message: string; verification: VehicleVerification }, { vehicleId: string; formData: FormData }>({  
      query: ({ vehicleId, formData }) => ({
        url: `/user/vehicles/${vehicleId}/verify`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: 'Vehicle', id: vehicleId },
        { type: 'VehicleVerification', id: vehicleId },
      ],
    }),
    
    // Get vehicle verifications
    getVehicleVerifications: builder.query<VehicleVerification[], string>({
      query: (vehicleId) => `/user/vehicles/${vehicleId}/verifications`,
      providesTags: (result, error, id) => [{ type: 'VehicleVerification', id }],
    }),
    
    // Get verification status
    getVerificationStatus: builder.query<VerificationStatus, string>({
      query: (vehicleId) => `/user/vehicles/${vehicleId}/verification-status`,
      providesTags: (result, error, vehicleId) => [
        { type: 'Vehicle', id: vehicleId },
        'VehicleVerification',
      ],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleQuery,
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useUploadVerificationDocumentMutation,
  useSubmitVerificationMutation,
  useGetVehicleVerificationsQuery,
  useGetVerificationStatusQuery,
} = vehicleApi;