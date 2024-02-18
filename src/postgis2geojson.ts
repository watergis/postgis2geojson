import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export type Config = {
  db: any; //DB Settings
  layers: Layer[]; //List of layer to define SQL for GeoJSON
};

export type Layer = {
  name: string;
  geojsonFileName: string; //File path for GeoJSON
  select: string; //SQL for PostGIS
};

export class postgis2geojson {
  private config: Config;
  private readonly pool: Pool;

  constructor(config: Config) {
    this.config = config;
    this.pool = new Pool(config.db);
  }

  run() {
    return new Promise<string[]>((resolve, reject) => {
      this.dump()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async dump() {
    const client: any = await this.pool.connect();
    try {
      const layers = this.config.layers;
      let promises: Promise<string>[] = [];
      layers.forEach((layer: Layer) => {
        promises.push(this.createGeojson(client, layer));
      });
      return Promise.all(promises);
    } finally {
      client.on('drain', client.end.bind(client));
      // client.release();
    }
  }

  createGeojson(client: any, layer: Layer) {
    return new Promise<string>((resolve, reject) => {
      if (!client) {
        reject('No pg client.');
      }
      const parentDir = path.dirname(layer.geojsonFileName);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      const writeStream = fs.createWriteStream(layer.geojsonFileName);
      writeStream.on('error', (err) => {
        reject(err);
      });
      if (!layer.select) {
        reject('No SQL of select statement for this layer.');
      }
      const stream = client.query(layer.select);
      stream
        .then((res: any) => {
          const json = JSON.stringify(res.rows[0].json);
          writeStream.write(json);
          resolve(layer.geojsonFileName);
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  }
}
