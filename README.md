Article Hosting
========

[![Commit checks][Checks badge]][Checks]
[![Open issues][Open issues badge]][Open issues]
[![License][License badge]][License]

It's written in [TypeScript], and uses the [Koa framework][Koa].

Table of contents
-----------------

- [Article Hosting](#article-hosting)
  - [Table of contents](#table-of-contents)
  - [Development](#development)
    - [Running the app](#running-the-app)
    - [Running the tests](#running-the-tests)
    - [Linting](#linting)
  - [Testing](#testing)
      - [Running the scenarios locally](#running-locally)
      - [Running the scenarios on production](#running-on-production)
  - [Operations](#operations)
    - [Releasing to production](#releasing-to-production)
    - [Looking at logs](#looking-at-logs)
    - [Configure images on local machine](#configure-images-on-local-machine)
  - [HLA](#hla)
  - [License](#license)

Development
-----------

<details>

<summary>Requirements</summary>

- [Docker]
- [GNU Make]
- [Node.js v14.6.0]
- [NPM v6.14.6]

</details>

The project contains a [Makefile] which uses [Docker] for development.

### Running the app

To build and run the app for development, execute:

```shell
make dev
```

You can now access the app at <http://localhost:8000>.
Also you can access Minio cloud storage server compatible with Amazon S3 at <http://localhost:9000>.

<details>

<summary>Rebuilding the container</summary>

Static content is attached to the containers as volumes so most updates are visible without a need to rebuild the
container. However, changes to NPM dependencies, for example, require a rebuild. So you may need to execute

```shell
make dev
```

again before running further commands.

</details>

<details>

<summary>Configuring environment variables</summary>

You can create a `.env` file to pass environment variables to the container:

```
DISQUS_API_KEY=...
```

Re-run `make dev` after modifying this file.

</details>

### Running the tests

We use [Jest] to test the app. You can run it by executing:

```shell
make test
```

### Linting

We lint the app with [ESLint]. You can run it by:

```shell
make lint
```

You can fix problems, where possible, by executing:

```shell
make lint:fix
```

Testing
-----------
<details>

<summary>Requirements</summary>

- [Cucumber 6.0.5](https://www.npmjs.com/package/cucumber)
- [Selenium 3.6.0](https://www.selenium.dev/selenium/docs/api/javascript/index.html)
- [geckodriver 1.1.3](https://www.npmjs.com/package/geckodriver)
- [Node.js v14.6.0]
- [NPM v6.14.6]

</details>

The scenarios are written in [Cucumber], using [Selenium] and [Ghekodriver] for Ui test.
All testing related stuff are kept in e2e folder.

### Running the scenarios locally

To build the app ,follow instruction from [#Running the app].
Once the app is up and running,change the app url in [e2e\src\config\index.js] to  <http://localhost:8000>.
You can run the scenarios by :

```shell
npm run test
```
Also you can change the tag of the scenario e.g.@Regression to @Run and run only one scenario.
You will need to change "test" goal as well with the new tag.

For scenarios related to API calls , please use:

```shell
npm run api
```

### Running the scenarios on production

To run the scenarios on production <https://article.hosting/#>,use:

```shell
npm run test
```

## Operations

The application is deployed on a Kubernetes cluster via a Helm chart.

A [production environment] is [updated][production deployments] manually by pushing a tag.

### Releasing to production

Ensure your current reference is [green in CI][build].

Run `make release`.

### Looking at logs

Logs of all Pods are streamed to [AWS CloudWatch][AWS CloudWatch logs] for persistence and searchability.

A [CloudWatch dashboard] graphs log lines representing errors and shows the state of the alarm.

A [monitoring SNS topic] triggers a [lambda function that notifies the Slack #article-hosting-commits channel][monitoring lambda].

## HLA
![Article Hosting HLA](https://github.com/hivereview/article-hosting/blob/main/.adr/assets/hive-article-hosting-hla.jpg?raw=true "Article Hosting HLA")


License
-------

We released this software under the [MIT license][license]. Copyright © 2020 [eLife Sciences Publications, Ltd][eLife].

[AWS CloudWatch logs]: https://aws.amazon.com/
[Build]: https://github.com/hivereview/article-hosting/actions?query=workflow%3ACI
[Checks]: https://github.com/hivereview/article-hosting/actions
[Checks badge]: https://flat.badgen.net/github/checks/hivereview/article-hosting/main?icon=github
[CloudWatch dashboard]: https://aws.amazon.com/
[Docker]: https://www.docker.com/
[eLife]: https://elifesciences.org/
[ESLint]: https://eslint.org/
[GNU Make]: https://www.gnu.org/software/make/
[Jest]: https://jestjs.io/
[Koa]: https://koajs.com/
[License]: LICENSE.md
[License badge]: https://flat.badgen.net/badge/license/MIT/blue
[Makefile]: Makefile
[Monitoring SNS topic]: https://aws.amazon.com/
[Monitoring lambda]: https://aws.amazon.com/
[Node.js v14.6.0]: https://nodejs.org/en/download/
[NPM v6.14.6]: https://www.npmjs.com/
[Open issues]: https://github.com/hivereview/article-hosting/issues?q=is%3Aissue+is%3Aopen
[Open issues badge]: https://flat.badgen.net/github/open-issues/hivereview/article-hosting?icon=github&color=pink
[Production deployments]: https://github.com/hivereview/article-hosting/actions?query=workflow%3AProduction
[Production environment]: https://article.hosting
[TypeScript]: https://www.typescriptlang.org/
