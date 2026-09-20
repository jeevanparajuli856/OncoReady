-- Deterministic controlled-finals seed for Railway PostgreSQL. This contains
-- illustrative data only. The same routine is called by the reset command so
-- migration seed and product reset cannot drift. It deletes only the fixed
-- finals scenario and proves no external action survives or is enqueued.
select public.reset_finals_scenario();
