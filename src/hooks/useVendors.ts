import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Vendor {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  is_active: boolean;
  rating: number;
  created_at: string;
}

export interface VendorProduct {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_available: boolean;
  created_at: string;
}

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Vendor[];
    },
  });
}

export function useVendorProducts(vendorId?: string) {
  return useQuery({
    queryKey: ["vendor-products", vendorId],
    queryFn: async () => {
      let query = supabase
        .from("vendor_products")
        .select("*")
        .order("name");
      if (vendorId) {
        query = query.eq("vendor_id", vendorId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as VendorProduct[];
    },
    enabled: vendorId ? true : true,
  });
}
