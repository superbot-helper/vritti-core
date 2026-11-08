DROP POLICY "org_isolation" ON "commerce"."credit_notes";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."credit_notes";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."credit_notes";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."credit_notes";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."credit_notes";--> statement-breakpoint
DROP POLICY "org_isolation" ON "commerce"."invoices";--> statement-breakpoint
DROP POLICY "site_read" ON "commerce"."invoices";--> statement-breakpoint
DROP POLICY "site_write" ON "commerce"."invoices";--> statement-breakpoint
DROP POLICY "site_update" ON "commerce"."invoices";--> statement-breakpoint
DROP POLICY "site_delete" ON "commerce"."invoices";--> statement-breakpoint
ALTER TABLE "commerce"."credit_note_applications" DROP CONSTRAINT "credit_note_applications_credit_note_id_credit_notes_id_fkey";--> statement-breakpoint
ALTER TABLE "commerce"."credit_note_applications" DROP CONSTRAINT "credit_note_applications_invoice_id_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "commerce"."invoice_items" DROP CONSTRAINT "invoice_items_invoice_id_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "commerce"."payments" DROP CONSTRAINT "payments_invoice_id_invoices_id_fkey";--> statement-breakpoint
DROP TABLE "commerce"."credit_note_applications";--> statement-breakpoint
DROP TABLE "commerce"."credit_notes";--> statement-breakpoint
DROP TABLE "commerce"."invoice_items";--> statement-breakpoint
DROP TABLE "commerce"."invoices";--> statement-breakpoint
DROP TABLE "commerce"."payments";--> statement-breakpoint
DROP TYPE "commerce"."credit_note_status";--> statement-breakpoint
DROP TYPE "commerce"."credit_note_type";--> statement-breakpoint
DROP TYPE "commerce"."invoice_party_type";--> statement-breakpoint
DROP TYPE "commerce"."invoice_status";--> statement-breakpoint
DROP TYPE "commerce"."invoice_type";--> statement-breakpoint
DROP TYPE "commerce"."payment_method";--> statement-breakpoint
DROP TYPE "commerce"."payment_status";