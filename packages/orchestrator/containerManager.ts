import Docker, { Container, ContainerCreateOptions } from "dockerode";
import { env } from "./neededEnv";

export type Template = "next" | "node" | "react";

const Image_MAP: Record<Template, string> = {
  next: "bishalmondaldev/demo_node-dev:latest",
  node: "bishalmondaldev/demo_node-dev:latest",
  react: "bishalmondaldev/demo_node-dev:latest",
};

export interface ContainerConfig {
  userId: string;
  projectId: string;
  template: Template;
  cpu?: number;
  memoryMB?: number;
}

export interface ContainerInfo {
  id: string;
  name: string;
  status: "running" | "stopped" | "created" | "paused";
  created: Date;
}

export class ContainerManager {
  private docker: Docker;
  // private NGINX_BASE_DIR = path.join(__dirname, "../../nginx/conf.d");
  // private NGINX_CONTAINER_NAME = "aipp-nginx";
  // private NGINX_PORT = 80;

  constructor() {
    this.docker = env.DOCKER_HOST
      ? new Docker({ host: env.DOCKER_HOST })
      : new Docker({ socketPath: env.DOCKER_SOCKET });
  }
  //   nginxConfText(
  //     containerAlias: string,
  //     hostName: string,
  //     internalPort: number
  //   ) {
  //     return `
  // server {
  //   listen 80;
  //   server_name ${hostName};

  //   location / {
  //     proxy_pass http://${containerAlias}:${internalPort};
  //     proxy_set_header Host $host;
  //     proxy_set_header X-Real-IP $remote_addr;
  //     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  //     proxy_http_version 1.1;
  //     proxy_set_header Upgrade $http_upgrade;
  //     proxy_set_header Connection "upgrade";
  //     proxy_read_timeout 3600;
  //     proxy_send_timeout 3600;
  //   }
  // }
  // `.trim();
  //   }

  // Generate consistent container names[web:58]
  getContainerName(userId: string, projectId: string): string {
    return `aipp-${userId}-${projectId}`;
  }

  // Generate volume names for persistence
  getVolumeName(userId: string, projectId: string): string {
    return `aipp_vol_${userId}_${projectId}`;
  }

  // Create isolated network for user containers[web:61]
  async ensureUserNetwork(userId: string): Promise<string> {
    const networkName = `aipp_net_${userId}`;

    try {
      const networks = await this.docker.listNetworks({
        filters: { name: [networkName] } as any,
      });

      if (networks.length === 0) {
        await this.docker.createNetwork({
          Name: networkName,
          Driver: "bridge",
          Internal: true,
          IPAM: {
            Config: [
              { Subnet: `172.${20 + (userId.charCodeAt(0) % 235)}.0.0/16` },
            ],
          },
        });
        console.log(`✅ Created network: ${networkName}`);
      }
      return networkName;
    } catch (error) {
      console.error(`❌ Failed to create network ${networkName}:`, error);
      throw error;
    }
  }

  // Create volume for persistent storage[web:58]
  async ensureVolume(volumeName: string): Promise<void> {
    try {
      await this.docker.getVolume(volumeName).inspect();
      console.log(`✅ Volume ${volumeName} already exists`);
    } catch {
      await this.docker.createVolume({ Name: volumeName });
      console.log(`✅ Created volume: ${volumeName}`);
    }
  }

