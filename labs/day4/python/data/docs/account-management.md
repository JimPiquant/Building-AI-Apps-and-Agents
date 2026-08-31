# Account Management

Contoso developer accounts are managed through the developer portal.

## Account structure

- One **account** per organization
- One or more **users** per account, each with a role (`owner`, `admin`, `developer`, `viewer`)
- One or more **projects** per account, each with its own API keys
- **Billing** is at the account level, not the project level

## Roles

| Role | Manage billing | Manage users | Generate keys | Read docs |
|---|---|---|---|---|
| Owner | ✓ | ✓ | ✓ | ✓ |
| Admin | | ✓ | ✓ | ✓ |
| Developer | | | ✓ | ✓ |
| Viewer | | | | ✓ |

Only owners can add or remove other owners.

## Adding a user

1. Go to **Settings → Users**
2. Click **Invite user**
3. Enter their email address and select a role
4. They receive an email invitation valid for 7 days

## Changing your plan

Plan changes are billed at the start of the next billing cycle unless you're
upgrading, in which case they take effect immediately with a prorated charge. See
[billing.md](billing.md) for details.

## Closing an account

Contact support. Closing an account is not self-serve — we need to ensure all
outstanding invoices are settled and all data is exported per your retention policy.
