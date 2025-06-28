-- Function to check if a subdomain is available
-- Returns a JSON object with 'available' boolean and optional 'message' string

CREATE OR REPLACE FUNCTION public.check_subdomain_availability(subdomain_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    existing_count integer;
    cleaned_subdomain text;
BEGIN
    -- Clean and validate the subdomain input
    cleaned_subdomain := lower(trim(subdomain_input));
    
    -- Basic validation
    IF cleaned_subdomain IS NULL OR length(cleaned_subdomain) = 0 THEN
        RETURN json_build_object(
            'available', false,
            'message', 'Subdomain cannot be empty'
        );
    END IF;
    
    -- Check minimum length
    IF length(cleaned_subdomain) < 3 THEN
        RETURN json_build_object(
            'available', false,
            'message', 'Subdomain must be at least 3 characters long'
        );
    END IF;
    
    -- Check maximum length
    IF length(cleaned_subdomain) > 63 THEN
        RETURN json_build_object(
            'available', false,
            'message', 'Subdomain must be no more than 63 characters long'
        );
    END IF;
    
    -- Check for valid characters (alphanumeric and hyphens, no consecutive hyphens)
    IF NOT cleaned_subdomain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' THEN
        RETURN json_build_object(
            'available', false,
            'message', 'Subdomain can only contain letters, numbers, and hyphens (no consecutive hyphens, must start and end with alphanumeric)'
        );
    END IF;
    
    -- Check against reserved subdomains
    IF cleaned_subdomain IN ('www', 'api', 'app', 'admin', 'support', 'help', 'mail', 'email', 'ftp', 'blog', 'shop', 'store', 'dev', 'staging', 'test', 'demo', 'docs', 'status', 'cdn', 'static', 'assets', 'files', 'download', 'uploads', 'media', 'images', 'login', 'signup', 'register', 'auth', 'oauth', 'sso', 'dashboard', 'portal', 'console', 'manage', 'admin', 'root', 'system', 'internal', 'private', 'secure', 'ssl', 'vpn', 'proxy', 'gateway', 'firewall', 'security', 'backup', 'restore', 'archive', 'temp', 'tmp', 'cache', 'logs', 'monitoring', 'analytics', 'metrics', 'health', 'ping', 'heartbeat', 'webhook', 'webhooks', 'callback', 'callbacks', 'notification', 'notifications', 'alert', 'alerts', 'report', 'reports', 'invoice', 'invoices', 'billing', 'payment', 'payments', 'checkout', 'cart', 'order', 'orders', 'customer', 'customers', 'client', 'clients', 'user', 'users', 'account', 'accounts', 'profile', 'profiles', 'setting', 'settings', 'config', 'configuration', 'preference', 'preferences', 'option', 'options', 'feature', 'features', 'service', 'services', 'product', 'products', 'catalog', 'inventory', 'stock', 'warehouse', 'shipping', 'delivery', 'tracking', 'support', 'ticket', 'tickets', 'helpdesk', 'feedback', 'contact', 'about', 'terms', 'privacy', 'legal', 'policy', 'policies', 'faq', 'faqs', 'knowledge', 'knowledgebase', 'kb', 'guide', 'guides', 'tutorial', 'tutorials', 'documentation', 'manual', 'reference', 'search', 'find', 'lookup', 'directory', 'index', 'sitemap', 'robot', 'robots', 'humans', 'security', 'txt', 'well-known', 'error', 'errors', '404', '500', 'maintenance', 'offline', 'coming-soon', 'launch', 'beta', 'alpha', 'preview', 'release', 'version', 'update', 'upgrade', 'patch', 'hotfix', 'bugfix', 'feature', 'enhancement', 'improvement', 'optimization', 'performance', 'speed', 'fast', 'quick', 'instant', 'real-time', 'realtime', 'live', 'stream', 'streaming', 'broadcast', 'cast', 'show', 'event', 'events', 'calendar', 'schedule', 'appointment', 'booking', 'reservation', 'reserve', 'book', 'plan', 'planning', 'project', 'projects', 'task', 'tasks', 'todo', 'list', 'lists', 'board', 'boards', 'team', 'teams', 'group', 'groups', 'organization', 'organizations', 'company', 'companies', 'business', 'businesses', 'enterprise', 'corp', 'corporation', 'inc', 'llc', 'ltd', 'co', 'com', 'net', 'org', 'gov', 'edu', 'mil', 'int', 'local', 'localhost', 'subdomain', 'subdomains', 'domain', 'domains', 'host', 'hosts', 'server', 'servers', 'database', 'databases', 'db', 'sql', 'nosql', 'redis', 'mongo', 'mysql', 'postgres', 'postgresql', 'sqlite', 'oracle', 'mssql', 'mariadb', 'cassandra', 'elasticsearch', 'solr', 'lucene', 'apache', 'nginx', 'tomcat', 'jetty', 'iis', 'node', 'nodejs', 'express', 'fastify', 'koa', 'hapi', 'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'gatsby', 'hugo', 'jekyll', 'wordpress', 'drupal', 'joomla', 'magento', 'shopify', 'woocommerce', 'prestashop', 'opencart', 'oscommerce', 'zencart', 'bigcommerce', 'squarespace', 'wix', 'weebly', 'godaddy', 'namecheap', 'cloudflare', 'aws', 'azure', 'gcp', 'google', 'microsoft', 'amazon', 'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'pinterest', 'reddit', 'discord', 'slack', 'teams', 'zoom', 'skype', 'whatsapp', 'telegram', 'signal', 'viber', 'wechat', 'line', 'kakaotalk', 'messenger', 'imessage', 'sms', 'mms', 'email', 'gmail', 'outlook', 'yahoo', 'hotmail', 'icloud', 'protonmail', 'mailchimp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill', 'sparkpost', 'sendinblue', 'constantcontact', 'campaignmonitor', 'klaviyo', 'hubspot', 'salesforce', 'crm', 'erp', 'pos', 'inventory', 'accounting', 'finance', 'hr', 'payroll', 'recruiting', 'hiring', 'job', 'jobs', 'career', 'careers', 'work', 'employment', 'freelance', 'contractor', 'consultant', 'agency', 'studio', 'creative', 'design', 'graphics', 'ui', 'ux', 'frontend', 'backend', 'fullstack', 'developer', 'programmer', 'engineer', 'architect', 'devops', 'sysadmin', 'admin', 'moderator', 'manager', 'director', 'ceo', 'cto', 'cfo', 'cmo', 'coo', 'vp', 'president', 'founder', 'cofounder', 'partner', 'investor', 'startup', 'venture', 'capital', 'funding', 'investment', 'ipo', 'acquisition', 'merger', 'exit', 'valuation', 'revenue', 'profit', 'loss', 'expense', 'budget', 'forecast', 'projection', 'growth', 'scale', 'scaling', 'expansion', 'international', 'global', 'worldwide', 'universal', 'public', 'private', 'personal', 'individual', 'family', 'home', 'house', 'apartment', 'condo', 'office', 'building', 'facility', 'location', 'address', 'street', 'avenue', 'boulevard', 'road', 'lane', 'drive', 'way', 'place', 'court', 'circle', 'square', 'park', 'garden', 'center', 'centre', 'plaza', 'mall', 'market', 'exchange', 'trade', 'trading', 'buy', 'sell', 'sale', 'purchase', 'price', 'cost', 'fee', 'charge', 'rate', 'subscription', 'membership', 'premium', 'pro', 'plus', 'basic', 'standard', 'advanced', 'enterprise', 'business', 'personal', 'free', 'trial', 'demo', 'test', 'beta', 'alpha', 'dev', 'development', 'staging', 'production', 'live', 'online', 'offline', 'maintenance', 'downtime', 'uptime', 'availability', 'reliability', 'stability', 'performance', 'speed', 'latency', 'throughput', 'bandwidth', 'capacity', 'limit', 'quota', 'usage', 'consumption', 'resource', 'resources', 'allocation', 'distribution', 'load', 'balance', 'balancing', 'cluster', 'clustering', 'redundancy', 'backup', 'recovery', 'restore', 'sync', 'synchronization', 'replication', 'migration', 'import', 'export', 'transfer', 'move', 'copy', 'clone', 'duplicate', 'mirror', 'snapshot', 'backup', 'archive', 'compress', 'decompress', 'extract', 'package', 'bundle', 'zip', 'tar', 'gzip', 'rar', '7zip', 'install', 'uninstall', 'setup', 'configure', 'deployment', 'deploy', 'release', 'rollback', 'version', 'update', 'upgrade', 'patch', 'fix', 'bug', 'issue', 'problem', 'error', 'exception', 'failure', 'crash', 'hang', 'freeze', 'timeout', 'retry', 'queue', 'job', 'worker', 'process', 'thread', 'task', 'schedule', 'cron', 'batch', 'bulk', 'mass', 'import', 'export', 'sync', 'webhook', 'api', 'rest', 'graphql', 'soap', 'rpc', 'grpc', 'json', 'xml', 'yaml', 'csv', 'excel', 'pdf', 'doc', 'docx', 'txt', 'html', 'css', 'js', 'javascript', 'typescript', 'python', 'java', 'kotlin', 'scala', 'groovy', 'clojure', 'ruby', 'php', 'go', 'rust', 'c', 'cpp', 'csharp', 'swift', 'objective-c', 'dart', 'flutter', 'react-native', 'ionic', 'cordova', 'phonegap', 'xamarin', 'unity', 'unreal', 'godot', 'blender', 'maya', 'photoshop', 'illustrator', 'indesign', 'premiere', 'after-effects', 'final-cut', 'davinci', 'logic', 'pro-tools', 'cubase', 'ableton', 'fl-studio', 'garage-band', 'audacity', 'gimp', 'inkscape', 'figma', 'sketch', 'adobe', 'creative', 'suite', 'office', 'word', 'excel', 'powerpoint', 'access', 'outlook', 'onenote', 'teams', 'sharepoint', 'onedrive', 'google', 'drive', 'docs', 'sheets', 'slides', 'forms', 'calendar', 'gmail', 'chrome', 'firefox', 'safari', 'edge', 'opera', 'brave', 'tor', 'vpn', 'proxy', 'firewall', 'antivirus', 'malware', 'virus', 'trojan', 'ransomware', 'phishing', 'spam', 'scam', 'fraud', 'security', 'privacy', 'encryption', 'decryption', 'hash', 'salt', 'token', 'key', 'certificate', 'ssl', 'tls', 'https', 'http', 'ftp', 'sftp', 'ssh', 'telnet', 'smtp', 'pop3', 'imap', 'dns', 'dhcp', 'tcp', 'udp', 'ip', 'ipv4', 'ipv6', 'mac', 'ethernet', 'wifi', 'bluetooth', 'nfc', 'rfid', 'gps', 'location', 'geolocation', 'map', 'maps', 'navigation', 'route', 'routing', 'traffic', 'transport', 'transportation', 'logistics', 'supply', 'chain', 'warehouse', 'inventory', 'stock', 'order', 'fulfillment', 'shipping', 'delivery', 'tracking', 'courier', 'fedex', 'ups', 'dhl', 'usps', 'amazon', 'prime', 'express', 'overnight', 'rush', 'urgent', 'priority', 'standard', 'economy', 'ground', 'air', 'sea', 'rail', 'truck', 'van', 'car', 'bike', 'motorcycle', 'scooter', 'skateboard', 'segway', 'hoverboard', 'drone', 'robot', 'ai', 'artificial', 'intelligence', 'machine', 'learning', 'deep', 'neural', 'network', 'algorithm', 'model', 'training', 'inference', 'prediction', 'classification', 'regression', 'clustering', 'recommendation', 'personalization', 'automation', 'bot', 'chatbot', 'voicebot', 'assistant', 'siri', 'alexa', 'google', 'cortana', 'bixby', 'iot', 'internet', 'things', 'smart', 'home', 'connected', 'device', 'sensor', 'actuator', 'controller', 'gateway', 'hub', 'bridge', 'switch', 'router', 'modem', 'cable', 'fiber', 'broadband', 'internet', 'network', 'lan', 'wan', 'vpn', 'vlan', 'subnet', 'mask', 'gateway', 'route', 'routing', 'protocol', 'standard', 'specification', 'rfc', 'ieee', 'iso', 'ansi', 'nist', 'fips', 'common', 'criteria', 'sox', 'hipaa', 'gdpr', 'ccpa', 'pci', 'dss', 'compliance', 'audit', 'assessment', 'certification', 'accreditation', 'validation', 'verification', 'testing', 'qa', 'qc', 'quality', 'assurance', 'control', 'inspection', 'review', 'approval', 'sign-off', 'acceptance', 'delivery', 'handover', 'go-live', 'launch', 'rollout', 'deployment', 'implementation', 'integration', 'migration', 'transformation', 'modernization', 'digitization', 'digitalization', 'cloud', 'hybrid', 'multi-cloud', 'on-premise', 'on-premises', 'saas', 'paas', 'iaas', 'serverless', 'microservices', 'monolith', 'architecture', 'design', 'pattern', 'framework', 'library', 'package', 'module', 'component', 'service', 'endpoint', 'interface', 'contract', 'schema', 'specification', 'documentation', 'readme', 'changelog', 'release', 'notes', 'roadmap', 'backlog', 'epic', 'story', 'feature', 'requirement', 'specification', 'design', 'mockup', 'wireframe', 'prototype', 'mvp', 'poc', 'proof', 'concept', 'pilot', 'trial', 'experiment', 'ab', 'split', 'canary', 'blue', 'green', 'rolling', 'deployment', 'strategy', 'plan', 'timeline', 'milestone', 'deliverable', 'scope', 'objective', 'goal', 'target', 'kpi', 'metric', 'measurement', 'analytics', 'reporting', 'dashboard', 'visualization', 'chart', 'graph', 'table', 'data', 'information', 'knowledge', 'insight', 'intelligence', 'wisdom', 'decision', 'making', 'support', 'system', 'dss', 'bi', 'business', 'intelligence', 'etl', 'extract', 'transform', 'load', 'pipeline', 'workflow', 'process', 'procedure', 'standard', 'operating', 'sop', 'best', 'practice', 'guideline', 'policy', 'rule', 'regulation', 'law', 'legal', 'compliance', 'governance', 'risk', 'management', 'control', 'framework', 'coso', 'cobit', 'itil', 'iso', '27001', '9001', 'six', 'sigma', 'lean', 'agile', 'scrum', 'kanban', 'waterfall', 'methodology', 'approach', 'technique', 'method', 'tool', 'software', 'application', 'program', 'script', 'code', 'source', 'repository', 'repo', 'git', 'github', 'gitlab', 'bitbucket', 'subversion', 'svn', 'mercurial', 'bazaar', 'cvs', 'perforce', 'clearcase', 'vss', 'tfs', 'azure', 'devops', 'jenkins', 'travis', 'circle', 'bamboo', 'teamcity', 'octopus', 'ansible', 'puppet', 'chef', 'saltstack', 'terraform', 'cloudformation', 'arm', 'bicep', 'pulumi', 'vagrant', 'docker', 'kubernetes', 'openshift', 'rancher', 'nomad', 'consul', 'vault', 'packer', 'helm', 'istio', 'linkerd', 'envoy', 'nginx', 'apache', 'haproxy', 'cloudflare', 'fastly', 'akamai', 'maxcdn', 'keycdn', 'bunnycdn', 'stackpath', 'cloudfront', 'azure', 'gcp', 'alibaba', 'tencent', 'baidu', 'yandex', 'digitalocean', 'linode', 'vultr', 'hetzner', 'ovh', 'scaleway', 'upcloud', 'packet', 'equinix', 'rackspace', 'godaddy', 'namecheap', 'hover', 'gandi', 'enom', 'network', 'solutions', 'tucows', 'fabulous', 'sedo', 'afternic', 'flippa', 'empire', 'flippers', 'brandpa', 'brandbucket', 'squadhelp', 'atom', 'namer', 'naming', 'force', 'brandroot', 'brandnic', 'domainagents', 'saw', 'uniregistry', 'escrow', 'dan', 'srs', 'distributor', 'registrar', 'registry', 'icann', 'iana', 'ripe', 'arin', 'apnic', 'lacnic', 'afrinic') THEN
        RETURN json_build_object(
            'available', false,
            'message', 'This subdomain is reserved and cannot be used'
        );
    END IF;
    
    -- Check if subdomain exists in organizations table
    SELECT COUNT(*)
    INTO existing_count
    FROM organizations
    WHERE lower(subdomain) = cleaned_subdomain;
    
    IF existing_count > 0 THEN
        RETURN json_build_object(
            'available', false,
            'message', 'This subdomain is already taken'
        );
    END IF;
    
    -- If we get here, the subdomain is available
    RETURN json_build_object(
        'available', true,
        'message', 'This subdomain is available'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'available', false,
            'message', 'Error checking availability: ' || SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_subdomain_availability(text) TO authenticated;

-- Grant execute permission to anon users (for signup form)
GRANT EXECUTE ON FUNCTION public.check_subdomain_availability(text) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.check_subdomain_availability(text) IS 'Checks if a subdomain is available for use in organization creation. Returns JSON with available boolean and message string.';