  // Pull image if not exists[web:58]
  async ensureImage(imageName: string): Promise<void> {
    try {
      await this.docker.getImage(imageName).inspect();
      console.log(`✅ Image ${imageName} ready`);
    } catch {
      console.log(`⬇️ Pulling image: ${imageName}...`);

      const stream = await this.docker.pull(imageName);

      await new Promise<void>((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err) => {
          if (err) reject(err);
          else {
            console.log(`✅ Pulled image: ${imageName}`);
            resolve();
          }
        });
      });
    }
  }

  // Find container by name[web:69]
  async findContainer(containerName: string): Promise<Container | null> {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: { name: [containerName] } as any,
      });

      const containerInfo = containers.find((c) =>
        c.Names?.some((name) => name.includes(containerName))
      );

      return containerInfo ? this.docker.getContainer(containerInfo.Id) : null;
    } catch (error) {
      console.error(`❌ Error finding container ${containerName}:`, error);
      return null;
    }
  }

  // Create container with security hardening[web:61][web:58]
  async createContainer(config: ContainerConfig): Promise<Container> {
    const { userId, projectId, template, cpu = 1, memoryMB = 512 } = config;

    const containerName = this.getContainerName(userId, projectId);
    const volumeName = this.getVolumeName(userId, projectId);
    const imageName = Image_MAP[template];

    // Ensure prerequisites
    await this.ensureImage(imageName);
    await this.ensureVolume(volumeName);
    const networkName = await this.ensureUserNetwork(userId);

    const createOptions: ContainerCreateOptions = {
      name: containerName,
      Image: imageName,
      Tty: true,
      User: "1001:1001", // Non-root user for security
      WorkingDir: "/workspace",
      Cmd: ["bash", "-lc", "while sleep 3600; do :; done"],

      Labels: {
        "aipp.userId": userId,
        "aipp.projectId": projectId,
        "aipp.template": template,
        "aipp.created": new Date().toISOString(),
      },

      HostConfig: {
        // Mount volume for persistence
        Mounts: [
          {
            Target: "/workspace",
            Source: volumeName,
            Type: "volume",
            ReadOnly: false,
          },
        ],

        // Security hardening[web:61]
        Privileged: false,
        ReadonlyRootfs: false,
        SecurityOpt: ["no-new-privileges:true"],
        CapDrop: ["ALL"],

        // Resource limits
        NanoCpus: cpu * 1e9,
        Memory: memoryMB * 1024 * 1024,
        PidsLimit: 512,
        OomKillDisable: false,

        // Network isolation
        NetworkMode: networkName,

        // No port exposure by default
        PortBindings: {},
        PublishAllPorts: false,
      },
    };

    try {
      const container = await this.docker.createContainer(createOptions);
      console.log(`✅ Created container: ${containerName}`);
      return container;
    } catch (error) {
      console.error(`❌ Failed to create container ${containerName}:`, error);
      throw error;
    }
  }

  // Start container[web:60][web:66]
  async startContainer(config: ContainerConfig): Promise<ContainerInfo> {
    const containerName = this.getContainerName(
      config.userId,
      config.projectId
    );

    let container = await this.findContainer(containerName);

    // Create if doesn't exist
    if (!container) {
      container = await this.createContainer(config);
    }

    const inspect = await container.inspect();

    // Start if not running[web:66]
    if (!inspect.State.Running) {
      await container.start();
      console.log(`✅ Started container: ${containerName}`);
    } else {
      console.log(`ℹ️  Container ${containerName} already running`);
    }

    const updatedInspect = await container.inspect();

    return {
      id: updatedInspect.Id,
      name: updatedInspect.Name,
      status: updatedInspect.State.Running ? "running" : "stopped",
      created: new Date(updatedInspect.Created),
    };
  }

  // Stop container[web:58][web:68]
  async stopContainer(userId: string, projectId: string): Promise<void> {
    const containerName = this.getContainerName(userId, projectId);
    const container = await this.findContainer(containerName);

    if (!container) {
      console.log(`ℹ️  Container ${containerName} not found`);
      return;
    }

    const inspect = await container.inspect();

    if (inspect.State.Running) {
      await container.stop({ t: 10 }); // 10 second graceful timeout
      console.log(`✅ Stopped container: ${containerName}`);
    } else {
      console.log(`ℹ️  Container ${containerName} already stopped`);
    }
  }

  // Remove container[web:58]
  async removeContainer(userId: string, projectId: string): Promise<void> {
    const containerName = this.getContainerName(userId, projectId);
    const container = await this.findContainer(containerName);

    if (!container) {
      console.log(`ℹ️  Container ${containerName} not found`);
      return;
    }

    await container.remove({ force: true });
    console.log(`✅ Removed container: ${containerName}`);
  }

  // Get container status[web:61]
  async getContainerStatus(
    userId: string,
    projectId: string
  ): Promise<ContainerInfo | null> {
    const containerName = this.getContainerName(userId, projectId);
    const container = await this.findContainer(containerName);

    if (!container) return null;

    const inspect = await container.inspect();

    return {
      id: inspect.Id,
      name: inspect.Name,
      status: inspect.State.Running
        ? "running"
        : inspect.State.Paused
          ? "paused"
          : "stopped",
      created: new Date(inspect.Created),
    };
  }

  // List all user containers[web:61]
  async listUserContainers(userId: string): Promise<ContainerInfo[]> {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: [`aipp.userId=${userId}`],
        } as any,
      });

      return containers.map((c) => ({
        id: c.Id,
        name: c.Names[0],
        status: c.State as any,
        created: new Date(c.Created * 1000),
      }));
    } catch (error) {
      console.error(`❌ Error listing containers for user ${userId}:`, error);
      return [];
    }
  }
}
