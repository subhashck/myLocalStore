-- FUNCTION: public.f_sales_filter_by_item(text)

-- DROP FUNCTION IF EXISTS public.f_sales_filter_by_item(text);

CREATE OR REPLACE FUNCTION public.f_sales_filter_by_item(
	f_itemname text)
    RETURNS TABLE(id bigint, customer text, status text, "invoiceDate" date, "billedAmount" double precision, discount double precision, "payableAmount" double precision, "paidUpi" double precision, "paidCash" double precision, "totalPaid" double precision) 
    LANGUAGE 'plpgsql'
AS $BODY$
 BEGIN RETURN QUERY SELECT "sales".id , "sales".customer,"sales".status, "sales"."invoiceDate", "sales"."billedAmount", "sales".discount, "sales"."payableAmount","sales"."paidUpi", "sales"."paidCash", "sales"."totalPaid"  FROM "sales" where exists ( select 1 from "saleDetails" where "saleDetails"."salesId" = "sales".id and "saleDetails"."itemName" ilike '%'||f_itemName||'%') ; END; 
$BODY$;
