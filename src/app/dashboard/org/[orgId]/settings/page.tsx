import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CategoryManagement } from '@/components/CategoryManagement';

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrganizationSettingsPage({ params }: PageProps) {
  const { orgId } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // Get organization details
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (orgError || !organization) {
    notFound();
  }

  // Check if user is owner or admin of this organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    notFound();
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
