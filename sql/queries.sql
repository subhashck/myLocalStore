SELECT
	*
FROM
	ITEMS
ORDER BY
	1;

SELECT
	*
FROM
	"v_inventoryDetails";
	

DROP VIEW "v_inventoryDetails";

CREATE VIEW "v_inventoryDetails" AS
SELECT
	"customer" "counterParty",
	"salesId" "counterPartyId",
	"itemId",
	"itemName",
	"saleDetails"."quantity"*-1 "quantity",
	UPPER("unit") "unitName",
	"invoiceDate",
	"status"
FROM
	"saleDetails",
	"sales"
WHERE
	"saleDetails"."salesId" = "sales"."id"
UNION ALL
SELECT
	"vendorName" "counterParty",
	"purchaseId" "counterPartyId",
	"itemId",
	"itemName",
	"quantity",
	UPPER("unit") "unitName",
	"invoiceDate",
	"status"
FROM
	"purchaseDetails",
	"purchases"
WHERE
	"purchaseDetails"."purchaseId" = "purchases"."id";
