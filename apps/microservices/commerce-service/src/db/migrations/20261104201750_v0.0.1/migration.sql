ALTER TABLE "commerce"."supplier_item_sites" RENAME TO "supplier_site_items";--> statement-breakpoint
ALTER INDEX "commerce"."uq_supplier_item_sites_preferred" RENAME TO "uq_supplier_site_items_preferred";--> statement-breakpoint
ALTER INDEX "commerce"."idx_supplier_item_sites_site" RENAME TO "idx_supplier_site_items_site";--> statement-breakpoint
ALTER INDEX "commerce"."idx_supplier_item_sites_item" RENAME TO "idx_supplier_site_items_item";--> statement-breakpoint
ALTER INDEX "commerce"."idx_supplier_item_sites_le" RENAME TO "idx_supplier_site_items_le";--> statement-breakpoint
ALTER TABLE "commerce"."supplier_site_items" RENAME CONSTRAINT "uq_supplier_item_sites" TO "uq_supplier_site_items";