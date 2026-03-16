# 📦 @omnixys/contracts

> **Shared domain contracts for the Omnixys microservice ecosystem.**

`@omnixys/contracts` defines the **stable, versioned service contracts** shared across all Omnixys microservices.

It contains:

* Domain enums
* Shared DTOs
* Value object interfaces
* Cross-service type definitions

It does **not** contain:

* Business logic
* Infrastructure (Kafka, Logger, Config)
* Framework dependencies
* Prisma models
* GraphQL resolvers

This package represents the **formal contract layer** between services.

---

# 🏗 Architectural Purpose

OmnixysSphere is built as a modular microservice platform .

To ensure:

* Type safety across services
* Event payload consistency
* Federation schema stability
* Predictable versioning
* Clear service boundaries

All shared domain structures are centralized in this package.

This enforces **Contract-Driven Architecture**.

---

# 📁 Package Structure

```text
src/
├── enums/
│   ├── user-type.enum.ts
│   ├── role-type.enum.ts
│   ├── status-type.enum.ts
│   └── ...
├── dto/
│   ├── pagination.dto.ts
│   └── ...
└── index.ts
```

Compiled output:

```text
dist/
  index.js
  index.d.ts
```

---

# 🚀 Installation

## GitHub Packages Setup

Create a `.npmrc` (globally recommended):

```ini
@omnixys:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set your token:

```bash
export NODE_AUTH_TOKEN=ghp_xxxxxxxxx
```

Then install:

```bash
pnpm add @omnixys/contracts
```

---

# 🔐 Authentication

For local publishing or installation you need a GitHub Personal Access Token with:

* `read:packages`
* `write:packages` (for publishing)

In CI, use:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

# 🧠 Usage Example

```ts
import { UserType } from '@omnixys/contracts';

function assignRole(type: UserType) {
  if (type === UserType.ADMIN) {
    // ...
  }
}
```

---

# 🧬 GraphQL Integration

Enums must be registered inside each service:

```ts
import { registerEnumType } from '@nestjs/graphql';
import { UserType } from '@omnixys/contracts';

registerEnumType(UserType, {
  name: 'UserType',
});
```

Contracts does not register GraphQL types automatically by design.

---

# 🔄 Versioning Strategy

This package follows **Semantic Versioning (SemVer)**.

| Change Type                | Version Bump |
| -------------------------- | ------------ |
| Add enum value             | MINOR        |
| Add new type               | MINOR        |
| Remove enum value          | MAJOR        |
| Breaking structural change | MAJOR        |
| Internal fix               | PATCH        |

⚠ Enum values must never be removed in distributed systems unless performing a coordinated MAJOR upgrade.

---

# 🛡 Stability Guarantees

This package is considered:

* Stable
* Infrastructure-agnostic
* Framework-independent
* Backwards-compatible within minor versions

Services must treat it as a formal contract boundary.

---

# 🚫 Design Principles

This package must remain:

* Free of NestJS dependencies
* Free of Kafka clients
* Free of Logger utilities
* Free of Config logic
* Free of Prisma models

If logic is required, it belongs in the respective service.

---

# 🏛 Future Extensions

Planned complementary packages:

```text
@omnixys/events
@omnixys/kafka
@omnixys/logger
@omnixys/config
```

Contracts remains the foundational domain layer.

---

# 📜 License

Licensed under **GPL-3.0-or-later** 

© 2026 Omnixys Technologies

---

# 🧠 Why “contracts”?

This package defines the **formal agreements between services**.

In a distributed microservice system:

* Contracts define trust boundaries
* Versioning prevents runtime drift
* Type safety reduces integration errors
* Events remain consistent across services

It is not just a “types” package —
it is the architectural backbone of inter-service communication.
