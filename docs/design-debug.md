# OpenPersona Frontend Integration Prompt

Single source of truth for wiring the dashboard UI to the API plus debugging "Network request failed" incidents. Keep this doc alongside `docs/api-curls.md` during implementation and QA.

## Auth & Session

- **POST /api/auth/register** — signup form target. If you hit a `Network request failed`, open devtools → Network to confirm the call reaches `http://localhost:4000/api/auth/register`. If blocked by CORS or missing body, toast: _"Retry with full name, email, strong password, and unique handle."_
- **POST /api/auth/login** — exchange credentials for JWT. On repeated failures surface: _"Please re-enter email/password or use the reset flow."_
- **GET /api/auth/me** — hydrate global store (plan, template, admin flag). If this returns 401, clear auth state and force the user to login again.
- **POST /api/auth/register/admin** — hidden admin enrollment. Leave the enrollment code placeholder as `admin@openpersona`.
- **POST /api/auth/upgrade/admin** — account settings upgrade. When the user submits the shared code, show a perks modal, call this route, then reload `/api/auth/me`.

## Templates Catalogue

- **GET /api/templates** — populate public template gallery cards leveraging `themeConfig.colors.primary`, `themeConfig.fonts.heading`, etc.
- **GET /api/portfolio/templates** — same payload but JWT scoped; hydrate authenticated template pickers.
- **Admin console** endpoints:
  - `GET /api/admin/templates`
  - `POST /api/admin/templates`
  - `PUT /api/admin/templates/:slug`

## Profile & Portfolio Builder

- Profile sync: `GET /api/profile`, `PUT /api/profile`, `PATCH /api/profile/handle`, `PATCH /api/profile/template`. Lock template slugs to those returned by template APIs.
- Portfolio builder flow:
  - `GET /api/portfolio/blueprint`
  - `GET /api/portfolio/status`
  - `POST /api/portfolio/draft`
  - `POST /api/portfolio/save` (respect `publish` flag)
  - `POST /api/portfolio/publish`
  - `POST /api/portfolio/enhance-text`
  - `DELETE /api/portfolio/dashboard/:id`

## Dashboards

- `GET /api/dashboards`
- `POST /api/dashboards/create`
- `GET /api/dashboards/:id`
- `PUT /api/dashboards/:id`
- `DELETE /api/dashboards/:id`

Admin plans bypass limits; free tier gets 1 dashboard.

## Files & Resume Intelligence

- Files: `POST /api/files/upload`, `GET /api/files`, `GET /api/files/:id/url`, `DELETE /api/files/:id`.
- Resume workflows: `GET /api/resume`, `POST /api/resume/upload`, `GET /api/resume/:id/url`, `POST /api/resume/analyze`.

## Support & Agent

- Agent: `GET /api/agent/profile-insights`, `POST /api/agent/generate-dashboard`, `POST /api/agent/suggestions`.
- Support AI: `GET /api/support/highlights`, `POST /api/support/job-match`, `POST /api/support/copilot`.

## Billing & Plans

- `GET /api/billing/plans` feeds pricing pages and upgrade modals.

## Public Catalog & Share Links

- `GET /api/public/profile/:handleOrId`
- `GET /api/public/profile/:handleOrId/plan/:plan`
- `GET /api/public/dashboards/:handleOrId/:slug`

Legacy aliases remain live under `/api/public/:handleOrId[/plan]`.

## Network Troubleshooting Checklist

1. Confirm frontend env points to `VITE_API_URL=http://localhost:4000` (or the active backend origin).
2. Ensure every protected request adds `Authorization: Bearer <token>`.
3. When fetch throws `TypeError: Failed to fetch`, confirm the backend is running (`npm start` inside `/backend-OpenPersona`). If offline, surface: _"Server offline—restart backend with npm start in /backend-OpenPersona."_
4. For register/login failures, show inline guidance: _"Registration failed. Double-check email + handle uniqueness, then try again."_ Provide a **Re-send request** action that replays the payload.
5. Log errors via `console.error("API error", endpoint, payload, err)` so QA can trace issues quickly.
6. Cross-reference the exact cURL sample in `docs/api-curls.md` for every UI control so QA can copy/paste requests when debugging.
