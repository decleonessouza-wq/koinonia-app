import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSession } from "../hooks/useSession";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      setCheckingRole(true);
      setError(null);

      if (!session?.user) {
        setIsAllowed(false);
        setCheckingRole(false);
        return;
      }

      // Usa sua função SQL (public.is_treasury_admin())
      const { data, error } = await supabase.rpc("is_treasury_admin");

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setIsAllowed(false);
      } else {
        setIsAllowed(Boolean(data));
      }

      setCheckingRole(false);
    }

    if (!loading) check();

    return () => {
      mounted = false;
    };
  }, [session, loading]);

  if (loading || checkingRole) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        Carregando...
      </div>
    );
  }

  if (!session?.user) return <Navigate to="/login" replace />;

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", color: "crimson" }}>
        Erro ao verificar permissão: {error}
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2>Acesso negado</h2>
        <p>Você precisa ser Tesoureiro/Pastor para acessar a Tesouraria.</p>
      </div>
    );
  }

  return children;
}
