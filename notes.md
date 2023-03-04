
# Instructions on integration prettier into a project

## Add Files & Folders
create `.husky`
add `pre-commit` file with:
```shell
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx pretty-quick --staged
```

## Install Dependencies
```shell
npm i @ionic/prettier-config --save-dev
npm i @ionic/eslint-config --save-dev 
npm i husky --save-dev --save-exact
```

## Add to `package.json`
```json
  "prettier": "@ionic/prettier-config",
  "eslintConfig": {
    "extends": "@ionic/eslint-config/recommended"
  },
  "lint-fix": "eslint . --ext .ts --fix && prettier \"**/*.ts\" --write",
```