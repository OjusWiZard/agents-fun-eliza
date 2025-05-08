# agents-fun-eliza

[![Build and Package](https://github.com/username/agents-fun-eliza/actions/workflows/binary_builder.yaml/badge.svg)](https://github.com/username/agents-fun-eliza/actions/workflows/binary_builder.yaml)
[![Binary Testing](https://github.com/username/agents-fun-eliza/actions/workflows/binary_testing.yaml/badge.svg)](https://github.com/username/agents-fun-eliza/actions/workflows/binary_testing.yaml)
[![Create Release](https://github.com/username/agents-fun-eliza/actions/workflows/release_creator.yaml/badge.svg)](https://github.com/username/agents-fun-eliza/actions/workflows/release_creator.yaml)
[![Workflow Validation](https://github.com/username/agents-fun-eliza/actions/workflows/workflow-validation.yaml/badge.svg)](https://github.com/username/agents-fun-eliza/actions/workflows/workflow-validation.yaml)

An autonomous agent built on the Eliza framework for the Agents.fun ecosystem. Inspired by the [Meme-ooorr](https://github.com/dvilelaf/memeooorr) project(built on open autonomy aea framework), this repo aims to develop an Elizaos agent that leverages the fun and interactive capabilities of Eliza.

> :warning: **Warning**
> Use this code at your own risk. The repository has not been audited for security vulnerabilities. Running this code could lead to unexpected behavior or asset risks. Please review the [LICENSE](./LICENSE) file for details on usage rights and limitations.

## Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js >=23](https://nodejs.org/en/download)
- [pnpm v9.15.4](https://pnpm.io/installation)
- A deployed [Safe on Base](https://app.safe.global/welcome), for now we recommend running this agent using the quick start framework provided by Open Autonomy, which can be found [here](https://github.com/valory-xyz/docs/blob/main/docs/olas-sdk/index.md).
Please read more about the steps in docs/agents.md

Using these specific versions will help guarantee compatibility and a smoother setup process.

## Overview

agents-fun-eliza is designed to become an autonomous AI agent that can:
- Develop and evolve a unique persona based on its interactions.
- Operate continuously as long as it is running.
- Be extended with new features and tools, opening the gateway to community-driven innovation.
- Summmon memecoins and other fun parts of the agents.fun ecosystem.

For now, the agent uses ETH exclusively; support for other networks (such as CELO) is currently not available.

## How It Works

1. **Download the Quickstart**
  Please refer to the [Agent Quickstart Guide](docs/agents.md).

2. **Set Up Your Environment**
   - Fund your agent with ETH.
   - Provide necessary credentials for a social platform account (e.g., a username, password, and registered email).
   - Supply your OpenAI API key, support for other LLMs will be added soon.
   - Define the persona for your agent by going inside agents-fun-eliza/agents-fun/characters/eliza.character.json. Try and modify the system, bio and lore section as per your liking.

3. **Run the Agent**
   Once everything is set up, run your agent. It will:
   - Remain active 24/7 when running.
   - Dynamically develop its persona based on live interactions.
   - Utilize new tools as they are added to the ecosystem.

## Key Features

- **24/7 Operation:** The agent remains active at all times, continuously engaging with its environment.
- **Dynamic Persona Development:** Watch as your agent evolves its character based on real-time interactions.
- **Modularity:** Easily extendable with additional tools and functionalities contributed by the community.
- **ETH Powered:** Currently, the system uses ETH for all operations and transactions.
- **Cross-Platform Support:** Binaries are built and tested for multiple platforms (Linux, macOS, Windows) and architectures (x64, arm64).
- **Automated Testing:** All binary builds undergo rigorous automated testing to ensure functionality across platforms.

## Agent Development

For more details on how to develop and run the agent, visit the [Agent Development Guide](docs/agents.md). This Eliza agent is powered by the olas sdk backend which provides the modularity of building agents in multiple frameworks and run using olas operate middleware, which provides a robust and scalable platform for deploying and managing agents.

For information on building binary executables for different platforms, see the [Binary Building Guide](docs/binary_building.md).

For details on our automated binary testing process, see the [Binary Testing Guide](docs/binary_testing.md).

## CI/CD Pipeline

Our project uses a comprehensive CI/CD pipeline built with GitHub Actions to automate building, testing, and releasing binaries across multiple platforms:

- **Binary Builder**: Builds cross-platform binaries for Linux, macOS, and Windows
- **Binary Testing**: Automatically tests binaries on their target platforms
- **Release Creator**: Creates GitHub releases with tested binaries
- **Workflow Validation**: Ensures all workflows follow security best practices

### CI/CD Documentation

For detailed information about our CI/CD pipeline, see the following documentation:

- [CI/CD Overview](docs/ci_cd/README.md): Central hub with workflow relationships and glossary
- [Binary Builder Documentation](docs/ci_cd/binary_builder.md): Details on the binary building process
- [Binary Testing Documentation](docs/ci_cd/binary_testing.md): Information on automated testing
- [Release Creator Documentation](docs/ci_cd/release_creator.md): Details on the release process
- [Workflow Validation Documentation](docs/ci_cd/workflow_validation.md): Information on workflow quality checks
- [Contributing to Workflows](docs/ci_cd/contributing.md): Guidelines for modifying or adding workflows

### Release Process

Our automated release process ensures that:

1. Binaries are built for all supported platforms and architectures
2. All binaries undergo rigorous testing on their target platforms
3. Successful builds on the main branch trigger automatic releases
4. Release notes include test results and platform support information

## Acknowledgements

- This project is inspired by and built upon concepts from the [Meme-ooorr](https://github.com/dvilelaf/memeooorr) project.
- Thanks to the following projects for their contributions to the decentralization and DeFi landscapes:
  - [Rari-Capital/solmate](https://github.com/Rari-Capital/solmate)
  - [Uniswap V3 Core](https://github.com/Uniswap/v3-core)
  - [Zelic Reports](https://reports.zellic.io/publications/beefy-uniswapv3/sections/observation-cardinality-observation-cardinality)

## Learn More

For a comprehensive guide and additional resources, visit [Agents.fun](https://agents.fun).

---

Happy coding and enjoy building your autonomous AI agent with agents-fun-eliza!
