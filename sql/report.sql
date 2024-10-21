--total sales
SELECT
	SUM(S."payableAmount") "totalPayable",
	SUM(S."paidUpi") "paidUpi",
	SUM(S."paidCash") "paidCash",
	SUM(S."totalPaid") "paidTotal",
	STATUS
FROM
	SALES S
WHERE
	S."invoiceDate" = '15-Oct-2024'
GROUP BY
	S.STATUS;

SELECT
	SUM(S."payableAmount") "totalPayable",
	SUM(S."paidUpi") "paidUpi",
	SUM(S."paidCash") "paidCash",
	SUM(S."totalPaid") "paidTotal",
	STATUS
FROM
	PURCHASES S
WHERE
	S."invoiceDate" = '15-Oct-2024'
GROUP BY
	S.STATUS;

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
	AND SS."invoiceDate" = '11-OCT-24';

CREATE
OR REPLACE FUNCTION PUBLIC.F_SALES_DAILY_REPORT_DETAILS (F_DATE DATE) RETURNS TABLE (
	"itemId" text,
	"itemName" text,
	"categoryName" text,
	"AMOUNT" DOUBLE PRECISION,
	"DISCOUNT" TEXT,
	"STATUS" text
) LANGUAGE 'plpgsql' AS $BODY$
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