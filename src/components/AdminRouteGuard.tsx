import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';

interface AdminRouteGuardProps {
    children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            // Check if user is in admins table
            const { data: admin, error } = await supabase
                .from('admins')
                .select('id, role')
                .eq('id', session.user.id)
                .single();

            if (error || !admin) {
                console.error('User is not an admin', error);
                setAuthorized(false);
            } else {
                setAuthorized(true);
            }
            setLoading(false);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setAuthorized(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
    }

    if (!authorized) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
