-- FUNCTION: public.update_modified_column()

-- DROP FUNCTION IF EXISTS public.update_modified_column();

CREATE OR REPLACE FUNCTION public.update_modified_column()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$

BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.update_modified_column()
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.update_modified_column() TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.update_modified_column() TO anon;

GRANT EXECUTE ON FUNCTION public.update_modified_column() TO authenticated;

GRANT EXECUTE ON FUNCTION public.update_modified_column() TO postgres;

GRANT EXECUTE ON FUNCTION public.update_modified_column() TO service_role;

