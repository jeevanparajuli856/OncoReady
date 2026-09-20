import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiProblem, ActorRole, finalsApi, RoleProjection } from '../api/client';

type ProjectionState = {
  projection: RoleProjection | null;
  loading: boolean;
  refreshing: boolean;
  error: ApiProblem | Error | null;
};

export const useProjection = (role: ActorRole | null) => {
  const [state, setState] = useState<ProjectionState>({
    projection: null,
    loading: Boolean(role),
    refreshing: false,
    error: null,
  });
  const activeRole = useRef(role);

  const load = useCallback(async (kind: 'load' | 'refresh' = 'load') => {
    if (!role) return;
    const controller = new AbortController();
    activeRole.current = role;
    setState((current) => ({
      projection: kind === 'refresh' ? current.projection : null,
      loading: kind === 'load',
      refreshing: kind === 'refresh',
      error: null,
    }));
    try {
      const projection = await finalsApi.projection(role, controller.signal);
      if (activeRole.current !== role || projection.role !== role) return;
      setState({ projection, loading: false, refreshing: false, error: null });
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      if (activeRole.current !== role) return;
      setState((current) => ({ ...current, loading: false, refreshing: false, error: error as Error }));
    }
    return () => controller.abort();
  }, [role]);

  useEffect(() => {
    activeRole.current = role;
    setState({ projection: null, loading: Boolean(role), refreshing: false, error: null });
    if (!role) return;
    const controller = new AbortController();
    finalsApi.projection(role, controller.signal)
      .then((projection) => {
        if (activeRole.current === role && projection.role === role) {
          setState({ projection, loading: false, refreshing: false, error: null });
        }
      })
      .catch((error) => {
        if ((error as Error).name !== 'AbortError' && activeRole.current === role) {
          setState({ projection: null, loading: false, refreshing: false, error: error as Error });
        }
      });
    return () => controller.abort();
  }, [role]);

  return { ...state, refresh: () => load('refresh') };
};

