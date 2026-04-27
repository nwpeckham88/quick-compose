"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Trash, Server, Copy, Check, Download, Network, HardDrive, CopyPlus, RotateCcw, Search } from 'lucide-react';
import { GlobalConfig, ConfiguredService, generateDockerCompose, GlobalNetwork, GlobalVolume, resolveRestartPolicy } from '@/lib/generator';
import { serviceTemplates, SERVICE_CATEGORIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const RESTART_POLICIES = ['unless-stopped', 'always', 'on-failure', 'no'] as const;
const STORAGE_KEY = 'quick-compose-state';

export function ComposeBuilder() {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({
    puid: '1000',
    pgid: '1000',
    tz: 'Europe/London',
    baseConfigDir: '/opt/appdata',
    baseMediaDir: '/mnt/media',
    baseDownloadsDir: '/mnt/downloads',
    volumes: [],
    networks: [],
  });

  const [services, setServices] = useState<ConfiguredService[]>([]);
  const [copied, setCopied] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('');

  // Load persisted state from localStorage on mount
  useEffect(() => {
    let restoredFromStorage = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { globalConfig: savedGlobal, services: savedServices } = JSON.parse(saved);
        if (savedGlobal) setGlobalConfig(savedGlobal);
        if (savedServices) setServices(savedServices);
        restoredFromStorage = true;
      }
    } catch {
      // ignore parse errors
    }

    // Auto-detect timezone only when there is no saved state
    if (!restoredFromStorage) {
      try {
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTz) {
          setGlobalConfig(prev => ({ ...prev, tz: browserTz }));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ globalConfig, services }));
    } catch {
      // ignore quota / privacy errors
    }
  }, [globalConfig, services]);

  const resetState = useCallback(() => {
    if (!confirm('Reset all services and settings? This cannot be undone.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setServices([]);
    setGlobalConfig({
      puid: '1000',
      pgid: '1000',
      tz: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London'; } catch { return 'Europe/London'; } })(),
      baseConfigDir: '/opt/appdata',
      baseMediaDir: '/mnt/media',
      baseDownloadsDir: '/mnt/downloads',
      volumes: [],
      networks: [],
    });
  }, []);

  const handleGlobalConfigChange = (field: keyof GlobalConfig, value: string) => {
    setGlobalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const generateUuid = () => crypto.randomUUID();

  // Helper to replace base directories in volume paths
  const inferDefaultHostPath = (defaultHostPath: string) => {
    // Already an absolute path (e.g. /var/run/docker.sock) — use as-is
    if (defaultHostPath.startsWith('/')) {
      return defaultHostPath;
    }
    if (defaultHostPath.startsWith('media/')) {
      return `${globalConfig.baseMediaDir}/${defaultHostPath.replace('media/', '')}`;
    }
    if (defaultHostPath.startsWith('downloads')) {
      return globalConfig.baseDownloadsDir;
    }
    // Assume it's a config path using baseConfigDir
    return `${globalConfig.baseConfigDir}/${defaultHostPath}`;
  };

  const addService = (templateId: string) => {
    const template = serviceTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const newService: ConfiguredService = {
      uuid: generateUuid(),
      templateId: template.id,
      name: template.id,
      volumes: template.volumes.map((v) => ({
        id: v.id,
        hostPath: inferDefaultHostPath(v.defaultHostPath)
      })),
      customVolumes: [],
      ports: template.ports.map((p) => ({
        id: p.id,
        hostPort: p.defaultHostPort
      })),
      env: template.customEnv ? template.customEnv.map((e) => ({
        id: e.id,
        value: e.defaultValue
      })) : [],
      networks: []
    };

    setServices([...services, newService]);
  };

  const duplicateService = (uuid: string) => {
    const srv = services.find(s => s.uuid === uuid);
    if (!srv) return;
    const shortId = crypto.randomUUID().slice(0, 4);
    const clone: ConfiguredService = {
      ...JSON.parse(JSON.stringify(srv)),
      uuid: crypto.randomUUID(),
      name: `${srv.name}-${shortId}`,
    };
    setServices([...services, clone]);
  };

  const removeService = (uuid: string) => {
    setServices(services.filter((s) => s.uuid !== uuid));
  };

  const updateServiceField = (uuid: string, field: 'name', value: string) => {
    setServices(services.map(s => s.uuid === uuid ? { ...s, [field]: value } : s));
  };

  const updateServiceRestartPolicy = (uuid: string, value: string) => {
    const srv = services.find(s => s.uuid === uuid);
    const template = srv ? serviceTemplates.find(t => t.id === srv.templateId) : undefined;
    // Store undefined when the chosen value matches the template default to avoid redundant data
    const effective = value === (template?.restartPolicy || 'unless-stopped') ? undefined : value;
    setServices(services.map(s => s.uuid === uuid ? { ...s, restartPolicy: effective } : s));
  };

  const updateServiceVolume = (serviceUuid: string, volumeId: string, value: string) => {
    setServices(services.map(s => {
      if (s.uuid !== serviceUuid) return s;
      return {
        ...s,
        volumes: s.volumes.map(v => v.id === volumeId ? { ...v, hostPath: value } : v)
      };
    }));
  };

  const updateServicePort = (serviceUuid: string, portId: string, value: string) => {
    setServices(services.map(s => {
      if (s.uuid !== serviceUuid) return s;
      return {
        ...s,
        ports: s.ports.map(p => p.id === portId ? { ...p, hostPort: value } : p)
      };
    }));
  };

  const updateServiceEnv = (serviceUuid: string, envId: string, value: string) => {
    setServices(services.map(s => {
      if (s.uuid !== serviceUuid) return s;
      return {
        ...s,
        env: s.env.map(e => e.id === envId ? { ...e, value } : e)
      };
    }));
  };

  const addGlobalVolume = () => {
    const id = generateUuid();
    setGlobalConfig(prev => ({ ...prev, volumes: [...prev.volumes, { id, name: `volume_${id}` }] }));
  };

  const removeGlobalVolume = (id: string) => {
    setGlobalConfig(prev => ({ ...prev, volumes: prev.volumes.filter(v => v.id !== id) }));
  };

  const updateGlobalVolume = (id: string, name: string) => {
    setGlobalConfig(prev => ({ ...prev, volumes: prev.volumes.map(v => v.id === id ? { ...v, name } : v) }));
  };

  const addGlobalNetwork = () => {
    const id = generateUuid();
    setGlobalConfig(prev => ({ ...prev, networks: [...prev.networks, { id, name: `network_${id}` }] }));
  };

  const removeGlobalNetwork = (id: string) => {
    setGlobalConfig(prev => ({ ...prev, networks: prev.networks.filter(n => n.id !== id) }));
    setServices(services.map(s => ({ ...s, networks: s.networks.filter(nId => nId !== id) })));
  };

  const updateGlobalNetwork = (id: string, name: string) => {
    setGlobalConfig(prev => ({ ...prev, networks: prev.networks.map(n => n.id === id ? { ...n, name } : n) }));
  };

  const toggleServiceNetwork = (serviceUuid: string, networkId: string) => {
    setServices(services.map(s => {
      if (s.uuid !== serviceUuid) return s;
      const networks = s.networks.includes(networkId) 
        ? s.networks.filter(id => id !== networkId)
        : [...s.networks, networkId];
      return { ...s, networks };
    }));
  };

  const addServiceCustomVolume = (serviceUuid: string) => {
    setServices(services.map(s => {
      if (s.uuid !== serviceUuid) return s;
      return {
        ...s,
        customVolumes: [...(s.customVolumes || []), { id: generateUuid(), hostPath: '', containerPath: '' }]
      };
    }));
  };

  const removeServiceCustomVolume = (serviceUuid: string, volumeId: string) => {
    setServices(services.map(s => {
      if (s.uuid !== serviceUuid) return s;
      return {
        ...s,
        customVolumes: (s.customVolumes || []).filter(v => v.id !== volumeId)
      };
    }));
  };

  const updateServiceCustomVolume = (serviceUuid: string, volumeId: string, field: 'hostPath' | 'containerPath', value: string) => {
    setServices(services.map(s => {
      if (s.uuid !== serviceUuid) return s;
      return {
        ...s,
        customVolumes: (s.customVolumes || []).map(v => v.id === volumeId ? { ...v, [field]: value } : v)
      };
    }));
  };

  const composeFileString = useMemo(() => {
    return generateDockerCompose(globalConfig, services, serviceTemplates);
  }, [globalConfig, services]);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return [
        'Europe/London', 'Europe/Berlin', 'Europe/Paris',
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Australia/Sydney', 'Asia/Tokyo',
      ];
    }
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!serviceFilter.trim()) return serviceTemplates;
    const q = serviceFilter.toLowerCase();
    return serviceTemplates.filter(
      t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [serviceFilter]);

  const templatesByCategory = useMemo(() => {
    const map: Record<string, typeof filteredTemplates> = {};
    for (const cat of SERVICE_CATEGORIES) {
      const list = filteredTemplates.filter(t => t.category === cat);
      if (list.length > 0) map[cat] = list;
    }
    return map;
  }, [filteredTemplates]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(composeFileString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadComposeFile = () => {
    const blob = new Blob([composeFileString], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Left Panel: Configuration */}
      <div className="w-full lg:w-1/2 flex flex-col h-[50vh] lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px]">L</div>
                Compose.io
              </h1>
              <p className="text-sm text-slate-500">
                Build your Docker Compose stack with linuxserver.io images effortlessly.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetState} className="h-7 px-2 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0" title="Reset all settings and services">
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <Tabs defaultValue="services" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4 shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">My Services ({services.length})</TabsTrigger>
              <TabsTrigger value="global">Global Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="services" className="flex-1 overflow-hidden m-0 flex flex-col p-6 pt-4">
            
            <div className="mb-4 space-y-2">
              <Label>Add a Service</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <Input
                  className="h-8 pl-7 text-xs shadow-none border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500"
                  placeholder="Search services..."
                  value={serviceFilter}
                  onChange={e => setServiceFilter(e.target.value)}
                />
              </div>
              <Select onValueChange={(val) => { if (val) { addService(val); setServiceFilter(''); } }} value="">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a service container..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templatesByCategory).map(([category, templates]) => (
                    <SelectGroup key={category}>
                      <SelectLabel>{category}</SelectLabel>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  {Object.keys(templatesByCategory).length === 0 && (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">No services match your search.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator className="mb-4" />

            <ScrollArea className="flex-1 pr-4 -mr-4">
              {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                  <Server className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
                  <p className="text-sm">No services added yet.</p>
                  <p className="text-xs opacity-75">Select a service above to get started.</p>
                </div>
              ) : (
                <Accordion className="w-full space-y-4">
                  {services.map((srv) => {
                    const template = serviceTemplates.find(t => t.id === srv.templateId)!;
                    return (
                      <AccordionItem value={srv.uuid} key={srv.uuid} className="bg-white border border-slate-200 rounded-md overflow-hidden px-1">
                        <div className="flex justify-between items-center px-4 py-3">
                          <AccordionTrigger className="hover:no-underline py-0 border-none flex-1 font-semibold flex items-center gap-2 text-sm text-slate-700">
                            <span>{srv.name}</span>
                            <Badge variant="secondary" className="font-mono text-[10px] font-normal ml-2 bg-slate-100 text-slate-500 border-none">{template.image}</Badge>
                          </AccordionTrigger>
                          <div className="flex items-center shrink-0">
                            <Button variant="ghost" size="icon" title="Duplicate service" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-slate-50" onClick={() => duplicateService(srv.uuid)}>
                              <CopyPlus className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Remove service" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-slate-50" onClick={() => removeService(srv.uuid)}>
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent className="px-4 pb-4 border-t border-slate-100 mt-2 pt-4">
                          <div className="space-y-6">
                            
                            <div className="space-y-4">
                              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Parameters</Label>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="space-y-1.5">
                                  <Label className="text-[11px] font-medium text-slate-700 block">Container Name</Label>
                                  <Input 
                                    className="h-8 w-full border border-slate-200 rounded px-2 py-1.5 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-blue-500" 
                                    value={srv.name} 
                                    onChange={(e) => updateServiceField(srv.uuid, 'name', e.target.value)} 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[11px] font-medium text-slate-700 block">Restart Policy</Label>
                                  <Select value={resolveRestartPolicy(srv, template)} onValueChange={val => updateServiceRestartPolicy(srv.uuid, val)}>
                                    <SelectTrigger className="h-8 text-xs shadow-none border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {RESTART_POLICIES.map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {template.volumes.length > 0 && (
                              <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Volumes</Label>
                                <div className="grid gap-2">
                                  {template.volumes.map(vol => {
                                    const configuredVol = srv.volumes.find(v => v.id === vol.id);
                                    return (
                                      <div key={vol.id} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                          <Input 
                                            className="h-8 w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-mono shadow-none focus-visible:ring-1 focus-visible:ring-blue-500" 
                                            placeholder={`${vol.label} Host Path`}
                                            title={`${vol.label} Host Path`}
                                            value={configuredVol?.hostPath || ''} 
                                            onChange={(e) => updateServiceVolume(srv.uuid, vol.id, e.target.value)}
                                          />
                                        </div>
                                        <div className="text-slate-300 py-1.5">:</div>
                                        <div className="flex-1">
                                          <Input 
                                            className="h-8 w-full border border-slate-200 bg-slate-50 rounded px-2 py-1.5 text-xs font-mono text-slate-500 shadow-none" 
                                            value={vol.containerPath} 
                                            title="Container Path"
                                            readOnly 
                                          />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {template.ports.length > 0 && (
                              <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ports</Label>
                                <div className="grid gap-2">
                                  {template.ports.map(port => {
                                    const configuredPort = srv.ports.find(p => p.id === port.id);
                                    return (
                                      <div key={port.id} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                          <Input 
                                            className="h-8 w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-mono shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                            placeholder={`${port.label} Host`} 
                                            title={`${port.label} Host`} 
                                            value={configuredPort?.hostPort || ''} 
                                            onChange={(e) => updateServicePort(srv.uuid, port.id, e.target.value)}
                                          />
                                        </div>
                                        <div className="text-slate-300 py-1.5">:</div>
                                        <div className="flex-1">
                                          <Input 
                                            className="h-8 w-full border border-slate-200 bg-slate-50 rounded px-2 py-1.5 text-xs font-mono text-slate-500 shadow-none" 
                                            value={port.containerPort} 
                                            title={`Container${port.protocol ? ` (${port.protocol})` : ''}`}
                                            readOnly 
                                          />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {template.customEnv && template.customEnv.length > 0 && (
                              <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Environment Variables</Label>
                                <div className="grid gap-2 grid-cols-2">
                                  {template.customEnv.map(env => {
                                    const configuredEnv = srv.env.find(e => e.id === env.id);
                                    return (
                                      <div key={env.id} className="flex gap-2 items-center">
                                        <Input 
                                            className="h-8 w-1/3 border border-slate-200 bg-slate-50 rounded px-2 py-1.5 text-[11px] font-mono text-slate-500 shadow-none" 
                                            value={env.id} 
                                            title={env.label}
                                            readOnly 
                                        />
                                        <Input 
                                          className="h-8 flex-1 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono shadow-none focus-visible:ring-1 focus-visible:ring-blue-500" 
                                          value={configuredEnv?.value || ''} 
                                          onChange={(e) => updateServiceEnv(srv.uuid, env.id, e.target.value)}
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {globalConfig.networks.length > 0 && (
                              <div className="space-y-4 pt-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Networks</Label>
                                <div className="flex flex-wrap gap-2">
                                  {globalConfig.networks.map(net => {
                                    const isActive = srv.networks.includes(net.id);
                                    return (
                                      <Button
                                        key={net.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleServiceNetwork(srv.uuid, net.id)}
                                        className={`h-7 px-3 text-xs rounded-full border shadow-none ${isActive ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                      >
                                        {net.name}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="space-y-4 pt-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Volumes</Label>
                                <Button variant="ghost" size="sm" onClick={() => addServiceCustomVolume(srv.uuid)} className="h-6 text-[10px] px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Add Volume
                                </Button>
                              </div>
                              {srv.customVolumes && srv.customVolumes.length > 0 ? (
                                <div className="grid gap-2">
                                  {srv.customVolumes.map(vol => (
                                    <div key={vol.id} className="flex gap-2 items-center">
                                      <div className="flex-1">
                                        <Input 
                                          className="h-8 w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-mono shadow-none focus-visible:ring-1 focus-visible:ring-blue-500" 
                                          placeholder="Host path or named volume"
                                          value={vol.hostPath} 
                                          onChange={(e) => updateServiceCustomVolume(srv.uuid, vol.id, 'hostPath', e.target.value)}
                                        />
                                      </div>
                                      <div className="text-slate-300 py-1.5">:</div>
                                      <div className="flex-1">
                                        <Input 
                                          className="h-8 w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-mono shadow-none focus-visible:ring-1 focus-visible:ring-blue-500" 
                                          placeholder="Container path"
                                          value={vol.containerPath} 
                                          onChange={(e) => updateServiceCustomVolume(srv.uuid, vol.id, 'containerPath', e.target.value)}
                                        />
                                      </div>
                                      <Button variant="ghost" size="icon" onClick={() => removeServiceCustomVolume(srv.uuid, vol.id)} className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600 hover:bg-slate-50">
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No custom volumes added.</p>
                              )}
                            </div>

                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="global" className="flex-1 overflow-hidden m-0 p-6 pt-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6 max-w-sm">
                <div className="space-y-1">
                  <Label>PUID (User ID)</Label>
                  <Input value={globalConfig.puid} onChange={e => handleGlobalConfigChange('puid', e.target.value)} className="font-mono text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200" />
                  <p className="text-xs text-slate-500">ID of the user running the containers. Typically 1000.</p>
                </div>
                <div className="space-y-1">
                  <Label>PGID (Group ID)</Label>
                  <Input value={globalConfig.pgid} onChange={e => handleGlobalConfigChange('pgid', e.target.value)} className="font-mono text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200" />
                  <p className="text-xs text-slate-500">ID of the group. Typically 1000.</p>
                </div>
                <div className="space-y-1">
                  <Label>Timezone (TZ)</Label>
                  <Select value={globalConfig.tz} onValueChange={val => handleGlobalConfigChange('tz', val || '')}>
                    <SelectTrigger className="shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">e.g., Europe/London, America/New_York</p>
                </div>
                
                <Separator className="bg-slate-100" />

                <div className="space-y-1">
                  <Label>Base Config Directory</Label>
                  <Input value={globalConfig.baseConfigDir} onChange={e => handleGlobalConfigChange('baseConfigDir', e.target.value)} className="font-mono text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200" />
                  <p className="text-xs text-slate-500">Prefix used for /config volumes when adding new services.</p>
                </div>
                <div className="space-y-1">
                  <Label>Base Media Directory</Label>
                  <Input value={globalConfig.baseMediaDir} onChange={e => handleGlobalConfigChange('baseMediaDir', e.target.value)} className="font-mono text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200" />
                  <p className="text-xs text-slate-500">Prefix used for media library volumes.</p>
                </div>
                <div className="space-y-1">
                  <Label>Base Downloads Directory</Label>
                  <Input value={globalConfig.baseDownloadsDir} onChange={e => handleGlobalConfigChange('baseDownloadsDir', e.target.value)} className="font-mono text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200" />
                  <p className="text-xs text-slate-500">Prefix used for download client volumes.</p>
                </div>

                <Separator className="bg-slate-100" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                    <Label className="font-bold uppercase tracking-wider text-slate-500 text-[10px] flex items-center gap-1">
                      <Network className="w-3 h-3" /> Global Networks
                    </Label>
                    <Button variant="ghost" size="sm" onClick={addGlobalNetwork} className="h-6 text-xs px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">Add Network</Button>
                  </div>
                  {globalConfig.networks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic px-2">No global networks defined.</p>
                  ) : (
                    <div className="space-y-2">
                      {globalConfig.networks.map(net => (
                        <div key={net.id} className="flex gap-2 items-center">
                          <Input 
                            value={net.name} 
                            onChange={e => updateGlobalNetwork(net.id, e.target.value)} 
                            className="h-8 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200 font-mono text-xs flex-1" 
                            placeholder="Network name"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeGlobalNetwork(net.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-slate-100" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                    <Label className="font-bold uppercase tracking-wider text-slate-500 text-[10px] flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Global Named Volumes
                    </Label>
                    <Button variant="ghost" size="sm" onClick={addGlobalVolume} className="h-6 text-xs px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">Add Volume</Button>
                  </div>
                  {globalConfig.volumes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic px-2">No named volumes defined.</p>
                  ) : (
                    <div className="space-y-2">
                      {globalConfig.volumes.map(vol => (
                        <div key={vol.id} className="flex gap-2 items-center">
                          <Input 
                            value={vol.name} 
                            onChange={e => updateGlobalVolume(vol.id, e.target.value)} 
                            className="h-8 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 border-slate-200 font-mono text-xs flex-1" 
                            placeholder="Volume name"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeGlobalVolume(vol.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel: Code Preview */}
      <div className="w-full lg:w-1/2 bg-slate-900 flex flex-col h-[50vh] lg:h-full border-t lg:border-t-0 p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4 shrink-0 px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] uppercase tracking-widest font-mono text-slate-400">docker-compose.yml</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={copyToClipboard} className="h-8 shadow-none bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border-none rounded text-xs">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="default" size="sm" onClick={downloadComposeFile} className="h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 overflow-hidden flex relative px-2">
          <ScrollArea className="w-full h-full text-slate-300 font-mono text-[11px] leading-relaxed">
            <pre>
              <code>{composeFileString}</code>
            </pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
