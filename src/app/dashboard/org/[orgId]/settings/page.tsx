"use client"

import { useEffect, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CategoryManagement } from '@/components/dashboard/category-management';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ orgId: string }>;
}

interface Organization {
  id: string;
  name: string;
  subdomain: string;
}

export default function OrganizationSettingsPage({ params }: PageProps) {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setOrgId(resolvedParams.orgId);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!orgId) return;
    
    const checkAccess = async () => {
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/auth/signin');
          return;
        }

        // Get organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (orgError || !orgData) {
          notFound();
          return;
        }

        setOrganization(orgData);

        // Check if user is owner or admin of this organization
        const { data: membership, error: membershipError } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', orgId)
          .eq('user_id', user.id)
          .single();

        if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
          toast.error('You do not have permission to access this page');
          router.push('/dashboard');
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Error checking access:', error);
        toast.error('Failed to verify access');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [orgId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess || !organization) {
    return null; // Will redirect or show error
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {organization.name} Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage settings and configurations for {organization.name}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Category Management
            </h2>
            <CategoryManagement organizationId={orgId} />
          </div>
        </div>
      </div>
    </div>
  );
}
