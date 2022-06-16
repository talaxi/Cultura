import {writeFile} from 'fs';

import {name, version} from './package.json';

const targetPath = './src/environments/environment.ts';

const envConfigFile = `export const environment = {
    production: false,
    CODEREDEMPTIONSECRET: '${process.env.CODEREDEMPTIONSECRET}'    
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});