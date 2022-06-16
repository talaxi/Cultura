import {writeFile} from 'fs';

import {name, version} from './package.json';

const targetPath = 'src/environments/environment.prod.ts';
//TODO: GitIgnore this and replace with the secret value
const envConfigFile = `export const environment = {
    production: true,
    CODEREDEMPTIONSECRET: 'DevTest'  
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});