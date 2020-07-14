# postgis2geojson
![](https://github.com/watergis/postgis2geojson/workflows/Node.js%20Package/badge.svg)

This module is to extract GeoJSON files by SQL from PostGIS database.

## Install

```
npm install @watergis/postgis2geojson
```

## Usage

```js
const {postgis2geojson} = require('@watergis/postgis2geojson');
const config = require('./config');

const pg2json = new postgis2geojson(config);
pg2json.run().then(res=>{
    console.log(res);
}).catch(err=>{
    console.log(err);
})
```

`config.js`
```js
module.exports = {
    db: {
        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD,
        host:process.env.DB_HOST,
        post:process.env.DB_PORT,
        database:'narwassco',
    },
    layers : [
      {
          name: 'pipeline',
          geojsonFileName: export_dir + '/pipeline.geojson',
          select: `
          SELECT row_to_json(featurecollection) AS json FROM (
              SELECT
                'FeatureCollection' AS type,
                array_to_json(array_agg(feature)) AS features
              FROM (
                SELECT
                  'Feature' AS type,
                  ST_AsGeoJSON(ST_TRANSFORM(ST_MakeValid(x.geom),4326))::json AS geometry,
                  row_to_json((
                    SELECT p FROM (
                      SELECT
                        x.pipeid as fid,
                        a.name as pipetype,
                        x.pipesize,
                        b.name as material,
                        x.constructiondate,
                        x.insertdate,
                        x.updatedate,
                        x."Town"
                    ) AS p
                  )) AS properties
                FROM pipenet x
                INNER JOIN pipetype a
                ON x.pipetypeid = a.pipetypeid
                INNER JOIN material b
                ON x.materialid = b.materialid
                WHERE NOT ST_IsEmpty(x.geom)
              ) AS feature
            ) AS featurecollection
          `
      },
    ]
}
```

See the test module under `test` directory.

