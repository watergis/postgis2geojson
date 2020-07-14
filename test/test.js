const {postgis2geojson} = require('../dist/index');
const config = require('./config');

const example = () =>{
    console.time('postgis2geojson');
    const pg2json = new postgis2geojson(config);
    pg2json.run().then(res=>{
        console.log(res);
    }).catch(err=>{
        console.log(err);
    }).finally(()=>{
        console.timeEnd('postgis2geojson');
    })
};

module.exports = example();