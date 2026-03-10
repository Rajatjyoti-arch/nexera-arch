import { useState } from "react";
import { useVendors, useVendorProducts, Vendor } from "@/hooks/useVendors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Package, Search, MapPin, Star, Phone, Mail, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorMarketplace() {
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: allProducts = [], isLoading: productsLoading } = useVendorProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState("vendors");

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = allProducts.filter(
    (p) =>
      (!selectedVendor || p.vendor_id === selectedVendor.id) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = [...new Set(vendors.map((v) => v.category).filter(Boolean))];

  const isEmpty = vendors.length === 0 && !vendorsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {selectedVendor && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedVendor(null)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              {selectedVendor ? selectedVendor.name : "Campus Marketplace"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedVendor
                ? selectedVendor.description || "Browse products from this vendor"
                : "Browse campus vendors and their products"}
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No vendors yet</h3>
          <p className="text-muted-foreground mt-1 text-sm max-w-md mx-auto">
            The campus marketplace is being set up. Vendors and products will appear here once added by administrators.
          </p>
        </motion.div>
      )}

      {!isEmpty && !selectedVendor && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="vendors" className="gap-1.5">
              <Store className="h-3.5 w-3.5" /> Vendors
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="h-3.5 w-3.5" /> All Products
            </TabsTrigger>
          </TabsList>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSearchQuery(cat!)}
                >
                  {cat}
                </Badge>
              ))}
              {searchQuery && (
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setSearchQuery("")}
                >
                  Clear filter ✕
                </Badge>
              )}
            </div>
          )}

          <TabsContent value="vendors" className="mt-4">
            {vendorsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                      <div className="h-3 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredVendors.map((vendor, i) => (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-border/50"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setActiveTab("products");
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{vendor.name}</CardTitle>
                            {vendor.rating > 0 && (
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                <span className="text-xs font-medium">{vendor.rating}</span>
                              </div>
                            )}
                          </div>
                          {vendor.category && (
                            <Badge variant="secondary" className="w-fit text-xs">
                              {vendor.category}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          {vendor.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {vendor.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {vendor.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {vendor.location}
                              </span>
                            )}
                            {vendor.contact_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {vendor.contact_phone}
                              </span>
                            )}
                            {vendor.contact_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {vendor.contact_email}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredVendors.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No vendors match your search.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <ProductsGrid products={filteredProducts} loading={productsLoading} vendors={vendors} />
          </TabsContent>
        </Tabs>
      )}

      {/* Selected Vendor Products */}
      {selectedVendor && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {selectedVendor.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {selectedVendor.location}
              </span>
            )}
            {selectedVendor.contact_phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {selectedVendor.contact_phone}
              </span>
            )}
            {selectedVendor.contact_email && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> {selectedVendor.contact_email}
              </span>
            )}
            {selectedVendor.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" /> {selectedVendor.rating}
              </span>
            )}
          </div>
          <ProductsGrid products={filteredProducts} loading={productsLoading} vendors={vendors} />
        </div>
      )}
    </div>
  );
}

function ProductsGrid({
  products,
  loading,
  vendors,
}: {
  products: any[];
  loading: boolean;
  vendors: Vendor[];
}) {
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence>
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 border-border/50">
              {product.image_url ? (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="font-bold text-primary text-sm whitespace-nowrap">
                    ₹{product.price}
                  </span>
                </div>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {product.category && (
                    <Badge variant="outline" className="text-[10px]">
                      {product.category}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {vendorMap.get(product.vendor_id) || "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
