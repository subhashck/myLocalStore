-- FUNCTION: public.f_daily_report_prevClosing(date)

-- DROP FUNCTION IF EXISTS public."f_daily_report_prevClosing"(date);

CREATE OR REPLACE FUNCTION public."f_daily_report_prevClosing"(
	f_date date)
    RETURNS double precision
    LANGUAGE 'sql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
 SELECT
	d."cashClosing"
FROM
	"dailyReport" d
WHERE
	d."reportDate" = (select max(dd."reportDate") from "dailyReport" dd where dd."reportDate" < f_date)
$BODY$;

ALTER FUNCTION public."f_daily_report_prevClosing"(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public."f_daily_report_prevClosing"(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public."f_daily_report_prevClosing"(date) TO anon;

GRANT EXECUTE ON FUNCTION public."f_daily_report_prevClosing"(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public."f_daily_report_prevClosing"(date) TO postgres;

GRANT EXECUTE ON FUNCTION public."f_daily_report_prevClosing"(date) TO service_role;


-- FUNCTION: public.f_daily_report_prev_due(date)

-- DROP FUNCTION IF EXISTS public.f_daily_report_prev_due(date);

CREATE OR REPLACE FUNCTION public.f_daily_report_prev_due(
	f_date date)
    RETURNS double precision
    LANGUAGE 'sql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
select sum("payableAmount" - "totalPaid") from sales where status= 'DUE' and "invoiceDate"< f_date
$BODY$;

ALTER FUNCTION public.f_daily_report_prev_due(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_daily_report_prev_due(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_daily_report_prev_due(date) TO anon;

GRANT EXECUTE ON FUNCTION public.f_daily_report_prev_due(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_daily_report_prev_due(date) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_daily_report_prev_due(date) TO service_role;

-- FUNCTION: public.f_daily_report_today_due(date)

-- DROP FUNCTION IF EXISTS public.f_daily_report_today_due(date);

CREATE OR REPLACE FUNCTION public.f_daily_report_today_due(
	f_date date)
    RETURNS double precision
    LANGUAGE 'sql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
select sum("payableAmount" - "totalPaid") from sales where status= 'DUE' and "invoiceDate"= f_date
$BODY$;

ALTER FUNCTION public.f_daily_report_today_due(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_daily_report_today_due(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_daily_report_today_due(date) TO anon;

GRANT EXECUTE ON FUNCTION public.f_daily_report_today_due(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_daily_report_today_due(date) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_daily_report_today_due(date) TO service_role;

-- FUNCTION: public.f_purchase_daily_report_details(date)

-- DROP FUNCTION IF EXISTS public.f_purchase_daily_report_details(date);

CREATE OR REPLACE FUNCTION public.f_purchase_daily_report_details(
	f_date date)
    RETURNS TABLE("itemId" bigint, "itemName" text, "categoryName" text, "AMOUNT" double precision, "DISCOUNT" double precision, "STATUS" text) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN RETURN QUERY 
SELECT
	S."itemId",
	I."itemName",
	C."categoryName",
	S.AMOUNT,
	SS.DISCOUNT,
	SS.STATUS
FROM
	"purchaseDetails" S,
	"items" I,
	"itemCategories" C,
	"purchases" SS
WHERE
	I.ID = S."itemId"
	AND C.ID = I."categoryId"
	AND SS.ID = S."purchaseId"
	AND SS."invoiceDate" = f_date;
 END; 
$BODY$;

ALTER FUNCTION public.f_purchase_daily_report_details(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_purchase_daily_report_details(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_purchase_daily_report_details(date) TO anon;

GRANT EXECUTE ON FUNCTION public.f_purchase_daily_report_details(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_purchase_daily_report_details(date) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_purchase_daily_report_details(date) TO service_role;

-- FUNCTION: public.f_purchases_daily_report(date)

-- DROP FUNCTION IF EXISTS public.f_purchases_daily_report(date);

CREATE OR REPLACE FUNCTION public.f_purchases_daily_report(
	f_date date)
    RETURNS TABLE("totalPayable" double precision, "paidUpi" double precision, "paidCash" double precision, "paidTotal" double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN RETURN QUERY 
 SELECT
	SUM(S."payableAmount") "totalPayable",
	SUM(S."paidUpi") "paidUpi",
	SUM(S."paidCash") "paidCash",
	SUM(S."totalPaid") "paidTotal"
FROM
	PURCHASES S
WHERE
	S."invoiceDate" = F_DATE ;
 END; 
$BODY$;

ALTER FUNCTION public.f_purchases_daily_report(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_purchases_daily_report(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_purchases_daily_report(date) TO anon;

GRANT EXECUTE ON FUNCTION public.f_purchases_daily_report(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_purchases_daily_report(date) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_purchases_daily_report(date) TO service_role;

-- FUNCTION: public.f_purchases_filter_by_item(text)

-- DROP FUNCTION IF EXISTS public.f_purchases_filter_by_item(text);

CREATE OR REPLACE FUNCTION public.f_purchases_filter_by_item(
	f_itemname text)
    RETURNS TABLE(id bigint, "vendorName" text, status text, "invoiceDate" date, "billedAmount" double precision, discount double precision, "payableAmount" double precision, "paidUpi" double precision, "paidCash" double precision, "totalPaid" double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN RETURN QUERY SELECT "purchases".id , "purchases"."vendorName","purchases".status, "purchases"."invoiceDate", "purchases"."billedAmount", "purchases".discount, "purchases"."payableAmount","purchases"."paidUpi", "purchases"."paidCash", "purchases"."totalPaid"  FROM "purchases" where exists ( select 1 from "purchaseDetails" where "purchaseDetails"."purchaseId" = "purchases".id and "purchaseDetails"."itemName" ilike '%'||f_itemName||'%') ; END; 
$BODY$;

ALTER FUNCTION public.f_purchases_filter_by_item(text)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_purchases_filter_by_item(text) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_purchases_filter_by_item(text) TO anon;

GRANT EXECUTE ON FUNCTION public.f_purchases_filter_by_item(text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_purchases_filter_by_item(text) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_purchases_filter_by_item(text) TO service_role;

-- FUNCTION: public.f_sales_daily_report(date)

-- DROP FUNCTION IF EXISTS public.f_sales_daily_report(date);

CREATE OR REPLACE FUNCTION public.f_sales_daily_report(
	f_date date)
    RETURNS TABLE("totalPayable" double precision, "paidUpi" double precision, "paidCash" double precision, "paidTotal" double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN RETURN QUERY 
 SELECT
	SUM(S."payableAmount") "totalPayable",
	SUM(S."paidUpi") "paidUpi",
	SUM(S."paidCash") "paidCash",
	SUM(S."totalPaid") "paidTotal"
FROM
	SALES S
WHERE
	S."invoiceDate" = F_DATE;
 END; 
$BODY$;

ALTER FUNCTION public.f_sales_daily_report(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report(date) TO anon;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report(date) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report(date) TO service_role;

-- FUNCTION: public.f_sales_daily_report_details(date)

-- DROP FUNCTION IF EXISTS public.f_sales_daily_report_details(date);

CREATE OR REPLACE FUNCTION public.f_sales_daily_report_details(
	f_date date)
    RETURNS TABLE("itemId" bigint, "itemName" text, "categoryName" text, "AMOUNT" double precision, "DISCOUNT" double precision, "STATUS" text) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN RETURN QUERY 
SELECT
	S."itemId",
	I."itemName",
	C."categoryName",
	S.AMOUNT,
	SS.DISCOUNT,
	SS.STATUS
FROM
	"saleDetails" S,
	"items" I,
	"itemCategories" C,
	"sales" SS
WHERE
	I.ID = S."itemId"
	AND C.ID = I."categoryId"
	AND SS.ID = S."salesId"
	AND SS."invoiceDate" = f_date;
 END; 
$BODY$;

ALTER FUNCTION public.f_sales_daily_report_details(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report_details(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report_details(date) TO anon;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report_details(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report_details(date) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_daily_report_details(date) TO service_role;

-- FUNCTION: public.f_sales_due_daily_report(date)

-- DROP FUNCTION IF EXISTS public.f_sales_due_daily_report(date);

CREATE OR REPLACE FUNCTION public.f_sales_due_daily_report(
	f_date date)
    RETURNS TABLE("totalPayable" double precision, "paidUpi" double precision, "paidCash" double precision, "paidTotal" double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN RETURN QUERY 
 SELECT
	SUM(S."payableAmount") "totalPayable",
	SUM(S."paidUpi") "paidUpi",
	SUM(S."paidCash") "paidCash",
	SUM(S."totalPaid") "paidTotal"
FROM
	SALES S
WHERE
	S."invoiceDate" < F_DATE 
	AND s."paymentDate" = f_date;
 END; 
$BODY$;

ALTER FUNCTION public.f_sales_due_daily_report(date)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_due_daily_report(date) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_sales_due_daily_report(date) TO anon;

GRANT EXECUTE ON FUNCTION public.f_sales_due_daily_report(date) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_sales_due_daily_report(date) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_due_daily_report(date) TO service_role;

-- FUNCTION: public.f_sales_filter_by_item(text)

-- DROP FUNCTION IF EXISTS public.f_sales_filter_by_item(text);

CREATE OR REPLACE FUNCTION public.f_sales_filter_by_item(
	f_itemname text)
    RETURNS TABLE(id bigint, customer text, status text, "invoiceDate" date, "billedAmount" double precision, discount double precision, "payableAmount" double precision, "paidUpi" double precision, "paidCash" double precision, "totalPaid" double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN RETURN QUERY SELECT "sales".id , "sales".customer,"sales".status, "sales"."invoiceDate", "sales"."billedAmount", "sales".discount, "sales"."payableAmount","sales"."paidUpi", "sales"."paidCash", "sales"."totalPaid"  FROM "sales" where exists ( select 1 from "saleDetails" where "saleDetails"."salesId" = "sales".id and "saleDetails"."itemName" ilike '%'||f_itemName||'%') ; END; 
$BODY$;

ALTER FUNCTION public.f_sales_filter_by_item(text)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_filter_by_item(text) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.f_sales_filter_by_item(text) TO anon;

GRANT EXECUTE ON FUNCTION public.f_sales_filter_by_item(text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.f_sales_filter_by_item(text) TO postgres;

GRANT EXECUTE ON FUNCTION public.f_sales_filter_by_item(text) TO service_role;

