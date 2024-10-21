-- View: public.v_inventory

-- DROP VIEW public.v_inventory;

CREATE OR REPLACE VIEW public.v_inventory
 AS
 WITH inventory AS (
         SELECT s."itemId",
            s."itemName",
                CASE
                    WHEN upper(s.unit) = 'PCS'::text THEN s.quantity * '-1'::bigint
                    ELSE (( SELECT u.factor * '-1'::integer
                       FROM "itemUnits" u
                      WHERE u."itemId" = s."itemId" AND upper(s.unit) = upper(u."unitName")
                     LIMIT 1)) * s.quantity
                END AS quantity
           FROM "saleDetails" s
        UNION ALL
         SELECT s."itemId",
            s."itemName",
                CASE
                    WHEN upper(s.unit) = 'PCS'::text THEN s.quantity
                    ELSE (( SELECT u.factor::integer AS factor
                       FROM "itemUnits" u
                      WHERE u."itemId" = s."itemId" AND upper(s.unit) = upper(u."unitName")
                     LIMIT 1)) * s.quantity
                END AS quantity
           FROM "purchaseDetails" s
        UNION ALL
         SELECT "inventoryCorrection"."itemId",
            "inventoryCorrection"."itemName",
            "inventoryCorrection".quantity
           FROM "inventoryCorrection"
        )
 SELECT inventory."itemId",
    inventory."itemName",
    sum(inventory.quantity) AS quantity
   FROM inventory
  GROUP BY inventory."itemId", inventory."itemName";

ALTER TABLE public.v_inventory
    OWNER TO postgres;

GRANT ALL ON TABLE public.v_inventory TO anon;
GRANT ALL ON TABLE public.v_inventory TO authenticated;
GRANT ALL ON TABLE public.v_inventory TO postgres;
GRANT ALL ON TABLE public.v_inventory TO service_role;

-- View: public.v_inventoryDetails

-- DROP VIEW public."v_inventoryDetails";

CREATE OR REPLACE VIEW public."v_inventoryDetails"
 AS
 SELECT sales.customer AS "counterParty",
    "saleDetails"."salesId" AS "counterPartyId",
    "saleDetails"."itemId",
    "saleDetails"."itemName",
    "saleDetails".quantity * '-1'::integer AS quantity,
    upper("saleDetails".unit) AS "unitName",
    sales."invoiceDate",
    'SALE'::text AS status
   FROM "saleDetails",
    sales
  WHERE "saleDetails"."salesId" = sales.id
UNION ALL
 SELECT purchases."vendorName" AS "counterParty",
    "purchaseDetails"."purchaseId" AS "counterPartyId",
    "purchaseDetails"."itemId",
    "purchaseDetails"."itemName",
    "purchaseDetails".quantity,
    upper("purchaseDetails".unit) AS "unitName",
    purchases."invoiceDate",
    'PURCHASE'::text AS status
   FROM "purchaseDetails",
    purchases
  WHERE "purchaseDetails"."purchaseId" = purchases.id
UNION ALL
 SELECT 'MANUAL-'::text || "inventoryCorrection"."stockType" AS "counterParty",
    "inventoryCorrection".id AS "counterPartyId",
    "inventoryCorrection"."itemId",
    "inventoryCorrection"."itemName",
    "inventoryCorrection".quantity,
    "inventoryCorrection"."unitName",
    "inventoryCorrection"."stockDate" AS "invoiceDate",
    'MANUAL'::text AS status
   FROM "inventoryCorrection";

ALTER TABLE public."v_inventoryDetails"
    OWNER TO postgres;

GRANT ALL ON TABLE public."v_inventoryDetails" TO anon;
GRANT ALL ON TABLE public."v_inventoryDetails" TO authenticated;
GRANT ALL ON TABLE public."v_inventoryDetails" TO postgres;
GRANT ALL ON TABLE public."v_inventoryDetails" TO service_role;

