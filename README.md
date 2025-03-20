# tari.js

This project provides a unified TypeScript library to connect and send requests to a Tari wallet. It's intended for web application developers that want to interact with a Tari wallet (connect, get substates, submit transactions, etc.).

Tari wallets supported:
* Tari Wallet Daemon
* MetaMask through the [tari-snap](https://github.com/tari-project/tari-snap)

An example site (under the `example` folder) contains a web project that allows the user to connect to any type of Tari wallet and perform common actions.

Please read the [TODO](TODO.md) file for upcoming features.

## Library building

You must have the [tari-dan](https://github.com/tari-project/tari-dan) repo cloned at the same folder level as this repo.

### Option 1: Local Build

To build the library locally:
First you must install [proto](https://moonrepo.dev/proto) to manage node and pnpm versions 
```shell
proto use
pnpm install
moon tarijs:build
```

The bundled files for deployment or publication will be located under the `dist` folder.

### Option 2: Docker Build

Alternatively, you can build the library using Docker:

```shell
# Build the Docker image
docker build -t tarijs .

# Run the container and copy the built files
docker create --name tarijs-build tarijs
docker cp tarijs-build:/app/packages/tarijs/dist ./dist
docker rm tarijs-build
```

This will create the build artifacts in your local `dist` directory. The Docker build automatically handles all dependencies and build requirements.

## Running the example site

To run the example site you will need to:
* Compile the library following the previous section.
* Have access to a Tari Wallet Daemon and to the Tari MetaMask Snap.
* Copy the `example/.env.example` file to `example/.env` and edit the correct environment variable values.

To run in development mode, in the packages/tarijs folder:
```shell
cd example
moon tarijs:build
pnpm run dev
```

For building and distribution,  in the packages/tarijs folder
```shell
cd example
moon tarijs:build
```
The distribution files will be under the `example/dist` folder. 

## Documentation

This monorepo includes a documentation site located in the `docusaurus` folder.  It's built using [Docusaurus](https://docusaurus.io/) and generates a static website.

### Modifying the Documentation

To start the documentation site:

```bash
$ moon tari-docs:start
```

This will open the documentation site in your browser at `http://localhost:3000/tari.js/`

You can now update the documentation by editing files in the `docusaurus/tari-docs/docs/` folder. Changes will be reflected automatically.

### Publishing documentation

The documentation is hosted on GitHub Pages and served from the `/docs` folder of the `gh-pages` branch. The `documentation-deploy.yml` workflow defines the deployment process.
