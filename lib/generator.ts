export type GlobalVolume = { id: string, name: string };
export type GlobalNetwork = { id: string, name: string };

export type GlobalConfig = {
  puid: string;
  pgid: string;
  tz: string;
  baseConfigDir: string;
  baseMediaDir: string;
  baseDownloadsDir: string;
  volumes: GlobalVolume[];
  networks: GlobalNetwork[];
};

export type ConfiguredVolume = {
  id: string;
  hostPath: string; // The specific host path for this volume
};

export type ConfiguredPort = {
  id: string;
  hostPort: string;
};

export type ConfiguredEnv = {
  id: string;
  value: string;
};

export type ConfiguredService = {
  uuid: string;
  templateId: string;
  name: string; // overrideable name, e.g. "plex-1"
  volumes: ConfiguredVolume[];
  customVolumes: { id: string; hostPath: string; containerPath: string }[];
  ports: ConfiguredPort[];
  env: ConfiguredEnv[];
  networks: string[];
  restartPolicy?: string; // overrides the template's restartPolicy
};

export function generateDockerCompose(
  globalConfig: GlobalConfig,
  services: ConfiguredService[],
  templates: import('./data').ServiceTemplate[]
): string {
  let yaml = `---\n`;
  yaml += `services:\n`;

  for (const srv of services) {
    const template = templates.find((t) => t.id === srv.templateId);
    if (!template) continue;

    yaml += `  ${srv.name}:\n`;
    yaml += `    image: ${template.image}\n`;
    yaml += `    container_name: ${srv.name}\n`;
    
    // Environment variables
    yaml += `    environment:\n`;
    yaml += `      - PUID=${globalConfig.puid}\n`;
    yaml += `      - PGID=${globalConfig.pgid}\n`;
    yaml += `      - TZ=${globalConfig.tz}\n`;
    for (const e of srv.env) {
      if (e.value) {
        yaml += `      - ${e.id}=${e.value}\n`;
      }
    }

    // Volumes
    if (srv.volumes.length > 0 || srv.customVolumes?.length > 0) {
      yaml += `    volumes:\n`;
      for (const vol of srv.volumes) {
        const tVol = template.volumes.find((v) => v.id === vol.id);
        if (tVol) {
          yaml += `      - ${vol.hostPath}:${tVol.containerPath}\n`;
        }
      }
      if (srv.customVolumes) {
        for (const vol of srv.customVolumes) {
          if (vol.hostPath && vol.containerPath) {
            yaml += `      - ${vol.hostPath}:${vol.containerPath}\n`;
          }
        }
      }
    }

    // Networks
    if (srv.networks && srv.networks.length > 0) {
      yaml += `    networks:\n`;
      for (const netId of srv.networks) {
        const globalNet = globalConfig.networks.find(n => n.id === netId);
        if (globalNet) {
          yaml += `      - ${globalNet.name}\n`;
        }
      }
    }

    // Ports
    if (srv.ports.length > 0) {
      yaml += `    ports:\n`;
      for (const port of srv.ports) {
        const tPort = template.ports.find((p) => p.id === port.id);
        if (tPort) {
          const proto = tPort.protocol ? `/${tPort.protocol}` : '';
          yaml += `      - ${port.hostPort}:${tPort.containerPort}${proto}\n`;
        }
      }
    }

    if (template.capAdd && template.capAdd.length > 0) {
      yaml += `    cap_add:\n`;
      for (const cap of template.capAdd) {
        yaml += `      - ${cap}\n`;
      }
    }

    if (template.devices && template.devices.length > 0) {
      yaml += `    devices:\n`;
      for (const device of template.devices) {
        yaml += `      - ${device}\n`;
      }
    }

    yaml += `    restart: ${srv.restartPolicy || template.restartPolicy || 'unless-stopped'}\n\n`;
  }

  // Global networks
  if (globalConfig.networks && globalConfig.networks.length > 0) {
    yaml += `networks:\n`;
    for (const net of globalConfig.networks) {
      yaml += `  ${net.name}:\n`;
    }
    yaml += `\n`;
  }

  // Global volumes
  if (globalConfig.volumes && globalConfig.volumes.length > 0) {
    yaml += `volumes:\n`;
    for (const vol of globalConfig.volumes) {
      yaml += `  ${vol.name}:\n`;
    }
    yaml += `\n`;
  }

  // Very basic cleanup
  return yaml.trim();
}
