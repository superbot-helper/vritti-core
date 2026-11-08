DELETE FROM commerce.tax_group_rates WHERE situation IN ('IMPORT', 'EXPORT', 'UNION_B2B', 'UNION_B2C');
--> statement-breakpoint
UPDATE commerce.tax_group_rates SET jurisdiction_check = 'SAME' WHERE situation = 'DOMESTIC_SAME_STATE';
--> statement-breakpoint
UPDATE commerce.tax_group_rates SET jurisdiction_check = 'DIFFERENT' WHERE situation = 'DOMESTIC_OTHER_STATE';
