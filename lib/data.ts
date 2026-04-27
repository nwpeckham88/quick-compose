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

export type ServiceTemplate = {
  id: string;
  name: string;
  image: string;
  description: string;
  customEnv?: TemplateEnv[];
  volumes: TemplateVolume[];
  ports: TemplatePort[];
  capAdd?: string[];
  devices?: string[];
  restartPolicy?: string;
};

export const serviceTemplates: ServiceTemplate[] = [
  {
    id: 'plex',
    name: 'Plex',
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
    id: 'sonarr',
    name: 'Sonarr',
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
    id: 'prowlarr',
    name: 'Prowlarr',
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
    id: 'qbittorrent',
    name: 'qBittorrent',
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
    id: 'overseerr',
    name: 'Overseerr',
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
    id: 'tautulli',
    name: 'Tautulli',
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
    id: 'swag',
    name: 'SWAG',
    image: 'lscr.io/linuxserver/swag:latest',
    description: 'Secure Web Application Gateway (Nginx proxy with Let\\\'s Encrypt).',
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
    id: 'heimdall',
    name: 'Heimdall',
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
    id: 'nextcloud',
    name: 'Nextcloud',
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
    id: 'mariadb',
    name: 'MariaDB',
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
    id: 'wireguard',
    name: 'Wireguard',
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
    devices: ['/dev/net/tun:/dev/net/tun']
  },
  {
    id: 'pihole',
    name: 'Pi-hole',
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
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    image: 'lscr.io/linuxserver/homeassistant:latest',
    description: 'Open source home automation that puts local control and privacy first.',
    volumes: [
      { id: 'config', label: 'Config', defaultHostPath: 'homeassistant/config', containerPath: '/config' },
    ],
    ports: [
      { id: 'web', label: 'Web UI', defaultHostPort: '8123', containerPort: '8123' },
    ],
  },
];
