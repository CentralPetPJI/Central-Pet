# Architecture

## Overview

`central-pet-front/` is a single-page React frontend inside a pnpm workspace. The runtime entry point is `central-pet-front/src/main.tsx`, which mounts `App` inside `BrowserRouter` and loads global styles from `central-pet-front/src/index.css`.

## Top-Level Flow

`central-pet-front/src/App.tsx` is the main shell. It:

- Reads persisted pets through `getStoredPets()` from `central-pet-front/src/Mocks/PetsStorage.ts`.
- Derives `speciesCounts` for the home sidebar.
- Resolves the active route tree with `useRoutes()` from `central-pet-front/src/routes.tsx`.
- Renders the shared frame: `Header`, route content, optional `SidePanel`, and `Footer`.

The home page (`central-pet-front/src/Pages/MainPage.tsx`) also reads `getStoredPets()` directly and passes the data into `Carousel`. The pet register and profile pages are route-driven views under `central-pet-front/src/Pages/Pet/`.

## Routing And Entry Points

`central-pet-front/src/routes.tsx` centralizes the route map:

- `/` -> `MainPage`
- `/pets/new` -> `PetPersonalityRegisterPage`
- `/pets/:petId` -> `PetPersonalityProfilePage`
- `/pets/:petId/edit` -> `PetPersonalityRegisterPage`
- `/login` exists as a route definition but has no element attached yet

The register page resolves the `petId` param, normalizes it, and forwards it to `PetRegisterForm`. The profile page performs the same param parsing and then builds its view model from saved profile data or fallback pet summary data.

## Data Flow

The repo is mostly client-side and local-state driven:

- Seed pet cards come from `central-pet-front/src/Mocks/Pet.tsx`.
- Form defaults and validation come from `central-pet-front/src/Mocks/PetRegisterFormMock.ts`.
- Behavior options come from `central-pet-front/src/Mocks/PetPersonalityOptions.tsx`.
- Persistence uses browser `localStorage` in `central-pet-front/src/Mocks/PetsStorage.ts`.

`PetRegisterForm` is the main mutation point. It:

- Initializes from saved profile data, an existing pet, or the default form state.
- Stores field updates and selected personalities into `localStorage`.
- Validates with the Zod schema in `PetRegisterFormMock.ts`.
- Converts the form data into a `Pet` record with `buildPetFromRegisterForm()`.
- Saves both the flattened pet summary and the richer profile record.

The profile page reverses that flow by reading `getPetProfileById()` first, then falling back to `getPetById()` and reconstructing a display model from the saved summary.

## Layers And Boundaries

The code separates into a few practical layers:

- `central-pet-front/src/Layout/` provides the persistent app shell.
- `central-pet-front/src/Pages/` owns route-level composition.
- `central-pet-front/src/Components/` contains reusable UI, including feature-scoped subtrees like `PetRegister/` and `PetProfile/`.
- `central-pet-front/src/Mocks/` acts as the data/persistence adapter layer for this stage of the project.
- `central-pet-front/src/Models/` holds shared TypeScript interfaces such as `Pet` and `Photo`.

This is not a fully layered backend-style architecture. There is no API client, server-side service layer, or global state manager in the inspected code. Data ownership is split between route params, component state, and `localStorage`.

## Patterns And Gaps

Observed patterns:

- Feature-oriented component grouping by domain folder.
- Colocated component tests such as `central-pet-front/src/Components/Carousel.test.tsx`.
- Route-level composition in pages, with smaller presentational components underneath.
- Heavy use of `PascalCase` file names for React components.

Notable absences:

- No dedicated backend or fetch layer in the repository.
- No centralized domain store beyond `localStorage` helpers.
- No shared form controller abstraction; form state is managed directly inside `PetRegisterForm`.
- The `login` route exists in `routes.tsx`, but there is no implemented page behind it yet.
