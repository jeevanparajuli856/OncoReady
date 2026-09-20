-- Deterministic controlled-finals seed. This contains illustrative data only.
-- The same routine is called by the reset command so local reset and the
-- product reset path cannot drift. It deletes only the one fixed finals
-- scenario and proves that no external action survives or is enqueued.
select public.reset_finals_scenario();
