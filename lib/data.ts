export type TemplateVolume = {
  id: string;
  label: string;
  defaultHostPath: string;
  containerPath: string;
};

export type TemplatePort = {
  id: string;
  label: string;
  defaultHostPort: string;
  containerPort: string;
  protocol?: 'tcp' | 'udp' | 'tcp/udp';
};

export type TemplateEnv = {
  id: string;
  label: string;
  defaultValue: string;
  description?: string;
};

export type ServiceCategory =
  | 'Media Servers'
  | 'Media Management'
  | 'Download Clients'
  | 'Networking & Proxy'
  | 'Home & Monitoring'
  | 'Databases'
  | 'System & Utilities';

export type ServiceTemplate = {
  id: string;
  name: string;
  image: string;
  description: string;
  category: ServiceCategory;
  customEnv?: TemplateEnv[];
  volumes: TemplateVolume[];
  ports: TemplatePort[];
  capAdd?: string[];
  devices?: string[];
  restartPolicy?: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Media Servers',
  'Media Management',
  'Download Clients',
  'Networking & Proxy',
  'Home & Monitoring',
  'Databases',
  'System & Utilities',
];

export const serviceTemplates: ServiceTemplate[] = [
  // ── Media Servers ───────────────────────────────────────────────────────────
  {
    id: 'plex',
    name: 'Plex',
    category: 'Media Servers',
    image: 'lscr.io/linuxserver/plex:latest',
    description: 'Plex Media Server',
    customEnv: [
      { id: 'VERSION', label: 'Version', defaultValue: 'docker', description: 'Docker or latest' }
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'plex/config', containerPath: '/config' },
      { id: 'tv', label: 'TV Shows', defaultHostPath: 'media/tv', containerPath: '/tv' },
      { id: 'movies', label: 'Movies', defaultHostPath: 'media/movies', containerPath: '/movies' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '32400', containerPort: '32400' },
      { id: 'dlna-tcp', label: 'DLNA TCP', defaultHostPort: '32469', containerPort: '32469', protocol: 'tcp' },
      { id: 'dlna-udp', label: 'DLNA UDP', defaultHostPort: '1900', containerPort: '1900', protocol: 'udp' },
    ],
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    category: 'Media Servers',
    image: 'lscr.io/linuxserver/jellyfin:latest',
    description: 'The Free Software Media System',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'jellyfin/config', containerPath: '/config' },
      { id: 'tv', label: 'TV Shows', defaultHostPath: 'media/tv', containerPath: '/data/tvshows' },
      { id: 'movies', label: 'Movies', defaultHostPath: 'media/movies', containerPath: '/data/movies' },
    ],
    ports: [
      { id: 'web-http', label: 'Web UI HTTP', defaultHostPort: '8096', containerPort: '8096' },
      { id: 'web-https', label: 'Web UI HTTPS', defaultHostPort: '8920', containerPort: '8920' },
    ],
  },
  {
    id: 'emby',
    name: 'Emby',
    category: 'Media Servers',
    image: 'lscr.io/linuxserver/emby:latest',
    description: 'Personal Media Server',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'emby/config', containerPath: '/config' },
      { id: 'tv', label: 'TV Shows', defaultHostPath: 'media/tv', containerPath: '/data/tvshows' },
      { id: 'movies', label: 'Movies', defaultHostPath: 'media/movies', containerPath: '/data/movies' },
    ],
    ports: [
      { id: 'web-http', label: 'Web UI HTTP', defaultHostPort: '8096', containerPort: '8096' },
      { id: 'web-https', label: 'Web UI HTTPS', defaultHostPort: '8920', containerPort: '8920' },
    ],
  },
  // ── Media Management ────────────────────────────────────────────────────────
  {
    id: 'sonarr',
    name: 'Sonarr',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/sonarr:latest',
    description: 'Smart PVR for newsgroup and bittorrent users.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'sonarr/config', containerPath: '/config' },
      { id: 'tv', label: 'TV Shows', defaultHostPath: 'media/tv', containerPath: '/tv' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8989', containerPort: '8989' },
    ],
  },
  {
    id: 'radarr',
    name: 'Radarr',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/radarr:latest',
    description: 'A fork of Sonarr to work with movies.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'radarr/config', containerPath: '/config' },
      { id: 'movies', label: 'Movies', defaultHostPath: 'media/movies', containerPath: '/movies' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '7878', containerPort: '7878' },
    ],
  },
  {
    id: 'lidarr',
    name: 'Lidarr',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/lidarr:latest',
    description: 'Music collection manager for Usenet and BitTorrent users.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'lidarr/config', containerPath: '/config' },
      { id: 'music', label: 'Music', defaultHostPath: 'media/music', containerPath: '/music' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8686', containerPort: '8686' },
    ],
  },
  {
    id: 'readarr',
    name: 'Readarr',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/readarr:develop',
    description: 'Book manager and automation for Usenet and BitTorrent users.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'readarr/config', containerPath: '/config' },
      { id: 'books', label: 'Books', defaultHostPath: 'media/books', containerPath: '/books' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8787', containerPort: '8787' },
    ],
  },
  {
    id: 'bazarr',
    name: 'Bazarr',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/bazarr:latest',
    description: 'Companion app for Sonarr and Radarr that manages and downloads subtitles.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'bazarr/config', containerPath: '/config' },
      { id: 'tv', label: 'TV Shows', defaultHostPath: 'media/tv', containerPath: '/tv' },
      { id: 'movies', label: 'Movies', defaultHostPath: 'media/movies', containerPath: '/movies' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '6767', containerPort: '6767' },
    ],
  },
  {
    id: 'prowlarr',
    name: 'Prowlarr',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/prowlarr:latest',
    description: 'Indexer manager/proxy built on the popular arr .net/reactjs base stack.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'prowlarr/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '9696', containerPort: '9696' },
    ],
  },
  {
    id: 'jackett',
    name: 'Jackett',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/jackett:latest',
    description: 'API Support for your favorite torrent trackers.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'jackett/config', containerPath: '/config' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '9117', containerPort: '9117' },
    ],
  },
  {
    id: 'flaresolverr',
    name: 'FlareSolverr',
    category: 'Media Management',
    image: 'ghcr.io/flaresolverr/flaresolverr:latest',
    description: 'Proxy server to bypass Cloudflare and DDoS-GUARD protection.',
    customEnv: [
      { id: 'LOG_LEVEL', label: 'Log Level', defaultValue: 'info' },
    ],
    volumes: [],
    ports: [
      { id: 'proxy', label: 'Proxy', defaultHostPort: '8191', containerPort: '8191' },
    ],
  },
  {
    id: 'overseerr',
    name: 'Overseerr',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/overseerr:latest',
    description: 'Request management and media discovery tool for the Plex ecosystem.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'overseerr/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '5055', containerPort: '5055' },
    ],
  },
  {
    id: 'jellyseerr',
    name: 'Jellyseerr',
    category: 'Media Management',
    image: 'fallenbagel/jellyseerr:latest',
    description: 'Fork of Overseerr with support for Jellyfin and Emby.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'jellyseerr/config', containerPath: '/app/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '5055', containerPort: '5055' },
    ],
  },
  {
    id: 'tautulli',
    name: 'Tautulli',
    category: 'Media Management',
    image: 'lscr.io/linuxserver/tautulli:latest',
    description: 'A Python based monitoring and tracking tool for Plex Media Server.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'tautulli/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8181', containerPort: '8181' },
    ],
  },
  {
    id: 'unpackerr',
    name: 'Unpackerr',
    category: 'Media Management',
    image: 'golift/unpackerr:latest',
    description: 'Extracts downloads for Radarr, Sonarr, Lidarr and Readarr.',
    customEnv: [
      { id: 'UN_SONARR_0_URL', label: 'Sonarr URL', defaultValue: 'http://sonarr:8989' },
      { id: 'UN_RADARR_0_URL', label: 'Radarr URL', defaultValue: 'http://radarr:7878' },
    ],
    volumes: [
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [],
  },
  // ── Download Clients ────────────────────────────────────────────────────────
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    category: 'Download Clients',
    image: 'lscr.io/linuxserver/qbittorrent:latest',
    description: 'A bittorrent client programmed in C++ / Qt.',
    customEnv: [
      { id: 'WEBUI_PORT', label: 'WebUI Port (Env)', defaultValue: '8080' },
      { id: 'TORRENTING_PORT', label: 'Torrenting Port (Env)', defaultValue: '6881' }
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'qbittorrent/config', containerPath: '/config' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8080', containerPort: '8080' },
      { id: 'bt-tcp', label: 'BitTorrent TCP', defaultHostPort: '6881', containerPort: '6881', protocol: 'tcp' },
      { id: 'bt-udp', label: 'BitTorrent UDP', defaultHostPort: '6881', containerPort: '6881', protocol: 'udp' },
    ],
  },
  {
    id: 'transmission',
    name: 'Transmission',
    category: 'Download Clients',
    image: 'lscr.io/linuxserver/transmission:latest',
    description: 'A fast, easy and free bittorrent client.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'transmission/config', containerPath: '/config' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
      { id: 'watch', label: 'Watch', defaultHostPath: 'transmission/watch', containerPath: '/watch' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '9091', containerPort: '9091' },
      { id: 'bt-tcp', label: 'BitTorrent TCP', defaultHostPort: '51413', containerPort: '51413', protocol: 'tcp' },
      { id: 'bt-udp', label: 'BitTorrent UDP', defaultHostPort: '51413', containerPort: '51413', protocol: 'udp' },
    ],
  },
  {
    id: 'nzbget',
    name: 'NZBGet',
    category: 'Download Clients',
    image: 'lscr.io/linuxserver/nzbget:latest',
    description: 'Efficient Usenet downloader.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'nzbget/config', containerPath: '/config' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '6789', containerPort: '6789' },
    ],
  },
  {
    id: 'sabnzbd',
    name: 'SABnzbd',
    category: 'Download Clients',
    image: 'lscr.io/linuxserver/sabnzbd:latest',
    description: 'Free and easy binary newsreader.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'sabnzbd/config', containerPath: '/config' },
      { id: 'downloads', label: 'Downloads', defaultHostPath: 'downloads', containerPath: '/downloads' },
      { id: 'incomplete', label: 'Incomplete', defaultHostPath: 'sabnzbd/incomplete', containerPath: '/incomplete-downloads' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8080', containerPort: '8080' },
    ],
  },
  // ── Networking & Proxy ──────────────────────────────────────────────────────
  {
    id: 'swag',
    name: 'SWAG',
    category: 'Networking & Proxy',
    image: 'lscr.io/linuxserver/swag:latest',
    description: 'Secure Web Application Gateway (Nginx proxy with Let\'s Encrypt).',
    customEnv: [
      { id: 'URL', label: 'Domain URL', defaultValue: 'yourdomain.com' },
      { id: 'VALIDATION', label: 'Validation Method', defaultValue: 'http' },
      { id: 'SUBDOMAINS', label: 'Subdomains', defaultValue: 'wildcard' }
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'swag/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'http', label: 'HTTP', defaultHostPort: '80', containerPort: '80' },
      { id: 'https', label: 'HTTPS', defaultHostPort: '443', containerPort: '443' },
    ],
    capAdd: ['NET_ADMIN'],
  },
  {
    id: 'nginx-proxy-manager',
    name: 'Nginx Proxy Manager',
    category: 'Networking & Proxy',
    image: 'jc21/nginx-proxy-manager:latest',
    description: 'Expose your services with free SSL, powered by Let\'s Encrypt.',
    volumes: [
      { id: 'data', label: 'Data', defaultHostPath: 'nginx-proxy-manager/data', containerPath: '/data' },
      { id: 'letsencrypt', label: 'Let\'s Encrypt', defaultHostPath: 'nginx-proxy-manager/letsencrypt', containerPath: '/etc/letsencrypt' },
    ],
    ports: [
      { id: 'http', label: 'HTTP', defaultHostPort: '80', containerPort: '80' },
      { id: 'https', label: 'HTTPS', defaultHostPort: '443', containerPort: '443' },
      { id: 'admin', label: 'Admin UI', defaultHostPort: '81', containerPort: '81' },
    ],
  },
  {
    id: 'traefik',
    name: 'Traefik',
    category: 'Networking & Proxy',
    image: 'traefik:latest',
    description: 'The Cloud Native Application Proxy.',
    customEnv: [
      { id: 'TRAEFIK_API_INSECURE', label: 'Insecure API', defaultValue: 'true', description: 'Expose dashboard without auth (dev only)' },
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'traefik/config', containerPath: '/etc/traefik' },
      { id: 'docker-sock', label: 'Docker Socket', defaultHostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock' },
    ],
    ports: [
      { id: 'http', label: 'HTTP', defaultHostPort: '80', containerPort: '80' },
      { id: 'https', label: 'HTTPS', defaultHostPort: '443', containerPort: '443' },
      { id: 'dashboard', label: 'Dashboard', defaultHostPort: '8080', containerPort: '8080' },
    ],
  },
  {
    id: 'wireguard',
    name: 'WireGuard',
    category: 'Networking & Proxy',
    image: 'lscr.io/linuxserver/wireguard:latest',
    description: 'A modern, fast, and secure VPN.',
    customEnv: [
      { id: 'SERVERURL', label: 'Server URL', defaultValue: 'wireguard.domain.com' },
      { id: 'SERVERPORT', label: 'Server Port', defaultValue: '51820' },
      { id: 'PEERS', label: 'Peers', defaultValue: '1' },
      { id: 'PEERDNS', label: 'Peer DNS', defaultValue: 'auto' },
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'wireguard/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'udp', label: 'WG Port', defaultHostPort: '51820', containerPort: '51820', protocol: 'udp' },
    ],
    capAdd: ['NET_ADMIN', 'SYS_MODULE'],
    devices: ['/dev/net/tun:/dev/net/tun'],
  },
  {
    id: 'pihole',
    name: 'Pi-hole',
    category: 'Networking & Proxy',
    image: 'lscr.io/linuxserver/pihole:latest',
    description: 'Network-wide ad blocking via your own Linux hardware.',
    customEnv: [
      { id: 'WEBPASSWORD', label: 'Web Password', defaultValue: 'admin' },
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'pihole/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'dns-tcp', label: 'DNS TCP', defaultHostPort: '53', containerPort: '53', protocol: 'tcp' },
      { id: 'dns-udp', label: 'DNS UDP', defaultHostPort: '53', containerPort: '53', protocol: 'udp' },
      { id: 'web', label: 'Web UI', defaultHostPort: '8080', containerPort: '80' },
    ],
  },
  // ── Home & Monitoring ───────────────────────────────────────────────────────
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    category: 'Home & Monitoring',
    image: 'lscr.io/linuxserver/homeassistant:latest',
    description: 'Open source home automation that puts local control and privacy first.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'homeassistant/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8123', containerPort: '8123' },
    ],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'Home & Monitoring',
    image: 'lscr.io/linuxserver/grafana:latest',
    description: 'Open source analytics and monitoring solution.',
    customEnv: [
      { id: 'GF_SECURITY_ADMIN_PASSWORD', label: 'Admin Password', defaultValue: 'admin' },
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'grafana/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '3000', containerPort: '3000' },
    ],
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'Home & Monitoring',
    image: 'prom/prometheus:latest',
    description: 'Open-source monitoring solution with time series database.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'prometheus/config', containerPath: '/etc/prometheus' },
      { id: 'data', label: 'Data', defaultHostPath: 'prometheus/data', containerPath: '/prometheus' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '9090', containerPort: '9090' },
    ],
  },
  {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    category: 'Home & Monitoring',
    image: 'louislam/uptime-kuma:latest',
    description: 'A fancy self-hosted monitoring tool.',
    volumes: [
      { id: 'data', label: 'Data', defaultHostPath: 'uptime-kuma/data', containerPath: '/app/data' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '3001', containerPort: '3001' },
    ],
  },
  // ── Databases ───────────────────────────────────────────────────────────────
  {
    id: 'mariadb',
    name: 'MariaDB',
    category: 'Databases',
    image: 'lscr.io/linuxserver/mariadb:latest',
    description: 'One of the most popular database servers in the world.',
    customEnv: [
      { id: 'MYSQL_ROOT_PASSWORD', label: 'Root Password', defaultValue: 'root' },
      { id: 'MYSQL_DATABASE', label: 'Default Database', defaultValue: 'customdb' },
      { id: 'MYSQL_USER', label: 'Custom User', defaultValue: 'customuser' },
      { id: 'MYSQL_PASSWORD', label: 'Custom User Password', defaultValue: 'custompassword' },
    ],
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'mariadb/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'db', label: 'Database Port', defaultHostPort: '3306', containerPort: '3306' },
    ],
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Databases',
    image: 'postgres:16',
    description: 'The world\'s most advanced open source relational database.',
    customEnv: [
      { id: 'POSTGRES_PASSWORD', label: 'Postgres Password', defaultValue: 'postgres' },
      { id: 'POSTGRES_USER', label: 'Postgres User', defaultValue: 'postgres' },
      { id: 'POSTGRES_DB', label: 'Default Database', defaultValue: 'postgres' },
    ],
    volumes: [
      { id: 'data', label: 'Data', defaultHostPath: 'postgres/data', containerPath: '/var/lib/postgresql/data' },
    ],
    ports: [
      { id: 'db', label: 'Database Port', defaultHostPort: '5432', containerPort: '5432' },
    ],
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'Databases',
    image: 'redis:7-alpine',
    description: 'In-memory data structure store used as a cache and message broker.',
    volumes: [
      { id: 'data', label: 'Data', defaultHostPath: 'redis/data', containerPath: '/data' },
    ],
    ports: [
      { id: 'db', label: 'Redis Port', defaultHostPort: '6379', containerPort: '6379' },
    ],
  },
  // ── System & Utilities ──────────────────────────────────────────────────────
  {
    id: 'portainer',
    name: 'Portainer',
    category: 'System & Utilities',
    image: 'portainer/portainer-ce:latest',
    description: 'Universal container management platform.',
    volumes: [
      { id: 'data', label: 'Data', defaultHostPath: 'portainer/data', containerPath: '/data' },
      { id: 'docker-sock', label: 'Docker Socket', defaultHostPath: '/var/run/docker.sock', containerPath: '/var/run/docker.sock' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '9000', containerPort: '9000' },
      { id: 'edge', label: 'Edge Agent', defaultHostPort: '8000', containerPort: '8000' },
    ],
  },
  {
    id: 'heimdall',
    name: 'Heimdall',
    category: 'System & Utilities',
    image: 'lscr.io/linuxserver/heimdall:latest',
    description: 'An elegant solution to organise all your web applications.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'heimdall/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8080', containerPort: '80' },
      { id: 'web-https', label: 'Web UI HTTPS', defaultHostPort: '8443', containerPort: '443' },
    ],
  },
  {
    id: 'homarr',
    name: 'Homarr',
    category: 'System & Utilities',
    image: 'ghcr.io/ajnart/homarr:latest',
    description: 'A sleek, modern dashboard that integrates with your home server apps.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'homarr/config', containerPath: '/app/data/configs' },
      { id: 'icons', label: 'Icons', defaultHostPath: 'homarr/icons', containerPath: '/app/public/icons' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '7575', containerPort: '7575' },
    ],
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud',
    category: 'System & Utilities',
    image: 'lscr.io/linuxserver/nextcloud:latest',
    description: 'A safe home for all your data.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'nextcloud/config', containerPath: '/config' },
      { id: 'data', label: 'Data', defaultHostPath: 'nextcloud/data', containerPath: '/data' },
    ],
    ports: [
      { id: 'web-https', label: 'Web UI HTTPS', defaultHostPort: '443', containerPort: '443' },
    ],
  },
  {
    id: 'vaultwarden',
    name: 'Vaultwarden',
    category: 'System & Utilities',
    image: 'vaultwarden/server:latest',
    description: 'Unofficial Bitwarden compatible server written in Rust.',
    customEnv: [
      { id: 'ADMIN_TOKEN', label: 'Admin Token', defaultValue: '', description: 'Set to secure random string for admin panel access' },
      { id: 'WEBSOCKET_ENABLED', label: 'WebSocket Enabled', defaultValue: 'true' },
    ],
    volumes: [
      { id: 'data', label: 'Data', defaultHostPath: 'vaultwarden/data', containerPath: '/data' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8080', containerPort: '80' },
      { id: 'websocket', label: 'WebSocket', defaultHostPort: '3012', containerPort: '3012' },
    ],
  },
  {
    id: 'gitea',
    name: 'Gitea',
    category: 'System & Utilities',
    image: 'gitea/gitea:latest',
    description: 'A painless self-hosted Git service.',
    customEnv: [
      { id: 'GITEA__database__DB_TYPE', label: 'DB Type', defaultValue: 'sqlite3' },
    ],
    volumes: [
      { id: 'data', label: 'Data', defaultHostPath: 'gitea/data', containerPath: '/data' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '3000', containerPort: '3000' },
      { id: 'ssh', label: 'SSH', defaultHostPort: '2222', containerPort: '22' },
    ],
  },
];
