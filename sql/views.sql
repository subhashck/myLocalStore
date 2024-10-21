WITH
	INVENTORY AS (
		SELECT
			S."itemName",
			CASE
				WHEN UPPER(S.UNIT) = 'PCS'::TEXT THEN S.QUANTITY * '-1'::INTEGER
				ELSE (
					(
						SELECT
							U.FACTOR * '-1'::INTEGER
						FROM
							"itemUnits" U
						WHERE
							U."itemId" = S."itemId"
							AND UPPER(S.UNIT) = UPPER(U."unitName")
						LIMIT
							1
					)
				) * S.QUANTITY
			END AS QUANTITY
		FROM
			"saleDetails" S
		UNION ALL
		SELECT
			S."itemName",
			CASE
				WHEN UPPER(S.UNIT) = 'PCS'::TEXT THEN S.QUANTITY::INTEGER
				ELSE (
					(
						SELECT
							U.FACTOR::INTEGER
						FROM
							"itemUnits" U
						WHERE
							U."itemId" = S."itemId"
							AND UPPER(S.UNIT) = UPPER(U."unitName")
						LIMIT
							1
					)
				) * S.QUANTITY
			END AS QUANTITY
		FROM
			"purchaseDetails" S
	)
SELECT
	"itemName",
	SUM(QUANTITY) QUANTITY
FROM
	INVENTORY
GROUP BY
	"itemName"