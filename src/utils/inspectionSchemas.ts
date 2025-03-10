
import * as z from 'zod';
import { PhotoCategory, TradeType } from '@/types';

export const formSchema = z.object({
  dealerId: z.string().optional(),
  dealerName: z.string().optional(),
  vehicleInfo: z.object({
    tradeType: z.nativeEnum(TradeType, { required_error: "Trade type is required" }),
    vin: z.string().min(17, { message: "VIN must be 17 characters" }),
    make: z.string().min(1, { message: "Make is required" }),
    model: z.string().min(1, { message: "Model is required" }),
    year: z.number().min(1900, { message: "Year must be 1900 or later" }),
    regNumber: z.string().min(1, { message: "Registration number is required" }),
    mileage: z.number().min(0, { message: "Mileage must be 0 or higher" }),
    engineHours: z.number().optional(),
    color: z.string().min(1, { message: "Color is required" }),
  }),
  inspectionItems: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      name: z.string(),
      description: z.string(),
      status: z.enum(["Pass", "Fail", "Not Checked"]),
      notes: z.string().optional(),
      failurePhoto: z.any().optional(),
      failurePhotoUrl: z.string().optional(),
    }).refine((data) => {
      // If status is Fail, notes must be provided
      if (data.status === "Fail") {
        return !!data.notes && data.notes.trim() !== "";
      }
      return true;
    }, {
      message: "Notes are required when an item fails inspection",
      path: ["notes"]
    }).refine((data) => {
      // If status is Fail, a photo must be provided
      if (data.status === "Fail") {
        return !!data.failurePhoto || !!data.failurePhotoUrl;
      }
      return true;
    }, {
      message: "A photo is required when an item fails inspection",
      path: ["failurePhoto"]
    })
  ),
  photos: z.array(z.object({
    id: z.string(),
    url: z.string(),
    caption: z.string(),
    category: z.nativeEnum(PhotoCategory),
    uploadedAt: z.date(),
  })).optional(),
  notes: z.string().optional(),
});
